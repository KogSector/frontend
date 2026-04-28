"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, BookOpen, Code, LineChart, MessageSquare } from "lucide-react";
import { authClient } from "@/lib/api";

const INTENTS = [
  { id: "engineering", label: "Engineering & Development", icon: Code, preset: "dev_preset" },
  { id: "research", label: "Research & Analysis", icon: BookOpen, preset: "research_preset" },
  { id: "finance", label: "Finance & Operations", icon: LineChart, preset: "finance_preset" },
  { id: "support", label: "Sales & Support", icon: MessageSquare, preset: "support_preset" },
  { id: "other", label: "Other / Custom", icon: Activity, preset: "default_preset" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedIntent, setSelectedIntent] = useState<string>("engineering");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await authClient.get<any>('/api/v1/user/onboarding');
        if (res && res.data?.onboardingCompleted) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const intentObj = INTENTS.find(i => i.id === selectedIntent);
    try {
      await authClient.post('/api/v1/user/onboarding', {
        userIntent: selectedIntent,
        dashboardPreset: intentObj?.preset || "default_preset",
        onboardingCompleted: true
      });
      toast({ title: "Setup Complete", description: "Your dashboard has been personalized." });
      router.push('/dashboard');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save preferences." });
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border bg-card shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold font-orbitron bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Welcome to ConFuse
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            How do you plan to use ConFuse? We'll personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="onboarding-form" onSubmit={handleSubmit}>
            <RadioGroup 
              value={selectedIntent} 
              onValueChange={setSelectedIntent}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
            >
              {INTENTS.map((intent) => {
                const Icon = intent.icon;
                return (
                  <Label
                    key={intent.id}
                    htmlFor={intent.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedIntent === intent.id 
                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20' 
                        : 'border-border bg-card/50 hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <RadioGroupItem value={intent.id} id={intent.id} className="sr-only" />
                    <div className={`p-2 rounded-lg ${selectedIntent === intent.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 font-semibold text-lg">{intent.label}</div>
                  </Label>
                );
              })}
            </RadioGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end items-center bg-muted/20 border-t border-border p-6 rounded-b-xl">
          <Button type="submit" form="onboarding-form" disabled={loading} className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
            {loading ? "Saving..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
