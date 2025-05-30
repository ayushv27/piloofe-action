import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Video, AlertTriangle, Users, Brain, Clock, CheckCircle, Mail, Phone, Heart, Zap, Car as CarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const demoRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type DemoRequestForm = z.infer<typeof demoRequestSchema>;

const features = [
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description: "Advanced machine learning algorithms detect intrusions, motion, and suspicious behavior in real-time."
  },
  {
    icon: Video,
    title: "Multi-Camera Monitoring",
    description: "Monitor unlimited cameras from a single dashboard with intelligent zone management."
  },
  {
    icon: AlertTriangle,
    title: "Real-Time Alerts",
    description: "Instant notifications via email, SMS, and push notifications for critical security events."
  },
  {
    icon: Users,
    title: "Employee Tracking",
    description: "Track employee attendance, movement patterns, and ensure workplace safety compliance."
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Continuous surveillance with automated reporting and analytics for complete security coverage."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security protocols to protect your surveillance data."
  }
];

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for home users and hobbyists",
    maxCameras: 1,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 camera included",
      "Motion alerts",
      "RTSP Live view",
      "Basic 7-day footage access"
    ],
    isPopular: false
  },
  {
    name: "Starter",
    description: "Ideal for small offices and retail shops",
    maxCameras: 3,
    monthlyPrice: 1499,
    yearlyPrice: 14990,
    features: [
      "Up to 3 cameras",
      "AI anomaly detection (people/fire/animals)",
      "15-day archive",
      "Email alerts",
      "₹400 per extra camera"
    ],
    isPopular: false
  },
  {
    name: "Pro",
    description: "Perfect for apartment complexes and medium businesses",
    maxCameras: 10,
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    features: [
      "Up to 10 cameras",
      "Multimodal search (text/image prompt)",
      "Incident tagging",
      "30-day archive",
      "₹500 per extra camera"
    ],
    isPopular: true
  },
  {
    name: "Enterprise",
    description: "For malls, factories, and enterprise campuses",
    maxCameras: 20,
    monthlyPrice: 20000,
    yearlyPrice: 200000,
    features: [
      "Custom cameras (20+)",
      "Dedicated GPU support",
      "90-day archive",
      "Custom dashboards",
      "Priority support",
      "Custom pricing for extra cameras"
    ],
    isPopular: false
  }
];

