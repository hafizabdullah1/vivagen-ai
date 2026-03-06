"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

type Interview = {
  id: string;
  candidate_name: string;
  role: string;
  language: string;
  level: string;
};

type Question = {
  id: string;
  question: string;
  type: string;
  difficulty: number;
  score: number | null;
  notes: string | null;
  order_index: number;
};

export default function ActiveInterviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function fetchInterviewData() {
      const supabase = createClient();

      // Fetch Interview Setup
      const { data: interviewData, error: interviewError } = await supabase
        .from("interviews")
        .select("*")
        .eq("id", id)
        .single();

      if (interviewError || !interviewData) {
        console.error("Failed to load interview", interviewError);
        router.push("/dashboard");
        return;
      }

      setInterview(interviewData);

      // Fetch Questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("interview_id", id)
        .order("order_index", { ascending: true });

      if (questionsError || !questionsData) {
        console.error("Failed to load questions", questionsError);
        return;
      }

      setQuestions(questionsData);
      
      // Init current state
      if (questionsData.length > 0) {
        setCurrentScore(questionsData[0].score);
        setCurrentNotes(questionsData[0].notes || "");
      }

      setLoading(false);
    }

    fetchInterviewData();
  }, [id, router]);

  async function saveCurrentProgress() {
    if (!questions[currentIndex]) return;
    setSaving(true);
    
    const supabase = createClient();
    const q = questions[currentIndex];

    // Update local state first for fast UI
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...q,
      score: currentScore,
      notes: currentNotes
    };
    setQuestions(updatedQuestions);

    // Save to DB
    await supabase
      .from("interview_questions")
      .update({ score: currentScore, notes: currentNotes })
      .eq("id", q.id);

    setSaving(false);
  }

  async function handleNext() {
    await saveCurrentProgress();
    
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentScore(questions[nextIndex].score);
      setCurrentNotes(questions[nextIndex].notes || "");
    }
  }

  async function handlePrevious() {
    await saveCurrentProgress();
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentScore(questions[prevIndex].score);
      setCurrentNotes(questions[prevIndex].notes || "");
    }
  }

  async function handleRegenerate() {
    if (!questions[currentIndex]) return;
    setRegenerating(true);
    
    try {
      const response = await fetch("/api/regenerate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          currentQuestionContext: questions[currentIndex].question,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.question) {
        // Update local array at current index
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = data.question;
        setQuestions(updatedQuestions);
        
        // Reset local form state
        setCurrentScore(null);
        setCurrentNotes("");
      } else {
        console.error("Failed to regenerate:", data.error);
        alert(data.error || "Failed to regenerate question");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleEndInterview() {
    await saveCurrentProgress();
    
    // Calculate final scores
    let totalScore = 0;
    let maxScore = questions.length * 10;
    
    questions.forEach(q => {
      totalScore += (q.score || 0);
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const supabase = createClient();
    await supabase
      .from("interviews")
      .update({ total_score: totalScore, max_score: maxScore, percentage })
      .eq("id", id);

    // Redirect to Summary Generation Page
    router.push(`/interview/${id}/summary`);
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-4 text-xl font-medium">Loading Interview Setup...</span>
      </div>
    );
  }

  if (!interview || questions.length === 0) return null;

  const totalCompleted = questions.filter(q => q.score !== null).length;
  const progressPercent = (totalCompleted / questions.length) * 100;
  
  // Running score calc
  const runningScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const runningMax = questions.length * 10;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview: {interview.candidate_name}</h1>
          <p className="text-muted-foreground">{interview.role} • {interview.language}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Running Score</div>
          <div className="text-3xl font-bold text-primary">
            {runningScore} <span className="text-sm text-muted-foreground font-normal">/ {runningMax}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progressPercent)}% Completed</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Card className="border-2 border-primary/20 shadow-lg relative">
        <CardHeader className="bg-primary/5 pb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background capitalize">{currentQ.type}</Badge>
              <Badge variant="secondary">Difficulty: {currentQ.difficulty}/10</Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-background text-muted-foreground hover:text-primary"
              onClick={handleRegenerate}
              disabled={regenerating || saving}
            >
              {regenerating ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Regenerate
            </Button>
          </div>
          <CardTitle className="text-xl leading-relaxed whitespace-pre-wrap">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Candidate Score (0-10)</Label>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreValue) => (
                <Button 
                  key={scoreValue} 
                  variant={currentScore === scoreValue ? "default" : "outline"}
                  onClick={() => setCurrentScore(scoreValue)}
                  className={`w-10 h-10 p-0 rounded-full ${currentScore === scoreValue ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {scoreValue}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="notes" className="text-base font-semibold">Interviewer Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Record candidate's response highlights, missed points, or red flags..." 
              className="min-h-[120px] resize-y"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 py-4">
          <Button 
            variant="ghost" 
            onClick={handlePrevious} 
            disabled={currentIndex === 0 || saving}
          >
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button 
              size="lg" 
              className="px-8 bg-green-600 hover:bg-green-700 text-white" 
              onClick={handleEndInterview}
              disabled={saving}
            >
              {saving ? "Saving..." : "Evaluate Interview ➔"}
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="px-8" 
              onClick={handleNext}
              disabled={saving}
            >
              {saving ? "Saving..." : "Next Question ➔"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {!isLastQuestion && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive" onClick={handleEndInterview}>
            End Interview Early
          </Button>
        </div>
      )}
    </div>
  );
}
