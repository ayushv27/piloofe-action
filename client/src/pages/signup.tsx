import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  subscriptionPlan: z.string().min(1, "Please select a subscription plan"),
  billingCycle: z.enum(["monthly", "yearly"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"plan" | "account" | "payment">("plan");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      subscriptionPlan: "",
      billingCycle: "monthly",
    },
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      // Create user account
      const response = await apiRequest("POST", "/api/auth/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
        subscriptionPlan: data.subscriptionPlan,
      });

      if (data.subscriptionPlan !== "trial") {
        // Redirect to Stripe checkout for paid plans
        const checkoutResponse = await apiRequest("POST", "/api/create-checkout-session", {
          planId: data.subscriptionPlan,
          billingCycle: data.billingCycle,
        });
        
        window.location.href = checkoutResponse.url;
      } else {
        toast({
          title: "Account Created Successfully",
          description: "Welcome to Ghoobad.ai! You can now sign in to your account.",
        });
        setLocation("/login");
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPlanPrice = (plan: any) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: any) => {
    const monthlyTotal = parseFloat(plan.monthlyPrice) * 12;
    const yearlyPrice = parseFloat(plan.yearlyPrice);
    return Math.round(monthlyTotal - yearlyPrice);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Ghoobad.ai</h1>
                  <p className="text-xs text-gray-500">AI Surveillance Platform</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === "plan" ? "text-blue-600" : "text-green-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "plan" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
                {step === "plan" ? "1" : <CheckCircle className="h-5 w-5" />}
              </div>
              <span className="ml-2 font-medium">Choose Plan</span>
            </div>
            <div className="w-16 h-px bg-gray-300" />
            <div className={`flex items-center ${step === "account" ? "text-blue-600" : step === "payment" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "account" ? "bg-blue-600 text-white" : step === "payment" ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                {step === "payment" ? <CheckCircle className="h-5 w-5" /> : "2"}
              </div>
              <span className="ml-2 font-medium">Create Account</span>
            </div>
            <div className="w-16 h-px bg-gray-300" />
            <div className={`flex items-center ${step === "payment" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "payment" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                3
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Plan Selection */}
        {step === "plan" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
              <p className="text-lg text-gray-600">Select the subscription that best fits your security needs</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={billingCycle === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("monthly")}
                  className="px-6"
                >
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("yearly")}
                  className="px-6"
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save up to 20%</Badge>
                </Button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Trial Plan */}
              <Card className={`cursor-pointer transition-all ${selectedPlan === "trial" ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"}`}
                    onClick={() => setSelectedPlan("trial")}>
                <CardHeader>
                  <CardTitle className="text-lg">Free Trial</CardTitle>
                  <CardDescription>Try for 14 days</CardDescription>
                  <div className="text-3xl font-bold">$0</div>
                  <p className="text-sm text-gray-500">14-day trial</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Up to 2 cameras
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Basic monitoring
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Email alerts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      7-day retention
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Render subscription plans */}
              {plans?.map((plan: any) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all relative ${selectedPlan === plan.id.toString() ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"} ${plan.isPopular ? "ring-2 ring-blue-400" : ""}`}
                  onClick={() => setSelectedPlan(plan.id.toString())}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-3xl font-bold">${getPlanPrice(plan)}</div>
                    <p className="text-sm text-gray-500">
                      /{billingCycle}
                      {billingCycle === "yearly" && (
                        <span className="text-green-600 block">Save ${getSavings(plan)}/year</span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {plan.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  if (selectedPlan) {
                    form.setValue("subscriptionPlan", selectedPlan);
                    form.setValue("billingCycle", billingCycle);
                    setStep("account");
                  }
                }}
                disabled={!selectedPlan}
                size="lg"
              >
                Continue to Account Setup
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Account Creation */}
        {step === "account" && (
          <div>
            <div className="text-center mb-8">
              <Button 
                variant="ghost" 
                onClick={() => setStep("plan")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plan Selection
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your Account</h1>
              <p className="text-lg text-gray-600">Set up your Ghoobad.ai account credentials</p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Create your account to get started with Ghoobad.ai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      {...form.register("username")}
                      placeholder="Enter username"
                    />
                    {form.formState.errors.username && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter email address"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      {...form.register("password")}
                      placeholder="Enter password"
                    />
                    {form.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      {...form.register("confirmPassword")}
                      placeholder="Confirm password"
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    {selectedPlan === "trial" ? "Start Free Trial" : "Continue to Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}