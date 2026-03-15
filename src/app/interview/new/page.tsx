"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";

export default function NewInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [candidateName, setCandidateName] = useState("");
  const [role, setRole] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [questionsCount, setQuestionsCount] = useState("5");
  const [topics, setTopics] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          role,
          language,
          level,
          questionsCount: parseInt(questionsCount, 10),
          topics,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      // Redirect to the newly created interview page
      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl min-h-[calc(100vh-10rem)] flex flex-col justify-center">
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Interview Setup</h1>
          <span className="text-sm font-medium text-muted-foreground">Step 1/2</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/2 transition-all duration-1000"></div>
        </div>
      </div>
      
      <Card className="shadow-xl border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="bg-muted/30 pb-8">
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Create New Interview
          </CardTitle>
          <CardDescription className="text-base">
            Tailor questions to the candidate&apos;s specific role and experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-8">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="candidateName" className="font-semibold">Candidate Full Name</Label>
              <Input 
                id="candidateName" 
                placeholder="e.g. John Doe" 
                required 
                className="h-11 shadow-sm"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold">Target Role</Label>
                <Input 
                  id="role" 
                  placeholder="e.g. Frontend Engineer" 
                  required 
                  className="h-11 shadow-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="font-semibold">Tech Stack</Label>
                <Input 
                  id="language" 
                  placeholder="e.g. React.js, Python" 
                  required 
                  className="h-11 shadow-sm"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level" className="font-semibold">Experience Level</Label>
                <Select value={level} onValueChange={setLevel} required>
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner / Junior (0-2y)</SelectItem>
                    <SelectItem value="intermediate">Intermediate / Mid (3-5y)</SelectItem>
                    <SelectItem value="advanced">Advanced / Senior (5y+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionCount" className="font-semibold">Interview Length</Label>
                <Select value={questionsCount} onValueChange={setQuestionsCount}>
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Quick (5 Questions)</SelectItem>
                    <SelectItem value="10">Standard (10 Questions)</SelectItem>
                    <SelectItem value="15">Extended (15 Questions)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topics" className="font-semibold">Must-Cover Topics (Optional)</Label>
              <Input 
                id="topics" 
                placeholder="e.g. Hooks, Context API, DB Optimization" 
                className="h-11 shadow-sm"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Job Description / Context (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Paste key JD points for better AI personalization..." 
                className="min-h-[100px] shadow-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 pb-8 px-8 border-t bg-muted/10">
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full sm:w-auto order-2 sm:order-1" 
              onClick={() => router.back()} 
              disabled={loading}
            >
              Back to Dashboard
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:flex-1 h-11 shadow-md hover:shadow-lg transition-all order-1 sm:order-2" 
              disabled={loading || !level}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Questions...
                </>
              ) : "Start Generation ➔"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
