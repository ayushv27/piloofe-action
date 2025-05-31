import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Camera, AlertTriangle, Shield, Crown } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  billingPeriod: string;
  maxCameras: number;
  features: string[];
  description: string;
  popular?: boolean;
}

interface UserSubscription {
  currentPlan: string;
  status: string;
  maxCameras: number;
  subscriptionEndsAt: string | null;
}

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [changingPlan, setChangingPlan] = useState<number | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: userSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  const changePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest("POST", "/api/user/change-plan", { planId });
    },
    onSuccess: () => {
      toast({
        title: "Plan Updated",
        description: "Your subscription plan has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      setChangingPlan(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription plan.",
        variant: "destructive",
      });
      setChangingPlan(null);
    },
  });

  const handlePlanChange = (planId: number) => {
    setChangingPlan(planId);
    changePlanMutation.mutate(planId);
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-blue-100">Loading your subscription details...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes("basic")) return <Camera className="h-6 w-6" />;
    if (planName.toLowerCase().includes("professional")) return <Shield className="h-6 w-6" />;
    if (planName.toLowerCase().includes("enterprise")) return <Crown className="h-6 w-6" />;
    return <AlertTriangle className="h-6 w-6" />;
  };

  const isCurrentPlan = (planName: string) => {
    return userSubscription?.currentPlan?.toLowerCase() === planName.toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-blue-100">Choose the perfect plan for your surveillance needs</p>
      </div>

      {/* Current Subscription Status */}
      {userSubscription && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Current Plan</p>
                <p className="font-semibold text-lg">{userSubscription.currentPlan}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge variant={userSubscription.status === "active" ? "default" : "destructive"}>
                  {userSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600">Camera Limit</p>
                <p className="font-semibold text-lg">{userSubscription.maxCameras} cameras</p>
              </div>
            </div>
            {userSubscription.subscriptionEndsAt && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-600">
                  Subscription renews on: {new Date(userSubscription.subscriptionEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan: SubscriptionPlan) => (
          <Card 
            key={plan.id} 
            className={`relative bg-white/90 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
              plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
            } ${isCurrentPlan(plan.name) ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
            )}
            {isCurrentPlan(plan.name) && (
              <Badge className="absolute -top-2 right-4 bg-green-600">
                Current Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.name)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-blue-600">
                ${plan.price}
                <span className="text-sm text-slate-600 font-normal">/{plan.billingPeriod}</span>
              </div>
              <p className="text-slate-600">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-2 py-2 bg-slate-50 rounded-lg">
                <Camera className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Up to {plan.maxCameras} cameras</span>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                onClick={() => handlePlanChange(plan.id)}
                disabled={isCurrentPlan(plan.name) || changingPlan === plan.id}
                variant={isCurrentPlan(plan.name) ? "outline" : "default"}
              >
                {changingPlan === plan.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Updating...</span>
                  </div>
                ) : isCurrentPlan(plan.name) ? (
                  "Current Plan"
                ) : (
                  "Select Plan"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Comparison */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  {plans?.map((plan: SubscriptionPlan) => (
                    <th key={plan.id} className="text-center py-2">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Max Cameras</td>
                  {plans?.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="text-center py-2">{plan.maxCameras}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">AI Analysis</td>
                  {plans?.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Cloud Storage</td>
                  {plans?.map((plan: SubscriptionPlan, index) => (
                    <td key={plan.id} className="text-center py-2">
                      {index === 0 ? "30 days" : index === 1 ? "90 days" : "Unlimited"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 font-medium">Support</td>
                  {plans?.map((plan: SubscriptionPlan, index) => (
                    <td key={plan.id} className="text-center py-2">
                      {index === 0 ? "Email" : index === 1 ? "Priority" : "24/7 Phone"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}