/**
 * Piloo.ai - AI-Powered CCTV Monitoring Platform
 * Copyright (c) 2025 Pyrack Solutions Pvt. Ltd.
 * Website: https://pyrack.com/
 * Licensed under the MIT License
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Star, Trophy, Target, Play, SkipForward } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserProgress, OnboardingStep, Achievement } from "@shared/schema";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTutorial({ isOpen, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const { toast } = useToast();

  // Fetch user progress
  const { data: userProgress } = useQuery<UserProgress>({
    queryKey: ['/api/onboarding/progress'],
    enabled: isOpen,
  });

  // Fetch onboarding steps
  const { data: steps = [] } = useQuery<OnboardingStep[]>({
    queryKey: ['/api/onboarding/steps'],
    enabled: isOpen,
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    enabled: isOpen,
  });

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: number) => {
      await apiRequest("POST", `/api/onboarding/complete-step/${stepId}`);
    },
    onSuccess: (_, stepId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
      
      // Check for achievements
      const completedStep = steps.find(s => s.id === stepId);
      if (completedStep) {
        toast({
          title: "Step Completed!",
          description: `You earned ${completedStep.points} points!`,
        });

        // Check for category achievements
        const categoryAchievement = achievements.find(a => 
          a.category === completedStep.category && 
          !userProgress?.achievements?.includes(a.id)
        );
        
        if (categoryAchievement) {
          setShowAchievement(categoryAchievement);
        }
      }

      // Auto-advance to next step
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Tutorial complete
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentStep = steps[currentStepIndex];
  const completedSteps = userProgress?.completedSteps || [];
  const progressPercentage = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  const handleStepComplete = () => {
    if (currentStep && !completeStepMutation.isPending) {
      completeStepMutation.mutate(currentStep.id);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  if (!isOpen || !currentStep) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Welcome to Piloo.ai
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{userProgress?.totalPoints || 0} points</span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tutorial Progress</span>
                <span>{completedSteps.length}/{steps.length} steps</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Current Step */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Step {currentStep.stepNumber}</Badge>
                  {currentStep.title}
                  {isStepCompleted(currentStep.id) && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{currentStep.description}</p>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <p className="text-sm">{currentStep.instructions}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{currentStep.points} points</span>
                  </div>
                  {currentStep.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{currentStep.estimatedTime} min</span>
                    </div>
                  )}
                  <Badge variant="secondary">{currentStep.category}</Badge>
                </div>

                {currentStep.videoUrl && (
                  <Button variant="outline" size="sm" className="w-fit">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Tutorial Video
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextStep}
                  disabled={currentStepIndex === steps.length - 1}
                >
                  Next
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={onSkip}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Tutorial
                </Button>
                <Button
                  onClick={handleStepComplete}
                  disabled={completeStepMutation.isPending || isStepCompleted(currentStep.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {completeStepMutation.isPending ? (
                    "Completing..."
                  ) : isStepCompleted(currentStep.id) ? (
                    "Completed"
                  ) : (
                    "Mark Complete"
                  )}
                </Button>
              </div>
            </div>

            {/* Step Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                    index === currentStepIndex 
                      ? "bg-blue-100 dark:bg-blue-900" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800",
                    isStepCompleted(step.id) && "opacity-60"
                  )}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  {isStepCompleted(step.id) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Celebration */}
      {showAchievement && (
        <Dialog open={!!showAchievement} onOpenChange={() => setShowAchievement(null)}>
          <DialogContent className="max-w-md text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Achievement Unlocked!</h2>
                <h3 className="text-lg font-semibold text-yellow-600 mt-2">
                  {showAchievement.name}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {showAchievement.description}
                </p>
                <div className="mt-4">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    +{showAchievement.points} points
                  </Badge>
                </div>
              </div>
              <Button onClick={() => setShowAchievement(null)}>
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}