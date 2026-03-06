import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from("interview_summary")
      .select("*")
      .eq("interview_id", interviewId)
      .single();

    if (existingSummary) {
      return NextResponse.json({ success: true, summary: existingSummary });
    }

    // Fetch Interview Details
    const { data: interviewData, error: interviewError } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .eq("user_id", user.id) // Security check
      .single();

    if (interviewError || !interviewData) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Fetch Questions, Scores, and Notes
    const { data: questionsData, error: questionsError } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("interview_id", interviewId)
      .order("order_index", { ascending: true });

    if (questionsError || !questionsData) {
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }

    const compiledData = questionsData.map((q) => ({
      question: q.question,
      difficulty: q.difficulty,
      score: q.score,
      interviewer_notes: q.notes,
    }));

    // Prepare Gemini Prompt
    const prompt = `
      You are an expert technical interviewer evaluating a candidate based on an interview transcript.
      
      Candidate Profile:
      - Name: ${interviewData.candidate_name}
      - Role: ${interviewData.role}
      - Experience Level: ${interviewData.level}
      - Primary Stack: ${interviewData.language}
      - Total Score: ${interviewData.total_score}/${interviewData.max_score} (${interviewData.percentage}%)

      Interview Data (Questions, Scores (0-10), and Interviewer Notes):
      ${JSON.stringify(compiledData, null, 2)}

      Task: Based on the scores and notes, generate a comprehensive evaluation summary.
      
      Return output STRICTLY as a JSON object matching this schema (do NOT use markdown \`\`\`json block):
      {
        "summary": "A 2-3 paragraph professional summary of their performance.",
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
        "recommendation": "Must be exactly one of: 'Strong Hire', 'Hire', 'Maybe', or 'Reject'"
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let outputText = result.response.text();

    outputText = outputText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let evaluation;
    try {
      evaluation = JSON.parse(outputText);
    } catch (e) {
      console.error("Evaluation Parse Error:", outputText);
      return NextResponse.json({ error: "AI returned invalid format", raw: outputText }, { status: 500 });
    }

    // Insert into DB
    const { data: finalSummary, error: insertError } = await supabase
      .from("interview_summary")
      .insert({
        interview_id: interviewId,
        summary: evaluation.summary,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        recommendation: evaluation.recommendation,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Summary Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to save summary" }, { status: 500 });
    }

    return NextResponse.json({ success: true, summary: finalSummary });
  } catch (error: any) {
    console.error("Evaluation API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
