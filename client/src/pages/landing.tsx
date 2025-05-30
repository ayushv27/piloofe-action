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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              🎯 AI-Powered Detection
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              See Piloo.ai in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how our advanced AI instantly detects and analyzes security events 
              with precision that surpasses human capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Detection Examples */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Intrusion Detection</h3>
                    <p className="text-gray-600">Unauthorized access detected in 0.3 seconds</p>
                  </div>
                </div>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <svg className="w-full h-48" viewBox="0 0 400 200" fill="none">
                    {/* Background surveillance scene */}
                    <rect width="400" height="200" fill="#1a1a1a"/>
                    
                    {/* Building outline */}
                    <rect x="50" y="120" width="300" height="80" fill="#2a2a2a" stroke="#444" strokeWidth="1"/>
                    <rect x="80" y="140" width="60" height="40" fill="#333" stroke="#555" strokeWidth="1"/>
                    <rect x="160" y="140" width="60" height="40" fill="#333" stroke="#555" strokeWidth="1"/>
                    <rect x="240" y="140" width="60" height="40" fill="#333" stroke="#555" strokeWidth="1"/>
                    
                    {/* Person silhouette with red detection box */}
                    <ellipse cx="200" cy="170" rx="8" ry="15" fill="#ff4444"/>
                    <rect x="185" y="150" width="30" height="40" fill="none" stroke="#ff4444" strokeWidth="2" strokeDasharray="4,2"/>
                    
                    {/* Detection label */}
                    <rect x="220" y="145" width="80" height="20" fill="#ff4444" rx="4"/>
                    <text x="225" y="157" fill="white" fontSize="10" fontFamily="Arial">INTRUDER</text>
                    
                    {/* Timestamp */}
                    <text x="10" y="15" fill="#00ff00" fontSize="12" fontFamily="monospace">2024-01-15 23:47:32</text>
                    <text x="10" y="30" fill="#00ff00" fontSize="10" fontFamily="monospace">CAM-03: PARKING</text>
                  </svg>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Confidence: 96%</span>
                  <Badge variant="destructive">HIGH PRIORITY</Badge>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Fire Detection</h3>
                    <p className="text-gray-600">Smoke and flames identified instantly</p>
                  </div>
                </div>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <svg className="w-full h-48" viewBox="0 0 400 200" fill="none">
                    {/* Background scene */}
                    <rect width="400" height="200" fill="#1a1a1a"/>
                    
                    {/* Room outline */}
                    <rect x="20" y="100" width="360" height="100" fill="#2a2a2a" stroke="#444" strokeWidth="1"/>
                    
                    {/* Fire/smoke with detection box */}
                    <circle cx="150" cy="150" r="25" fill="#ff6600" opacity="0.8"/>
                    <circle cx="150" cy="150" r="15" fill="#ffaa00" opacity="0.9"/>
                    <circle cx="150" cy="150" r="8" fill="#ffdd00"/>
                    
                    {/* Smoke */}
                    <ellipse cx="150" cy="120" rx="30" ry="15" fill="#666" opacity="0.6"/>
                    <ellipse cx="160" cy="110" rx="25" ry="12" fill="#888" opacity="0.5"/>
                    
                    {/* Detection box */}
                    <rect x="110" y="105" width="80" height="70" fill="none" stroke="#ff6600" strokeWidth="2" strokeDasharray="4,2"/>
                    
                    {/* Detection label */}
                    <rect x="200" y="130" width="60" height="20" fill="#ff6600" rx="4"/>
                    <text x="205" y="142" fill="white" fontSize="10" fontFamily="Arial">FIRE</text>
                    
                    {/* Timestamp */}
                    <text x="10" y="15" fill="#00ff00" fontSize="12" fontFamily="monospace">2024-01-15 14:23:18</text>
                    <text x="10" y="30" fill="#00ff00" fontSize="10" fontFamily="monospace">CAM-07: WAREHOUSE</text>
                  </svg>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Confidence: 98%</span>
                  <Badge variant="destructive">EMERGENCY</Badge>
                </div>
              </div>
            </div>

            {/* Stats and Features */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detection Capabilities</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">People Detection</span>
                    </div>
                    <span className="text-green-600 font-semibold">99.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CarIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Vehicle Recognition</span>
                    </div>
                    <span className="text-green-600 font-semibold">97.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Fire & Smoke</span>
                    </div>
                    <span className="text-green-600 font-semibold">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Weapon Detection</span>
                    </div>
                    <span className="text-green-600 font-semibold">96.1%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Real-Time Performance</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">0.2s</div>
                    <div className="text-blue-100">Detection Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">24/7</div>
                    <div className="text-blue-100">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">99%</div>
                    <div className="text-blue-100">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">∞</div>
                    <div className="text-blue-100">Scalability</div>
                  </div>
                </div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business needs. Scale up or down anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg'}`}>
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice.toLocaleString('en-IN')}`}
                    </span>
                    {plan.monthlyPrice > 0 && <span className="text-gray-500">/month</span>}
                  </div>
                  {plan.monthlyPrice > 0 && (
                    <p className="text-sm text-gray-500">
                      or ₹{plan.yearlyPrice.toLocaleString('en-IN')}/year (save ₹{((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString('en-IN')})
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section className="py-20 bg-blue-600 px-4 sm:px-6 lg:px-8" id="demo">
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