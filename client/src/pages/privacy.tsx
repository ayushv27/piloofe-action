import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-blue-100">How Piloo.ai protects and handles your data</p>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>1. Data Collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Piloo.ai collects and processes surveillance video data, system logs, and user configuration settings 
            necessary for providing security monitoring services.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>Video recordings from connected cameras</li>
            <li>Motion detection and alert data</li>
            <li>System performance metrics</li>
            <li>User access logs and settings</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>2. Data Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            All surveillance data is stored locally on your premises or in your designated cloud storage. 
            We do not have access to your video recordings unless explicitly granted for support purposes.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>3. AI Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our AI analysis features process video data locally on your system. 
            No video content is transmitted to external servers for AI processing without your explicit consent.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>4. Data Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We do not share, sell, or distribute your surveillance data to third parties. 
            Data may only be shared when legally required by law enforcement with proper authorization.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>5. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Video recordings are retained according to your configured settings. 
            You have full control over data retention periods and can delete recordings at any time.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>6. Security Measures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We implement industry-standard security measures including encryption, 
            secure authentication, and regular security updates to protect your data.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>End-to-end encryption for data transmission</li>
            <li>Secure user authentication and access control</li>
            <li>Regular security audits and updates</li>
            <li>Automated backup and disaster recovery</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>7. Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You have the right to access, modify, or delete your data at any time. 
            Contact support for assistance with data requests or privacy concerns.
          </p>
          <p className="text-sm text-slate-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}