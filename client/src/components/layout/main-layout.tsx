import { useAuth } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Heart } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="max-w-full mx-auto p-6">
              {children}
            </div>
          </div>
        </main>
        
        {/* Enhanced Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Terms & Conditions
              </a>
              <a 
                href="#" 
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Privacy Policy
              </a>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a 
                href="https://pyrack.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Pyrack
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
