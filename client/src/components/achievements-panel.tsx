/**
 * Piloo.ai - AI-Powered CCTV Monitoring Platform
 * Copyright © 2025 Pyrack Solutions Pvt. Ltd.
 * Website: https://pyrack.com/
 * All rights reserved. Proprietary software.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Zap, Shield, Camera, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProgress, Achievement } from "@shared/schema";

interface AchievementsPanelProps {
  className?: string;
}

export function AchievementsPanel({ className }: AchievementsPanelProps) {
  // Fetch user progress
  const { data: userProgress } = useQuery<UserProgress>({
    queryKey: ['/api/onboarding/progress'],
  });

  // Fetch all achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'setup': return Target;
      case 'monitoring': return Camera;
      case 'security': return Shield;
      case 'advanced': return Zap;
      case 'social': return Users;
      case 'learning': return BookOpen;
      default: return Trophy;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'setup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'monitoring': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'social': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'learning': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const unlockedAchievements = achievements.filter(a => 
    userProgress?.achievements?.includes(a.id)
  );

  const lockedAchievements = achievements.filter(a => 
    !userProgress?.achievements?.includes(a.id)
  );

  const totalPoints = userProgress?.totalPoints || 0;
  const maxPossiblePoints = achievements.reduce((sum, a) => sum + a.points, 0);
  const progressPercentage = maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{totalPoints} Points</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {unlockedAchievements.length}/{achievements.length} Unlocked
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-sm text-muted-foreground text-center">
            {Math.round(progressPercentage)}% Complete
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              Unlocked Achievements ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {unlockedAchievements.map((achievement) => {
                const IconComponent = getAchievementIcon(achievement.category);
                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          {achievement.name}
                        </h4>
                        <Badge className={getCategoryColor(achievement.category)}>
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          +{achievement.points} points
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Locked Achievements ({lockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {lockedAchievements.map((achievement) => {
                const IconComponent = getAchievementIcon(achievement.category);
                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 opacity-75"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-600 dark:text-gray-400">
                          {achievement.name}
                        </h4>
                        <Badge className={cn(getCategoryColor(achievement.category), "opacity-75")}>
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-gray-500">
                          {achievement.points} points
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['setup', 'monitoring', 'security', 'advanced', 'social', 'learning'].map((category) => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              const unlockedInCategory = categoryAchievements.filter(a => 
                userProgress?.achievements?.includes(a.id)
              ).length;
              const IconComponent = getAchievementIcon(category);
              
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 p-3 rounded-lg border"
                >
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium capitalize">{category}</div>
                    <div className="text-sm text-muted-foreground">
                      {unlockedInCategory}/{categoryAchievements.length}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}