export default function Landing() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<DemoRequestForm>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: DemoRequestForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/demo-request", data);
      setSubmitted(true);
      toast({
        title: "Demo Request Submitted",
        description: "We'll contact you within 24 hours to schedule your demo.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit demo request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Piloo.ai</h1>
                <p className="text-xs text-gray-500">AI Surveillance Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              🚀 AI-Powered Surveillance Platform
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Next-Generation
            <span className="text-blue-600 block">CCTV Monitoring</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your security infrastructure with AI-powered surveillance that detects threats, 
            monitors employees, and provides real-time insights to keep your business safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4">
              Request Demo
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* AI Detection Showcase */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              🎯 AI-Powered Detection
            </Badge>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              See Piloo.ai in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience real-world AI detection with actual security scenarios from our advanced surveillance system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Detection Example 1 - Person Detection */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-200">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&crop=center" 
                  alt="Security camera view" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20">
                  <div className="absolute top-3 left-3 text-green-400 font-mono text-xs">
                    CAM-01: ENTRANCE
                  </div>
                  <div className="absolute top-3 right-3 text-green-400 font-mono text-xs">
                    2024-01-15 14:23:45
                  </div>
                  <div className="absolute bottom-16 left-1/3 w-16 h-20 border-2 border-red-500 border-dashed">
                    <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                      PERSON
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Person Detection</span>
                  <Badge variant="destructive">ALERT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Confidence: 97.3%</span>
                  <span className="text-xs text-gray-400">0.2s response</span>
                </div>
              </div>
            </div>

            {/* Detection Example 2 - Vehicle Detection */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-200">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center" 
                  alt="Parking lot security view" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20">
                  <div className="absolute top-3 left-3 text-green-400 font-mono text-xs">
                    CAM-03: PARKING
                  </div>
                  <div className="absolute top-3 right-3 text-green-400 font-mono text-xs">
                    2024-01-15 09:15:22
                  </div>
                  <div className="absolute bottom-8 left-1/4 w-24 h-16 border-2 border-blue-500 border-dashed">
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                      VEHICLE
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Vehicle Recognition</span>
                  <Badge className="bg-blue-500">TRACKED</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Confidence: 98.7%</span>
                  <span className="text-xs text-gray-400">0.1s response</span>
                </div>
              </div>
            </div>

            {/* Detection Example 3 - Suspicious Activity */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-200">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop&crop=center" 
                  alt="Office security monitoring" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20">
                  <div className="absolute top-3 left-3 text-green-400 font-mono text-xs">
                    CAM-07: WAREHOUSE
                  </div>
                  <div className="absolute top-3 right-3 text-green-400 font-mono text-xs">
                    2024-01-15 22:47:11
                  </div>
                  <div className="absolute bottom-12 right-1/3 w-20 h-24 border-2 border-orange-500 border-dashed">
                    <div className="absolute -top-6 right-0 bg-orange-500 text-white px-2 py-1 text-xs rounded">
                      MOTION
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Motion Analysis</span>
                  <Badge className="bg-orange-500">MONITORING</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Confidence: 94.1%</span>
                  <span className="text-xs text-gray-400">0.3s response</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white">
            <h3 className="text-3xl font-bold text-center mb-8">Real-Time AI Performance</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99.2%</div>
                <div className="text-indigo-100">Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">0.2s</div>
                <div className="text-indigo-100">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-indigo-100">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-indigo-100">System Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Security
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with intuitive design 
              to deliver comprehensive surveillance solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4 sm:px-6 lg:px-8" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
              💎 Flexible Plans
            </Badge>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business needs. Scale up or down anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.isPopular ? 'border-blue-500 border-2 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'} hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white`}>
                {plan.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                    ⭐ Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">
                      {plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice.toLocaleString('en-IN')}`}
                    </span>
                    {plan.monthlyPrice > 0 && <span className="text-gray-500 text-sm">/month</span>}
                  </div>
                  {plan.monthlyPrice > 0 && (
                    <p className="text-xs text-gray-500">
                      or ₹{plan.yearlyPrice.toLocaleString('en-IN')}/year
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-400">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                  <Link to="/signup">
                    <Button 
                      className={`w-full ${plan.isPopular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : plan.monthlyPrice === 0 
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                      } text-white border-0 shadow-lg`}
                    >
                      {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Start Free Trial'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section className="py-20 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 px-4 sm:px-6 lg:px-8" id="demo">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              See Piloo.ai in Action
            </h2>
            <p className="text-xl text-blue-100">
              Request a personalized demo and discover how our AI surveillance platform 
              can transform your security operations.
            </p>
          </div>
          
          {submitted ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Demo Request Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your interest. We'll contact you within 24 hours to schedule your demo.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    anups@pyrack.com
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Request Your Demo</CardTitle>
                <CardDescription className="text-center">
                  Fill out the form below and we'll get back to you shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name"
                        {...form.register("name")}
                        placeholder="John Doe"
                      />
                      {form.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="john@company.com"
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company"
                        {...form.register("company")}
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        {...form.register("phone")}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message"
                      {...form.register("message")}
                      placeholder="Tell us about your security needs..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Request Demo"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Piloo.ai</span>
              </div>
              <p className="text-gray-400 text-sm">
                Next-generation AI surveillance platform for modern businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  anups@pyrack.com
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (555) 123-4567
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span>&copy; 2024 Piloo.ai. All rights reserved.</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>by</span>
                <a 
                  href="https://pyrack.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Pyrack
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}