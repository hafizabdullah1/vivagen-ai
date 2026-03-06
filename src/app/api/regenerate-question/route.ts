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

    const { questionId, currentQuestionContext } = await req.json();

    if (!questionId || !currentQuestionContext) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Security check: ensure question belongs to user's interview
    const { data: qData, error: qError } = await supabase
      .from("interview_questions")
      .select("*, interviews!inner(user_id, role, level, language, description)")
      .eq("id", questionId)
      .single();

    if (qError || !qData || qData.interviews.user_id !== user.id) {
      return NextResponse.json({ error: "Question not found or unauthorized" }, { status: 404 });
    }

    const interview = qData.interviews;

    const prompt = `
      You are an expert technical interviewer. The current question was: "${currentQuestionContext}".
      The candidate requested a different question.
      
      Candidate Profile:
      - Role: ${interview.role}
      - Experience Level: ${interview.level}
      - Primary Stack/Language: ${interview.language}
      ${interview.description ? `- Context/Job Description: ${interview.description}` : ""}

      Generate ONE new, distinct interview question that is different from the previous one, but still fits the candidate's profile and difficulty level.

      Return the output STRICTLY as a single JSON object. No markdown, no arrays.
      Schema Example:
      {
        "question": "Explain how event loop works...",
        "type": "conceptual",
        "difficulty": 6
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let outputText = result.response.text();

    outputText = outputText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let newQuestionData;
    try {
      newQuestionData = JSON.parse(outputText);
    } catch (e) {
      console.error("Failed to parse regenerated question JSON:", outputText);
      return NextResponse.json({ error: "AI returned invalid format", raw: outputText }, { status: 500 });
    }

    // Update DB
    const { data: updatedQuestion, error: updateError } = await supabase
      .from("interview_questions")
      .update({
        question: newQuestionData.question,
        type: newQuestionData.type || "general",
        difficulty: newQuestionData.difficulty || qData.difficulty,
        score: null, // Reset score and notes for new question
        notes: null
      })
      .eq("id", questionId)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase question update error:", updateError);
      return NextResponse.json({ error: "Failed to update question in database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error: any) {
    console.error("Regeneration API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
