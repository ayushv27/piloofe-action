import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Expand, 
  Grid3X3, 
  Volume2, 
  Camera as CameraIcon, 
  Plus, 
  Minimize2, 
  Settings, 
  Play,
  Square,
  RotateCcw
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Camera } from "@shared/schema";

const addCameraSchema = z.object({
  name: z.string().min(1, "Camera name is required"),
  location: z.string().min(1, "Location is required"),
  rtspUrl: z.string().url("Valid RTSP URL is required").refine(
    (url) => url.startsWith("rtsp://"),
    "URL must start with rtsp://"
  ),
  status: z.enum(["active", "inactive"]).default("active")
});

type AddCameraForm = z.infer<typeof addCameraSchema>;

export default function LiveFeed() {
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cameras, isLoading } = useQuery<Camera[]>({
    queryKey: ["/api/cameras"],
  });

  const addCameraMutation = useMutation({
    mutationFn: async (data: AddCameraForm) => {
      return apiRequest("POST", "/api/cameras", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Camera Added",
        description: "New CCTV camera has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add camera. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AddCameraForm>({
    resolver: zodResolver(addCameraSchema),
    defaultValues: {
      name: "",
      location: "",
      rtspUrl: "",
      status: "active"
    }
  });

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleViewMode = () => {
    if (viewMode === "grid") {
      setViewMode("single");
      if (cameras && cameras.length > 0) {
        setSelectedCamera(cameras[0]);
      }
    } else {
      setViewMode("grid");
      setSelectedCamera(null);
    }
  };

  const onSubmit = (data: AddCameraForm) => {
    addCameraMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Live CCTV Feed</h1>
            <p className="text-neutral-600">Real-time camera monitoring with AI detection</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-neutral-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeCameras = cameras?.filter(camera => camera.status === "active") || [];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Live CCTV Feed</h1>
          <p className="text-neutral-600">Real-time camera monitoring with AI detection</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Camera
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New CCTV Camera</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Camera Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="e.g., Main Entrance Camera"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...form.register("location")}
                    placeholder="e.g., Building A - Entrance"
                  />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="rtspUrl">RTSP Stream URL</Label>
                  <Input
                    id="rtspUrl"
                    {...form.register("rtspUrl")}
                    placeholder="rtsp://username:password@ip:port/stream"
                    type="url"
                  />
                  {form.formState.errors.rtspUrl && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.rtspUrl.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="active" onValueChange={(value) => form.setValue("status", value as "active" | "inactive")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addCameraMutation.isPending}>
                    {addCameraMutation.isPending ? "Adding..." : "Add Camera"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Expand className="h-4 w-4 mr-2" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          
          <Button variant="outline" onClick={toggleViewMode}>
            <Grid3X3 className="h-4 w-4 mr-2" />
            {viewMode === "grid" ? "Single View" : "Grid View"}
          </Button>
        </div>
      </div>
      
      {/* Camera Display */}
      {viewMode === "single" && selectedCamera ? (
        /* Single Camera View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">{selectedCamera.name}</h3>
              <Badge variant={selectedCamera.status === "active" ? "default" : "secondary"}>
                {selectedCamera.status}
              </Badge>
            </div>
            <div className="flex space-x-2">
              {cameras && cameras.length > 1 && (
                <Select 
                  value={selectedCamera.id.toString()} 
                  onValueChange={(value) => {
                    const camera = cameras.find(c => c.id.toString() === value);
                    if (camera) setSelectedCamera(camera);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id.toString()}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <Card className="overflow-hidden">
            <div className="relative">
              <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg opacity-75">Live Feed</p>
                    <p className="text-sm opacity-50">{selectedCamera.name}</p>
                    <p className="text-xs opacity-40 mt-2">RTSP: {selectedCamera.rtspUrl || "Not configured"}</p>
                  </div>
                </div>
                
                {/* Live indicator */}
                <div className="absolute top-6 left-6 flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-lg font-medium">LIVE</span>
                </div>
                
                {/* Camera controls overlay */}
                <div className="absolute bottom-6 right-6 flex space-x-2">
                  <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {activeCameras.map((camera) => (
            <Card key={camera.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => {
                    setSelectedCamera(camera);
                    setViewMode("single");
                  }}>
              <div className="relative">
                <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <CameraIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Live Feed</p>
                      <p className="text-xs opacity-50">{camera.name}</p>
                    </div>
                  </div>
                  
                  {/* Live indicator */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">LIVE</span>
                  </div>
                  
                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant={camera.status === "active" ? "default" : "secondary"} className="bg-black/50">
                      {camera.status}
                    </Badge>
                  </div>
                  
                  {/* AI Detection overlay (simulated for demo) */}
                  {camera.id === 9 && (
                    <div className="absolute inset-0">
                      <div className="absolute top-12 left-16 w-20 h-32 border-2 border-green-400 bg-green-400/10 rounded">
                        <div className="bg-green-400 text-white text-xs px-2 py-1 rounded -mt-6">Person 94%</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Camera Info */}
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{camera.name}</h4>
                      <p className="text-sm text-neutral-500">{camera.location}</p>
                      {camera.rtspUrl && (
                        <p className="text-xs text-neutral-400 mt-1 font-mono truncate">
                          {camera.rtspUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        // Handle audio toggle
                      }}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        // Handle settings
                      }}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        
          {/* Fill remaining slots if less than 4 cameras */}
          {activeCameras.length < 4 && 
            [...Array(4 - activeCameras.length)].map((_, i) => (
              <Card key={`empty-${i}`} className="overflow-hidden border-dashed">
                <div className="aspect-video bg-neutral-50 flex items-center justify-center">
                  <div className="text-center text-neutral-400">
                    <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">No Camera Assigned</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-500">Empty Slot</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Camera
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
