import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User, SystemSettings } from "@shared/schema";

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "security", "hr"]),
});

type UserForm = z.infer<typeof userSchema>;

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: UserForm) => {
      await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddUserOpen(false);
      form.reset();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserForm> }) => {
      await apiRequest("PUT", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<SystemSettings>) => {
      await apiRequest("PUT", "/api/settings", settingsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "security",
    },
  });

  const onSubmit = (data: UserForm) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      addUserMutation.mutate(data);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role as "admin" | "security" | "hr",
    });
    setIsAddUserOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddUserOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const testNotification = async (type: string, priority: string, title: string, message: string) => {
    try {
      await apiRequest("POST", "/api/notifications/test", {
        type,
        priority,
        title,
        message
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  };

  const simulateCameraEvent = async (cameraId: number, eventType: string) => {
    try {
      await apiRequest("POST", "/api/simulate/camera-event", {
        cameraId,
        eventType
      });
      // Refresh alerts after simulation
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    } catch (error) {
      console.error("Failed to simulate camera event:", error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "security":
        return "bg-orange-100 text-orange-800";
      case "hr":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (usersLoading || settingsLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Admin Settings</h1>
          <p className="text-neutral-600">Manage users, roles, and system configuration</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Admin Settings</h1>
        <p className="text-neutral-600">Manage users, roles, and system configuration</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">User Management</h3>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingUser(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label>Username</Label>
                      <Input {...form.register("username")} />
                      {form.formState.errors.username && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" {...form.register("email")} />
                      {form.formState.errors.email && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Password {editingUser && "(leave blank to keep current)"}</Label>
                      <Input type="password" {...form.register("password")} />
                      {form.formState.errors.password && (
                        <p className="text-red-600 text-sm mt-1">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select 
                        value={form.watch("role")} 
                        onValueChange={(value) => form.setValue("role", value as "admin" | "security" | "hr")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addUserMutation.isPending || updateUserMutation.isPending}>
                        {editingUser ? "Update" : "Add"} User
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {getInitials(user.username)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{user.username}</p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* System Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Configuration</h3>
            
            <div className="space-y-6">
              {/* Alert Settings */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Alert Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Intrusion Detection</span>
                    <Switch 
                      checked={settings?.alertsIntrusion ?? false}
                      onCheckedChange={(checked) => handleSettingChange("alertsIntrusion", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Motion Detection</span>
                    <Switch 
                      checked={settings?.alertsMotion ?? false}
                      onCheckedChange={(checked) => handleSettingChange("alertsMotion", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Loitering Detection</span>
                    <Switch 
                      checked={settings?.alertsLoitering ?? false}
                      onCheckedChange={(checked) => handleSettingChange("alertsLoitering", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Vehicle Detection</span>
                    <Switch 
                      checked={settings?.alertsVehicle ?? false}
                      onCheckedChange={(checked) => handleSettingChange("alertsVehicle", checked)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Detection Sensitivity */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Global Detection Sensitivity</h4>
                <div className="space-y-2">
                  <Slider
                    value={[settings?.globalSensitivity || 6]}
                    onValueChange={(value) => handleSettingChange("globalSensitivity", value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Low</span>
                    <span className="font-medium">{(settings?.globalSensitivity || 6) * 10}%</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
              
              {/* Real-time Notification Testing */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Real-time Notifications Testing</h4>
                <div className="space-y-3">
                  <Button
                    onClick={() => testNotification('test', 'medium', 'Test Notification', 'This is a test notification')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Send Test Notification
                  </Button>
                  <Button
                    onClick={() => testNotification('alert', 'high', 'High Priority Alert', 'This is a high priority test alert')}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Send High Priority Alert
                  </Button>
                  <Button
                    onClick={() => simulateCameraEvent(1, 'motion')}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    Simulate Motion Detection
                  </Button>
                  <Button
                    onClick={() => simulateCameraEvent(1, 'intrusion')}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Simulate Intrusion Alert
                  </Button>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Email Notifications</span>
                    <Switch 
                      checked={settings?.notificationsEmail ?? false}
                      onCheckedChange={(checked) => handleSettingChange("notificationsEmail", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">SMS Alerts</span>
                    <Switch 
                      checked={settings?.notificationsSms ?? false}
                      onCheckedChange={(checked) => handleSettingChange("notificationsSms", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Push Notifications</span>
                    <Switch 
                      checked={settings?.notificationsPush ?? false}
                      onCheckedChange={(checked) => handleSettingChange("notificationsPush", checked)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Data Retention */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Data Retention</h4>
                <Select 
                  value={settings?.dataRetention?.toString()} 
                  onValueChange={(value) => handleSettingChange("dataRetention", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full mt-6" disabled={updateSettingsMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
