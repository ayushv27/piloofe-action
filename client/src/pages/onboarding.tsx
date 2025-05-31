import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

interface UserProgress {
  currentStep: number;
  completedSteps: string[];
  totalPoints: number;
  achievements: string[];
}

export default function Onboarding() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  // Get user onboarding progress
  const { data: userProgress, isLoading } = useQuery({
    queryKey: ["/api/user/onboarding"],
    retry: false,
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/user/onboarding");
      } catch (error) {
        // Return initial progress for new users
        return {
          currentStep: 0,
          completedSteps: [],
          totalPoints: 0,
          achievements: []
        };
      }
    }
  }) as { data: UserProgress | undefined; isLoading: boolean };

  // Update onboarding progress
  const updateProgressMutation = useMutation({
    mutationFn: async (stepId: string) => {
      return await apiRequest("POST", "/api/user/onboarding/complete", { stepId });
    },
    onSuccess: (_, stepId) => {
      const step = onboardingSteps.find(s => s.id === stepId);
      if (step) {
        setShowCelebration(true);
        toast({
          title: "Step Complete! 🎉",
          description: `You earned ${step.points} points for completing "${step.title}"`,
        });
        setTimeout(() => setShowCelebration(false), 3000);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/user/onboarding"] });
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
      completed: userProgress?.completedSteps.includes("welcome") || false,
      unlocked: true
    },
    {
      id: "dashboard",
      title: "Explore Dashboard",
      description: "View your security overview and system status",
      icon: <Target className="w-6 h-6" />,
      points: 20,
      route: "/dashboard",
      completed: userProgress?.completedSteps.includes("dashboard") || false,
      unlocked: userProgress?.completedSteps.includes("welcome") || true
    },
    {
      id: "cameras",
      title: "Setup Cameras",
      description: "Add and configure your first camera",
      icon: <Camera className="w-6 h-6" />,
      points: 30,
      route: "/cameras",
      completed: userProgress?.completedSteps.includes("cameras") || false,
      unlocked: userProgress?.completedSteps.includes("dashboard") || false
    },
    {
      id: "alerts",
      title: "Configure Alerts",
      description: "Set up notifications for security events",
      icon: <Bell className="w-6 h-6" />,
      points: 25,
      route: "/alerts",
      completed: userProgress?.completedSteps.includes("alerts") || false,
      unlocked: userProgress?.completedSteps.includes("cameras") || false
    },
    {
      id: "ai-chat",
      title: "Try AI Assistant",
      description: "Ask your CCTV system intelligent questions",
      icon: <Search className="w-6 h-6" />,
      points: 35,
      route: "/ai-chat",
      completed: userProgress?.completedSteps.includes("ai-chat") || false,
      unlocked: userProgress?.completedSteps.includes("alerts") || false
    },
    {
      id: "employees",
      title: "Add Team Members",
      description: "Manage your team and access permissions",
      icon: <Users className="w-6 h-6" />,
      points: 20,
      route: "/employees",
      completed: userProgress?.completedSteps.includes("employees") || false,
      unlocked: userProgress?.completedSteps.includes("ai-chat") || false
    },
    {
      id: "settings",
      title: "Customize Settings",
      description: "Personalize your surveillance preferences",
      icon: <Settings className="w-6 h-6" />,
      points: 15,
      route: "/settings",
      completed: userProgress?.completedSteps.includes("settings") || false,
      unlocked: userProgress?.completedSteps.includes("employees") || false
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const totalSteps = onboardingSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const totalEarnedPoints = userProgress?.totalPoints || 0;
  const maxPossiblePoints = onboardingSteps.reduce((sum, step) => sum + step.points, 0);

  const currentStep = onboardingSteps[currentStepIndex];

  const handleStepComplete = (stepId: string) => {
    updateProgressMutation.mutate(stepId);
  };

  const navigateStep = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (direction === 'prev' && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getAchievementBadge = (points: number) => {
    if (points >= 150) return { name: "Master", color: "bg-purple-500", icon: <Trophy className="w-4 h-4" /> };
    if (points >= 100) return { name: "Expert", color: "bg-gold-500", icon: <Star className="w-4 h-4" /> };
    if (points >= 50) return { name: "Intermediate", color: "bg-blue-500", icon: <Target className="w-4 h-4" /> };
    return { name: "Beginner", color: "bg-green-500", icon: <Shield className="w-4 h-4" /> };
  };

  const achievement = getAchievementBadge(totalEarnedPoints);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Piloo.ai Onboarding</h1>
        </div>
        <p className="text-muted-foreground">
          Complete all steps to become a surveillance expert and unlock all features
        </p>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedSteps}/{totalSteps}</div>
              <div className="text-sm text-muted-foreground">Steps Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalEarnedPoints}</div>
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
            {currentStep.completed && (
              <CheckCircle className="w-8 h-8 text-green-500" />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              Step {currentStepIndex + 1} of {totalSteps}
            </Badge>
            <Badge variant="outline">
              +{currentStep.points} points
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep.id === "welcome" && (
            <div className="text-center space-y-4">
              <div className="text-lg">Welcome to the future of surveillance! 🔒</div>
              <p className="text-muted-foreground">
                Piloo.ai combines cutting-edge AI with intuitive design to give you complete control over your security system. 
                Let's get you set up step by step.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Smart Cameras
                  </h4>
                  <p className="text-sm text-muted-foreground">AI-powered detection and analysis</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    AI Assistant
                  </h4>
                  <p className="text-sm text-muted-foreground">Ask questions about your footage</p>
                </div>
              </div>
              {!currentStep.completed && (
                <Button onClick={() => handleStepComplete("welcome")} className="mt-4">
                  <Play className="w-4 h-4 mr-2" />
                  Let's Get Started!
                </Button>
              )}
            </div>
          )}

          {currentStep.route && (
            <div className="text-center space-y-4">
              <p>Ready to explore this feature? Click below to navigate and complete this step.</p>
              {!currentStep.completed ? (
                <div className="space-y-2">
                  <Link href={currentStep.route}>
                    <Button className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go to {currentStep.title}
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => handleStepComplete(currentStep.id)}
                    className="w-full"
                  >
                    Mark as Complete
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Completed! Great job!</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigateStep('prev')}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateStep('next')}
              disabled={currentStepIndex === onboardingSteps.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            All Onboarding Steps
          </CardTitle>
          <CardDescription>
            Track your progress through each step of the onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  step.completed
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : step.unlocked
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 bg-gray-50 dark:bg-gray-800 opacity-50"
                } ${
                  index === currentStepIndex ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => step.unlocked && setCurrentStepIndex(index)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : step.unlocked ? (
                      <Circle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      +{step.points} pts
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Reward */}
      {completedSteps === totalSteps && (
        <Card className="border-2 border-gold-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardContent className="text-center py-8">
            <Trophy className="w-16 h-16 text-gold-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              You've completed the full Piloo.ai onboarding experience!
            </p>
            <Badge className="bg-gold-500 text-white text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Surveillance Expert
            </Badge>
            <div className="mt-4">
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}