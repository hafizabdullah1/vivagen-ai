"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6 h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary w-1/3 transition-all"></div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Interview</CardTitle>
          <CardDescription>
            Provide candidate details to generate AI-tailored interview questions.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input 
                id="candidateName" 
                placeholder="e.g. John Doe" 
                required 
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role / Position</Label>
                <Input 
                  id="role" 
                  placeholder="e.g. Frontend Engineer" 
                  required 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Primary Stack/Language</Label>
                <Input 
                  id="language" 
                  placeholder="e.g. React.js, Python" 
                  required 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Experience Level</Label>
                <Select value={level} onValueChange={setLevel} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner / Junior</SelectItem>
                    <SelectItem value="intermediate">Intermediate / Mid</SelectItem>
                    <SelectItem value="advanced">Advanced / Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Select value={questionsCount} onValueChange={setQuestionsCount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topics">Specific Topics (Optional)</Label>
              <Input 
                id="topics" 
                placeholder="e.g. Hooks, Context API, Performance" 
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description Context (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Paste job description or requirements here so the AI can tailor the questions..." 
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !level}>
              {loading ? "Generating Questions..." : "Generate Questions ✨"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
