import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, Code, ArrowLeft, BarChart3, Database } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Security Hard-check on specific Admin Email
  const ADMIN_EMAIL = "habdullah4510@gmail.com";
  if (user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  // Fetch Admin Stats from Custom RPC
  const { data: stats, error } = await supabase.rpc("get_admin_stats");

  const totalUsers = stats?.total_users || 0;
  const activeUsers = stats?.active_users || 0;
  const totalInterviews = stats?.total_interviews || 0;

  // Rough estimation logic for Gemini Usage based on generated DB rows 
  // (Assuming ~5 questions per interview + 1 summary)
  const estimatedApiCalls = totalInterviews * 2; 

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground flex items-center hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-300">Superadmin</span>
          </div>
          <p className="text-muted-foreground mt-1">
            Platform wide aggregate statistics and performance monitoring.
          </p>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Database Setup Required</CardTitle>
            <CardDescription>
              The admin statistics RPC function has not been set up in Supabase yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Please run the `supabase-admin-schema.sql` script in your Supabase SQL Editor to enable these statistics.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="border-2 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">All time accounts</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Generated an interview this month</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInterviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Interviews completed</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Est. API Calls</CardTitle>
              <Database className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estimatedApiCalls}</div>
              <p className="text-xs text-muted-foreground mt-1">Requests to Gemini AI</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="mt-12 bg-muted/30 rounded-lg p-6 border">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
          <Code className="h-5 w-5" /> Active Monitors
        </h3>
        <p className="text-sm text-muted-foreground">
          Your admin account (`{ADMIN_EMAIL}`) currently bypasses all monthly usage tracks explicitly inside `/api/generate-questions`. 
          No rate limits apply while generating new interviews.
        </p>
      </div>
    </div>
  );
}
