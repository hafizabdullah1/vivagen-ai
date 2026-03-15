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
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="space-y-1">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold px-2 py-0">Active Session</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {interview.candidate_name}
          </h1>
          <p className="text-muted-foreground font-medium">
            {interview.role} <span className="mx-1 opacity-20">•</span> {interview.language}
          </p>
        </div>
        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
          <div className="text-xs font-bold text-primary uppercase tracking-tighter">Current Score</div>
          <div className="text-4xl font-black text-primary">
            {runningScore} <span className="text-sm font-bold text-muted-foreground">/ {runningMax}</span>
          </div>
        </div>
      </div>

      <div className="mb-10 space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Progress ({currentIndex + 1} / {questions.length})</span>
          <span className="text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-3 rounded-full bg-muted shadow-inner" />
      </div>

      <Card className="border-none shadow-2xl ring-1 ring-primary/10 overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30 dark:bg-muted/10 pb-10 pt-8 px-6 md:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize text-xs font-bold px-3">{currentQ.type}</Badge>
              <Badge variant="outline" className="bg-background text-xs font-bold px-3 border-orange-500/30 text-orange-600">
                Difficulty: {currentQ.difficulty}/10
              </Badge>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-9 px-4 rounded-full text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
              onClick={handleRegenerate}
              disabled={regenerating || saving}
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {regenerating ? "Regenerating..." : "Regenerate Question"}
            </Button>
          </div>
          <CardTitle className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/80">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-10 px-6 md:px-10 space-y-8 pb-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Candidate Score</Label>
              <span className="text-xs font-black bg-primary/10 text-primary px-2 py-1 rounded">Scale 0-10</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreValue) => (
                <Button 
                  key={scoreValue} 
                  variant={currentScore === scoreValue ? "default" : "outline"}
                  onClick={() => setCurrentScore(scoreValue)}
                  className={`w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl text-lg font-black transition-all duration-200 ${
                    currentScore === scoreValue 
                      ? 'scale-110 shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  {scoreValue}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Detailed Feedback & Notes</Label>
            </div>
            <Textarea 
              id="notes" 
              placeholder="What were the key takeaways from the candidate's response?" 
              className="min-h-[160px] md:min-h-[200px] text-base p-4 rounded-2xl bg-muted/20 border-muted focus:bg-background transition-all"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t bg-muted/30 dark:bg-muted/10 p-6 md:px-10">
          <Button 
            variant="ghost" 
            onClick={handlePrevious} 
            disabled={currentIndex === 0 || saving}
            className="w-full sm:w-auto rounded-full font-bold"
          >
            Previous Question
          </Button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {isLastQuestion ? (
              <Button 
                size="lg" 
                className="w-full sm:px-10 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20" 
                onClick={handleEndInterview}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Evaluate & End ➔"}
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="w-full sm:px-10 rounded-full font-bold shadow-lg shadow-primary/20" 
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Next Question ➔"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {!isLastQuestion && (
        <div className="mt-12 flex justify-center">
          <Button variant="link" className="text-muted-foreground hover:text-destructive transition-colors text-xs font-bold uppercase tracking-widest" onClick={handleEndInterview}>
            Exit and Evaluate Early
          </Button>
        </div>
      )}
    </div>
  );
}
