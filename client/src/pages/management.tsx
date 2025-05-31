import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Settings, 
  CreditCard, 
  Shield, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Ban,
  CheckCircle,
  XCircle,
  Crown,
  Building2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Client {
  id: number;
  username: string;
  email: string;
  role: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  maxCameras: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionEndsAt: Date | null;
  createdAt: Date | null;
  lastLogin?: Date;
  isActive: boolean;
  menuPermissions: {
    dashboard: boolean;
    aiChat: boolean;
    liveFeed: boolean;
    recordings: boolean;
    alerts: boolean;
    employees: boolean;
    zones: boolean;
    reports: boolean;
    subscription: boolean;
  };
}

const clientSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  subscriptionPlan: z.string().optional(),
  maxCameras: z.number().min(1).max(50),
  isActive: z.boolean(),
});

type ClientForm = z.infer<typeof clientSchema>;

export default function Management() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Fetch clients data
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/admin/clients"],
    queryFn: async () => {
      const users = await apiRequest("GET", "/api/users");
      return users.map((user: any) => ({
        ...user,
        isActive: true,
        lastLogin: new Date(),
        menuPermissions: {
          dashboard: true,
          aiChat: true,
          liveFeed: true,
          recordings: true,
          alerts: true,
          employees: true,
          zones: true,
          reports: true,
          subscription: true,
        }
      }));
    }
  });

  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });

  // Form handling
  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      username: "",
      email: "",
      maxCameras: 5,
      isActive: true,
    },
  });

  // Mutations
  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: number; data: Partial<Client> }) => {
      return await apiRequest("PUT", `/api/admin/clients/${clientId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      toast({ title: "Client updated successfully" });
      setIsEditDialogOpen(false);
    },
  });

  const toggleClientStatusMutation = useMutation({
    mutationFn: async ({ clientId, isActive }: { clientId: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/admin/clients/${clientId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      toast({ 
        title: `Client ${selectedClient?.isActive ? 'deactivated' : 'activated'} successfully` 
      });
    },
  });

  const refundClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      return await apiRequest("POST", `/api/admin/clients/${clientId}/refund`);
    },
    onSuccess: () => {
      toast({ title: "Refund processed successfully" });
    },
  });

  const updateMenuPermissionsMutation = useMutation({
    mutationFn: async ({ clientId, permissions }: { clientId: number; permissions: any }) => {
      return await apiRequest("PUT", `/api/admin/clients/${clientId}/permissions`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      toast({ title: "Menu permissions updated" });
    },
  });

  // Helper functions
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-500">Past Due</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'Professional':
        return <Badge className="bg-blue-500"><Crown className="w-3 h-3 mr-1" />Pro</Badge>;
      case 'Enterprise':
        return <Badge className="bg-purple-500"><Crown className="w-3 h-3 mr-1" />Enterprise</Badge>;
      default:
        return <Badge variant="outline">Starter</Badge>;
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    form.reset({
      username: client.username,
      email: client.email,
      subscriptionPlan: client.subscriptionPlan || undefined,
      maxCameras: client.maxCameras || 5,
      isActive: client.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleMenuPermissionChange = (clientId: number, menu: string, enabled: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const updatedPermissions = {
        ...client.menuPermissions,
        [menu]: enabled
      };
      updateMenuPermissionsMutation.mutate({ clientId, permissions: updatedPermissions });
    }
  };

  if (clientsLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Piloo.ai Management Panel</h1>
              <p className="text-muted-foreground">Manage all Piloo.ai clients, subscriptions, and system access</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
            {viewMode === 'table' ? 'Grid View' : 'Table View'}
          </Button>
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input {...form.register("username")} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input {...form.register("email")} type="email" />
                </div>
                <div>
                  <Label htmlFor="maxCameras">Max Cameras</Label>
                  <Input {...form.register("maxCameras", { valueAsNumber: true })} type="number" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
                <Button>Add Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="subscriptions">Billing & Subscriptions</TabsTrigger>
          <TabsTrigger value="permissions">Feature Access Control</TabsTrigger>
          <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Piloo.ai Clients</CardTitle>
              <CardDescription>Manage all registered clients and their account status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cameras</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${client.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-medium">{client.username}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(client.subscriptionPlan)}</TableCell>
                      <TableCell>{getStatusBadge(client.subscriptionStatus)}</TableCell>
                      <TableCell>{client.maxCameras || 'Unlimited'}</TableCell>
                      <TableCell>
                        {client.lastLogin ? new Date(client.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {client.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {client.isActive ? 'Deactivate' : 'Activate'} Client
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to {client.isActive ? 'deactivate' : 'activate'} {client.username}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => toggleClientStatusMutation.mutate({ 
                                    clientId: client.id, 
                                    isActive: !client.isActive 
                                  })}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing Management</CardTitle>
              <CardDescription>Handle billing, refunds, and plan changes for all clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>Billing Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.filter(client => client.subscriptionPlan).map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.username}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(client.subscriptionPlan)}</TableCell>
                      <TableCell>{getStatusBadge(client.subscriptionStatus)}</TableCell>
                      <TableCell>
                        {client.subscriptionEndsAt ? 
                          new Date(client.subscriptionEndsAt).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select value={client.subscriptionPlan || undefined}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Change Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(subscriptionPlans) && subscriptionPlans.map((plan: any) => (
                                <SelectItem key={plan.id} value={plan.name}>
                                  {plan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <DollarSign className="w-4 h-4 mr-1" />
                                Refund
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Process Refund</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will process a full refund for {client.username}'s current subscription. 
                                  The refund will be sent to their original payment method.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => refundClientMutation.mutate(client.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Process Refund
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Access Control</CardTitle>
              <CardDescription>Enable or disable specific features for each client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{client.username}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      {getPlanBadge(client.subscriptionPlan)}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(client.menuPermissions).map(([menu, enabled]) => (
                        <div key={menu} className="flex items-center justify-between">
                          <Label htmlFor={`${client.id}-${menu}`} className="capitalize">
                            {menu.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            id={`${client.id}-${menu}`}
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              handleMenuPermissionChange(client.id, menu, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Clients:</span>
                  <span className="font-medium">{clients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Subscriptions:</span>
                  <span className="font-medium">
                    {clients.filter(c => c.subscriptionStatus === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Free Accounts:</span>
                  <span className="font-medium">
                    {clients.filter(c => !c.subscriptionPlan).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cameras:</span>
                  <span className="font-medium">
                    {clients.reduce((sum, c) => sum + (c.maxCameras || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Monthly Revenue:</span>
                  <span className="font-medium text-green-600">$2,850</span>
                </div>
                <div className="flex justify-between">
                  <span>Churn Rate:</span>
                  <span className="font-medium">2.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Revenue per User:</span>
                  <span className="font-medium">$47.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Lifetime Value:</span>
                  <span className="font-medium">$1,425</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Management Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Stripe Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Newsletter
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Export Client Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Platform Maintenance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client: {selectedClient?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input {...form.register("username")} />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input {...form.register("email")} type="email" />
            </div>
            <div>
              <Label htmlFor="edit-plan">Subscription Plan</Label>
              <Select value={form.watch("subscriptionPlan")} onValueChange={(value) => form.setValue("subscriptionPlan", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Plan</SelectItem>
                  {Array.isArray(subscriptionPlans) && subscriptionPlans.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.name}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-cameras">Max Cameras</Label>
              <Input {...form.register("maxCameras", { valueAsNumber: true })} type="number" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch {...form.register("isActive")} />
              <Label>Account Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedClient) {
                  updateClientMutation.mutate({
                    clientId: selectedClient.id,
                    data: form.getValues()
                  });
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}