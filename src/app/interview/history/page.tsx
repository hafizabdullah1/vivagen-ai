import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Code, ChevronRight } from "lucide-react";

export default async function InterviewHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all interviews for this user
  const { data: interviews } = await supabase
    .from("interviews")
    .select("id, candidate_name, role, language, level, percentage, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch summaries for all interviews
  const interviewIds = interviews?.map((i) => i.id) ?? [];
  const { data: summaries } = interviewIds.length > 0
    ? await supabase
        .from("interview_summary")
        .select("interview_id, recommendation")
        .in("interview_id", interviewIds)
    : { data: [] };

  const summaryMap = new Map(summaries?.map((s) => [s.interview_id, s.recommendation]) ?? []);

  function getRecommendationColor(rec: string | undefined) {
    if (rec === "Strong Hire" || rec === "Hire") return "text-green-600";
    if (rec === "Maybe") return "text-yellow-600";
    if (rec === "Reject") return "text-red-600";
    return "text-muted-foreground";
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground flex items-center hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
          <p className="text-muted-foreground mt-1">
            View all past candidates and their evaluations.
          </p>
        </div>
      </div>

      {!interviews || interviews.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">You have no interview history yet.</p>
          <Link href="/interview/new">
            <Button>Start your first interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <Link key={interview.id} href={`/interview/${interview.id}/summary`}>
              <Card className="hover:bg-muted/50 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {interview.candidate_name} — {interview.role}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Code className="h-4 w-4" />
                          <span>{interview.language} ({interview.level})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-xl">{interview.percentage?.toFixed(0) ?? "—"}%</div>
                        <div className={`text-sm font-medium ${getRecommendationColor(summaryMap.get(interview.id) ?? undefined)}`}>
                          {summaryMap.get(interview.id) ?? "In progress"}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
