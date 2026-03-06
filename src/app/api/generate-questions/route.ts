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

    const body = await req.json();
    const { candidateName, role, level, language, description, questionsCount, topics } = body;

    if (!role || !level || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ADMIN_EMAIL = "habdullah4510@gmail.com";
    const isAdmin = user.email === ADMIN_EMAIL;
    
    // Check usage limits if not admin
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    
    if (!isAdmin) {
      const { data: usageData } = await supabase
        .from("usage_tracking")
        .select("interviews_used")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .single();
        
      const used = usageData?.interviews_used || 0;
      
      if (used >= 10) {
        return NextResponse.json({ 
          error: "Free tier limit reached. You can only generate 10 interviews per month." 
        }, { status: 403 });
      }
    }

    // Insert interview record first
    const { data: interviewData, error: interviewError } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        candidate_name: candidateName,
        role,
        level,
        language,
        description,
      })
      .select()
      .single();

    if (interviewError || !interviewData) {
      console.error("Supabase insert error:", interviewError);
      return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
    }

    // Prepare Gemini Prompt
    const prompt = `
      You are an expert technical interviewer. Generate exactly ${questionsCount || 5} interview questions for a candidate.
      
      Candidate Profile:
      - Role: ${role}
      - Experience Level: ${level}
      - Primary Language/Stack: ${language}
      ${description ? `- Context/Job Description: ${description}` : ""}
      ${topics ? `- Specific Topics to cover: ${topics}` : ""}

      Requirements for questions:
      - A mix of conceptual, scenario-based, and practical problem-solving questions.
      - Difficulty must perfectly match the '${level}' experience level.
      - Return the output strictly as a JSON array of objects, with no markdown formatting, no \`\`\`json block, just the raw array.

      Output Schema Example:
      [
        {
          "question": "Explain how event loop works...",
          "type": "conceptual",
          "difficulty": 6
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let outputText = result.response.text();

    // Clean up markdown code blocks if Gemini ignores instructions
    outputText = outputText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(outputText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", outputText);
      return NextResponse.json({ error: "AI returned invalid format", raw: outputText }, { status: 500 });
    }

    // Map to Supabase schema
    const questionsToInsert = generatedQuestions.map((q: any, index: number) => ({
      interview_id: interviewData.id,
      question: q.question,
      type: q.type || "general",
      difficulty: q.difficulty || 5,
      order_index: index,
    }));

    const { error: questionsError } = await supabase.from("interview_questions").insert(questionsToInsert);

    if (questionsError) {
      console.error("Supabase questions insert error:", questionsError);
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
    }

    // Increment Usage if not admin
    if (!isAdmin) {
      // Upsert usage for the current month
      const { data: existingUsage } = await supabase
        .from("usage_tracking")
        .select("id, interviews_used")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .single();

      if (existingUsage) {
        await supabase
          .from("usage_tracking")
          .update({ interviews_used: existingUsage.interviews_used + 1 })
          .eq("id", existingUsage.id);
      } else {
        await supabase
          .from("usage_tracking")
          .insert({
            user_id: user.id,
            month: currentMonth,
            interviews_used: 1
          });
      }
    }

    return NextResponse.json({ success: true, interviewId: interviewData.id });
  } catch (error: any) {
    console.error("Generation API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
