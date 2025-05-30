import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Expand, Grid3X3, Volume2, Camera as CameraIcon } from "lucide-react";
import type { Camera } from "@shared/schema";

export default function LiveFeed() {
  const { data: cameras, isLoading } = useQuery<Camera[]>({
    queryKey: ["/api/cameras"],
  });

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Live CCTV Feed</h1>
          <p className="text-neutral-600">Real-time camera monitoring with AI detection</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Expand className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
          <Button variant="outline">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Switch View
          </Button>
        </div>
      </div>
      
      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCameras.map((camera) => (
          <Card key={camera.id} className="overflow-hidden">
            <div className="relative">
              {/* Mock camera feed */}
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
                
                {/* AI Detection overlay (simulated) */}
                {camera.id === 1 && (
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
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <CameraIcon className="h-4 w-4" />
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
            <Card key={`empty-${i}`} className="overflow-hidden">
              <div className="aspect-video bg-neutral-100 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">No Camera Assigned</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-neutral-500">Empty Slot</h4>
                  <p className="text-sm text-neutral-400">Configure camera in setup</p>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
}
