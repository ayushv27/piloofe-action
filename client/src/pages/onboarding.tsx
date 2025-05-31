import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Star, Trophy, Target, Camera, Shield, Bell, Search, Users, Settings, Play, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  route?: string;
  action?: string;
  completed: boolean;
  unlocked: boolean;
}

export default function Onboarding() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  // Update onboarding progress
  const updateProgressMutation = useMutation({
    mutationFn: async (stepId: string) => {
      return await apiRequest("POST", "/api/user/onboarding/complete", { stepId });
    },
    onSuccess: (data, stepId) => {
      setCompletedSteps(prev => [...prev, stepId]);
      setTotalPoints(prev => prev + data.pointsEarned);
      setShowCelebration(true);
      toast({
        title: "Step Complete!",
        description: `You earned ${data.pointsEarned} points!`,
      });
      setTimeout(() => setShowCelebration(false), 3000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Piloo.ai",
      description: "Get started with your AI-powered surveillance system",
      icon: <Shield className="w-6 h-6" />,
      points: 10,
      completed: completedSteps.includes("welcome"),
      unlocked: true
    },
    {
      id: "dashboard",
      title: "Explore Dashboard",
      description: "View your security overview and system status",
      icon: <Target className="w-6 h-6" />,
      points: 20,
      route: "/dashboard",
      completed: completedSteps.includes("dashboard"),
      unlocked: completedSteps.includes("welcome") || true
    },
    {
      id: "cameras",
      title: "Setup Cameras",
      description: "Configure your CCTV cameras and zones",
      icon: <Camera className="w-6 h-6" />,
      points: 30,
      route: "/zone-setup",
      completed: completedSteps.includes("cameras"),
      unlocked: completedSteps.includes("dashboard")
    },
    {
      id: "alerts",
      title: "Configure Alerts",
      description: "Set up security alerts and notifications",
      icon: <Bell className="w-6 h-6" />,
      points: 25,
      route: "/alerts",
      completed: completedSteps.includes("alerts"),
      unlocked: completedSteps.includes("cameras")
    },
    {
      id: "ai-chat",
      title: "Try AI Assistant",
      description: "Ask questions about your CCTV footage",
      icon: <Search className="w-6 h-6" />,
      points: 35,
      route: "/ai-chat",
      completed: completedSteps.includes("ai-chat"),
      unlocked: completedSteps.includes("alerts")
    },
    {
      id: "employees",
      title: "Monitor Staff",
      description: "Track employee attendance and activities",
      icon: <Users className="w-6 h-6" />,
      points: 20,
      route: "/employees",
      completed: completedSteps.includes("employees"),
      unlocked: completedSteps.includes("ai-chat")
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Customize your security preferences",
      icon: <Settings className="w-6 h-6" />,
      points: 15,
      route: "/admin",
      completed: completedSteps.includes("settings"),
      unlocked: completedSteps.includes("employees")
    }
  ];

  const currentStep = onboardingSteps[currentStepIndex];
  const totalSteps = onboardingSteps.length;
  const completedCount = onboardingSteps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  // Calculate achievement level
  const getAchievement = (points: number) => {
    if (points >= 120) return { name: "Security Expert", icon: <Trophy className="w-4 h-4" />, color: "bg-yellow-500" };
    if (points >= 80) return { name: "Guardian", icon: <Shield className="w-4 h-4" />, color: "bg-blue-500" };
    if (points >= 40) return { name: "Novice", icon: <Star className="w-4 h-4" />, color: "bg-green-500" };
    return { name: "Beginner", icon: <Circle className="w-4 h-4" />, color: "bg-gray-500" };
  };

  const achievement = getAchievement(totalPoints);

  const handleCompleteStep = (stepId: string) => {
    updateProgressMutation.mutate(stepId);
  };

  const handleNavigateStep = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (direction === 'prev' && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Tutorial Guide</h1>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">
            Complete all steps to become a surveillance expert and unlock all features
          </p>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedCount}/{totalSteps}</div>
                <div className="text-sm text-muted-foreground">Steps Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
              <div className="text-center">
                <Badge className={`${achievement.color} text-white`}>
                  <span className="flex items-center gap-1">
                    {achievement.icon}
                    {achievement.name}
                  </span>
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Current Level</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </div>
        </div>

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        )}

        {/* Current Step Detail */}
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                {currentStep.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                <CardDescription>{currentStep.description}</CardDescription>
              </div>
              <Badge variant="secondary">{currentStep.points} pts</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => handleNavigateStep('prev')}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {!currentStep.completed ? (
                  <>
                    {currentStep.route ? (
                      <Link href={currentStep.route}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Play className="w-4 h-4 mr-2" />
                          Start Step
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleCompleteStep(currentStep.id)}
                        disabled={updateProgressMutation.isPending || !currentStep.unlocked}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {updateProgressMutation.isPending ? "Completing..." : "Complete Step"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button disabled className="bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => handleNavigateStep('next')}
                disabled={currentStepIndex === totalSteps - 1}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onboardingSteps.map((step, index) => (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                index === currentStepIndex ? 'ring-2 ring-blue-500' : ''
              } ${step.completed ? 'bg-green-50 dark:bg-green-900/20' : ''} ${
                !step.unlocked ? 'opacity-50' : ''
              }`}
              onClick={() => setCurrentStepIndex(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${step.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : step.unlocked ? (
                      step.icon
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.points} points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion Status */}
        {completedCount === totalSteps && (
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p>You've completed all onboarding steps and earned {totalPoints} points!</p>
              <p className="mt-2">You're now a certified Piloo.ai security expert!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}