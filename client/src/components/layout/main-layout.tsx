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
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="hover:text-gray-900 transition-colors"
              >
                Terms & Conditions
              </a>
              <a 
                href="#" 
                className="hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by</span>
              <a 
                href="https://pyrack.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
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
