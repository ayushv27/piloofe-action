import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";
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
  LogOut 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live CCTV Feed", href: "/live-feed", icon: Video },
  { name: "Event Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "AI Search", href: "/search", icon: Search },
  { name: "Employee Monitoring", href: "/employees", icon: Users },
  { name: "Zone & Camera Setup", href: "/zone-setup", icon: Settings },
  { name: "Admin Settings", href: "/admin", icon: ShieldX },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-neutral-200 flex flex-col h-full">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900">Ghoobad.ai</h2>
              <p className="text-xs text-neutral-500">AI Surveillance</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-secondary text-white" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-700">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{user?.username}</p>
            <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center text-left text-sm text-neutral-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
