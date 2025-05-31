import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-blue-100">Piloo.ai Surveillance System Terms of Service</p>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>1. Service Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            By using Piloo.ai surveillance system, you agree to these terms and conditions. 
            This agreement governs your use of our AI-powered CCTV monitoring platform.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>2. System Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You are responsible for the proper installation and configuration of cameras. 
            The system should be used in compliance with local privacy and surveillance laws.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>Ensure cameras are positioned legally and ethically</li>
            <li>Respect privacy rights of individuals</li>
            <li>Use recorded footage only for legitimate security purposes</li>
            <li>Maintain secure access to your surveillance system</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>3. Data Storage & Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Video recordings are stored according to your configured retention policy. 
            You are responsible for managing storage capacity and data lifecycle.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>4. AI Analysis Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our AI-powered analysis features are provided as-is. While we strive for accuracy, 
            automated detection should be supplemented with human verification for critical security decisions.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>5. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Piloo.ai is a monitoring tool and should not be relied upon as the sole security measure. 
            We are not liable for security incidents that occur despite system monitoring.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>6. Updates & Modifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We reserve the right to update these terms and system features. 
            Continued use of the system constitutes acceptance of updated terms.
          </p>
          <p className="text-sm text-slate-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}