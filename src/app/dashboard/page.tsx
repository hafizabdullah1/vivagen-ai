import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, History, User, Crown, LayoutDashboard, Settings, LogOut, ChevronRight } from "lucide-react";

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
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-medium text-foreground">{user.email?.split('@')[0]}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isAdmin && (
            <Link href="/admin" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">
                <Crown className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          <Link href="/interview/new" className="flex-1 sm:flex-none">
            <Button className="w-full shadow-md hover:shadow-lg transition-all active:scale-95">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Interviews</CardTitle>
            <History className="h-4 w-4 text-primary/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalInterviews ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Interviews conducted all time</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow ring-1 ring-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isAdmin ? "Admin Access" : "Free Plan Usage"}
            </CardTitle>
            {isAdmin ? <Crown className="h-4 w-4 text-yellow-500" /> : <User className="h-4 w-4 text-primary/60" />}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isAdmin ? "Unlimited" : `${interviewsUsed} / 10`}</div>
            <p className="text-xs text-muted-foreground mt-1">Interviews used this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold tracking-tight">Recent Interviews</h2>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">Last 10 results</span>
        </div>

        {!recentInterviews || recentInterviews.length === 0 ? (
          <Card className="p-16 text-center bg-muted/20 border-dashed">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-background rounded-full border shadow-sm">
                <PlusCircle className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium mb-6">You haven&apos;t conducted any interviews yet.</p>
            <Link href="/interview/new">
              <Button size="lg" className="rounded-full px-8">
                Start your first interview
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recentInterviews.map((interview) => (
              <Card key={interview.id} className="group hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 shadow-sm">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="space-y-1 w-full md:w-auto">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                        {interview.candidate_name}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span>{interview.role}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground opacity-30"></span>
                        <span className="bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{interview.language}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(interview.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {interview.level}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none">
                      <div className="text-left md:text-right">
                        <div className="text-2xl font-black text-foreground">
                          {interview.percentage?.toFixed(0) ?? "—"}
                          <span className="text-xs font-bold text-muted-foreground ml-0.5">%</span>
                        </div>
                        <div className={`text-[10px] uppercase font-bold tracking-tighter ${getRecommendationColor(summaryMap.get(interview.id) ?? undefined)}`}>
                          {summaryMap.get(interview.id) ?? "In progress"}
                        </div>
                      </div>
                      <Link href={`/interview/${interview.id}/summary`} className="shrink-0">
                        <Button variant="outline" size="sm" className="rounded-full px-5 hover:bg-primary hover:text-primary-foreground">
                          View Report
                        </Button>
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
