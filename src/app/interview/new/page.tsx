import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewInterviewPage() {
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input id="candidateName" placeholder="e.g. John Doe" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <Input id="role" placeholder="e.g. Frontend Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Primary Stack/Language</Label>
              <Input id="language" placeholder="e.g. React.js, Python" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Experience Level</Label>
              <Select>
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
              <Select defaultValue="5">
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
            <Input id="topics" placeholder="e.g. Hooks, Context API, Performance" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Job Description Context (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Paste job description or requirements here so the AI can tailor the questions..." 
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Generate Questions ✨</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
