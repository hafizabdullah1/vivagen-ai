import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ActiveInterviewPage() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview: John Doe</h1>
          <p className="text-muted-foreground">Frontend Engineer • React.js</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Current Score</div>
          <div className="text-3xl font-bold text-primary">24 <span className="text-sm text-muted-foreground font-normal">/ 50</span></div>
        </div>
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question 3 of 5</span>
          <span>60% Completed</span>
        </div>
        <Progress value={60} className="h-2" />
      </div>

      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 pb-8">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline" className="bg-background">Conceptual</Badge>
            <Badge variant="secondary">Difficulty: 6/10</Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            Explain closures in JavaScript and provide a practical use case where you would use them instead of global variables.
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Candidate Score (0-10)</Label>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <Button 
                  key={score} 
                  variant={score === 7 ? "default" : "outline"} 
                  className={`w-10 h-10 p-0 rounded-full ${score === 7 ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {score}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">7: Good understanding, provided a decent example.</p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="notes" className="text-base font-semibold">Interviewer Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Record candidate's response highlights, missed points, or red flags..." 
              className="min-h-[120px] resize-y"
              defaultValue="Candidate understood the concept clearly. Explained data privacy well using an IIFE example."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 py-4">
          <Button variant="ghost">Previous Question</Button>
          <Button size="lg" className="px-8">Next Question ➔</Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive">
          End Interview Early
        </Button>
      </div>
    </div>
  );
}
