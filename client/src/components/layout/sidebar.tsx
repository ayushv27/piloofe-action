import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  Users, 
  Settings, 
  ShieldX, 
  BarChart3,
  Search,
  FileVideo,
  LogOut,
  Menu,
  X,
  Sparkles,
  Crown
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ask My CCTV", href: "/ai-chat", icon: Sparkles },
  { name: "Live CCTV Feed", href: "/live-feed", icon: Video },
  { name: "Recordings Archive", href: "/recordings", icon: FileVideo },
  { name: "Event Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Employee Monitoring", href: "/employees", icon: Users },
  { name: "Zone & Camera Setup", href: "/zone-setup", icon: Settings },
  { name: "Subscription Plans", href: "/subscription", icon: Shield },
  { name: "Admin Settings", href: "/admin", icon: ShieldX },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl border-r border-slate-700 flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-white">Piloo.ai</h2>
                <p className="text-xs text-slate-400">AI Surveillance</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isCollapsed && <NotificationBell />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-white hover:bg-slate-700 p-2"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )} />
                    {!isCollapsed && (
                      <span className="font-medium truncate">{item.name}</span>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className={cn(
          "flex items-center mb-3",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          )}
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          size="sm"
          className={cn(
            "text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors",
            isCollapsed ? "w-full p-2" : "w-full justify-start"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
