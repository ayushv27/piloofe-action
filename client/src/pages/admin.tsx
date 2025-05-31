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
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserForm> }) => {
      await apiRequest("PUT", `/api/users/${id}`, userData);
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

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (usersLoading || settingsLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={form.handleSubmit((data) => addUserMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input {...form.register("username")} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input {...form.register("email")} type="email" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input {...form.register("password")} type="password" />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={form.watch("role")} onValueChange={(value) => form.setValue("role", value as any)}>
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
                    <Button type="submit" disabled={addUserMutation.isPending}>
                      {addUserMutation.isPending ? "Adding..." : "Add User"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            
            {settings && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Alert Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="intrusion-alerts">Intrusion Detection</Label>
                    <Switch
                      id="intrusion-alerts"
                      checked={settings.alertsIntrusion}
                      onCheckedChange={(checked) => handleSettingChange("alertsIntrusion", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="motion-alerts">Motion Detection</Label>
                    <Switch
                      id="motion-alerts"
                      checked={settings.alertsMotion}
                      onCheckedChange={(checked) => handleSettingChange("alertsMotion", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="employee-alerts">Employee Monitoring</Label>
                    <Switch
                      id="employee-alerts"
                      checked={settings.alertsEmployee}
                      onCheckedChange={(checked) => handleSettingChange("alertsEmployee", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Recording Settings</h3>
                  
                  <div>
                    <Label htmlFor="retention-days">Recording Retention (days)</Label>
                    <Slider
                      id="retention-days"
                      min={1}
                      max={365}
                      step={1}
                      value={[settings.recordingRetentionDays || 30]}
                      onValueChange={([value]) => handleSettingChange("recordingRetentionDays", value)}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {settings.recordingRetentionDays || 30} days
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="recording-quality">Default Recording Quality</Label>
                    <Select 
                      value={settings.recordingQuality || "high"} 
                      onValueChange={(value) => handleSettingChange("recordingQuality", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (720p)</SelectItem>
                        <SelectItem value="medium">Medium (1080p)</SelectItem>
                        <SelectItem value="high">High (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Security Settings</h3>
                  
                  <div>
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxLoginAttempts || 3}
                      onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Slider
                      id="session-timeout"
                      min={5}
                      max={480}
                      step={5}
                      value={[settings.sessionTimeoutMinutes || 60]}
                      onValueChange={([value]) => handleSettingChange("sessionTimeoutMinutes", value)}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {settings.sessionTimeoutMinutes || 60} minutes
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updateSettingsMutation.mutate({})}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser.username}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  defaultValue={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({...editingUser, role: value})}
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
              <Button
                onClick={() => updateUserMutation.mutate({
                  id: editingUser.id,
                  userData: {
                    username: editingUser.username,
                    email: editingUser.email,
                    role: editingUser.role as any,
                    password: editingUser.password
                  }
                })}
                disabled={updateUserMutation.isPending}
                className="w-full"
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}