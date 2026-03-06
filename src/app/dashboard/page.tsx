import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, History, User, Crown } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch interviews count
  const { count: totalInterviews } = await supabase
    .from("interviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch current month usage
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("interviews_used")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .single();
  const interviewsUsed = usage?.interviews_used ?? 0;

  const ADMIN_EMAIL = "habdullah4510@gmail.com";
  const isAdmin = user.email === ADMIN_EMAIL;

  // Fetch recent interviews
  const { data: recentInterviews } = await supabase
    .from("interviews")
    .select("id, candidate_name, role, language, level, percentage, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch summaries for recent interviews to show recommendations
  const interviewIds = recentInterviews?.map((i) => i.id) ?? [];
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
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium">{user.email}</span>
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-700">
                <Crown className="mr-2 h-4 w-4" />
                Admin Console
              </Button>
            </Link>
          )}
          <Link href="/interview/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews ?? 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Free Tier Usage</CardTitle>
            {isAdmin ? <Crown className="h-4 w-4 text-yellow-500" /> : <User className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? "Unlimited" : `${interviewsUsed} / 10`}</div>
            <p className="text-xs text-muted-foreground">Interviews this month</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>

        {!recentInterviews || recentInterviews.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No interviews yet.</p>
            <Link href="/interview/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Start your first interview
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recentInterviews.map((interview) => (
              <Card key={interview.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{interview.candidate_name} — {interview.role}</h3>
                      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        <span>{interview.language} / {interview.level}</span>
                        <span>•</span>
                        <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{interview.percentage?.toFixed(0) ?? "—"}%</div>
                        <div className={`text-xs font-medium ${getRecommendationColor(summaryMap.get(interview.id) ?? undefined)}`}>
                          {summaryMap.get(interview.id) ?? "In progress"}
                        </div>
                      </div>
                      <Link href={`/interview/${interview.id}/summary`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
