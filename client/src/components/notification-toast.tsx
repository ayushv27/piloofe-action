import { useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

function getToastIcon(priority: string) {
  switch (priority) {
    case 'critical':
    case 'high':
      return <AlertTriangle className="h-4 w-4" />;
    case 'medium':
      return <Info className="h-4 w-4" />;
    case 'low':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

export function NotificationToast() {
  const { notifications } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Only show toast for high priority notifications
      if (latestNotification.priority === 'high' || latestNotification.priority === 'critical') {
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          variant: latestNotification.priority === 'critical' ? 'destructive' : 'default',
        });
      }
    }
  }, [notifications, toast]);

  return null; // This component doesn't render anything visually
}