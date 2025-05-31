import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: number;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  maxCameras: number;
  features: string[];
  description: string;
  isPopular: boolean;
  isActive: boolean;
}

interface UserSubscription {
  currentPlan: string;
  status: string;
  maxCameras: number;
  subscriptionEndsAt: string;
}

export default function Subscription() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();

  // Get current user subscription with fallback for demo
  const { data: userSubscription } = useQuery({
    queryKey: ["/api/user/subscription"],
    retry: false,
    // Provide demo fallback when not authenticated
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/user/subscription");
      } catch (error) {
        // Return demo data when not authenticated
        return {
          currentPlan: "Basic",
          status: "active", 
          maxCameras: 5,
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    }
  }) as { data: UserSubscription | undefined };

  // Get subscription plans
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["/api/subscription-plans"],
  }) as { data: SubscriptionPlan[] };

  // Plan switching mutation
  const switchPlanMutation = useMutation({
    mutationFn: async (planName: string) => {
      return await apiRequest("POST", "/api/user/subscription", { planName });
    },
    onSuccess: (_, planName) => {
      toast({
        title: "Plan Updated",
        description: `Successfully switched to ${planName} plan`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  const handlePlanSwitch = (planName: string) => {
    if (userSubscription?.currentPlan === planName) {
      toast({
        title: "Already Active",
        description: `You are already on the ${planName} plan`,
      });
      return;
    }
    switchPlanMutation.mutate(planName);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Zap className="w-8 h-8 text-blue-500" />;
      case "professional":
        return <Star className="w-8 h-8 text-purple-500" />;
      case "enterprise":
        return <Crown className="w-8 h-8 text-gold-500" />;
      default:
        return <Zap className="w-8 h-8 text-blue-500" />;
    }
  };

  if (!userSubscription) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your surveillance needs. Switch anytime without losing your data.
        </p>
        
        {/* Current Plan Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="default" className="bg-blue-500">Current Plan</Badge>
          </div>
          <div className="text-lg font-semibold">{userSubscription.currentPlan}</div>
          <div className="text-sm text-muted-foreground">
            {userSubscription.maxCameras} cameras • Status: {userSubscription.status}
          </div>
          {userSubscription.subscriptionEndsAt && (
            <div className="text-xs text-muted-foreground mt-1">
              Renews: {new Date(userSubscription.subscriptionEndsAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-xs mx-auto">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === "monthly"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === "yearly"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = userSubscription?.currentPlan === plan.name;
          const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const pricePerMonth = billingPeriod === "yearly" 
            ? Math.round(parseInt(plan.yearlyPrice) / 12).toString()
            : plan.monthlyPrice;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.isPopular 
                  ? "border-2 border-purple-500 shadow-lg transform scale-105" 
                  : isCurrentPlan 
                    ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                    : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-purple-500">Most Popular</Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="default" className="bg-blue-500">Current</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    ${pricePerMonth}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <div className="text-sm text-muted-foreground">
                      Billed annually (${price})
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : plan.isPopular ? "default" : "outline"}
                  disabled={isCurrentPlan || switchPlanMutation.isPending}
                  onClick={() => handlePlanSwitch(plan.name)}
                >
                  {isCurrentPlan 
                    ? "Current Plan" 
                    : switchPlanMutation.isPending 
                      ? "Switching..." 
                      : `Switch to ${plan.name}`
                  }
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="max-w-4xl mx-auto mt-12 text-center space-y-4">
        <h3 className="text-xl font-semibold">All plans include:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>24/7 monitoring</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Mobile app access</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure cloud storage</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mt-6">
          <p>Need help choosing? Contact our support team for personalized recommendations.</p>
          <p className="mt-2">All plans come with a 30-day money-back guarantee.</p>
        </div>
      </div>
    </div>
  );
}