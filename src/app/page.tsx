import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Code2, LineChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <Badge className="mb-6 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            VivaGen AI MVP is Live! ✨
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Conduct AI-Powered Tech Interviews in Minutes
          </h1>
          <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            VivaGen AI generates tailored programming questions, provides a structured interview flow, and automatically evaluates candidates using Google Gemini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-md shadow-lg transition-transform hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-md bg-background/50 backdrop-blur-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why choose VivaGen AI?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete toolkit designed for tech instructors, HR teams, and senior developers to streamline hiring.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-primary/10 rounded-full mb-6">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Question Generator</h3>
              <p className="text-muted-foreground">
                Instantly create role-specific conceptual, scenario, and practical questions tailored perfectly to the candidate&apos;s level.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-primary/10 rounded-full mb-6">
                <Code2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Structured Flow</h3>
              <p className="text-muted-foreground">
                Conduct interviews seamlessly with our intuitive question-by-question layout, built-in scoring (0-10), and note-taking mechanics.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-primary/10 rounded-full mb-6">
                <LineChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Evaluation</h3>
              <p className="text-muted-foreground">
                After the interview, our AI analyzes the scores and notes to generate a comprehensive summary, strengths, and hiring recommendation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
        {children}
    </div>
  )
}
