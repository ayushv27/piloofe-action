import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, Plus, Save, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Camera, Zone } from "@shared/schema";

export default function ZoneSetup() {
  const queryClient = useQueryClient();
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState("");

  const { data: cameras, isLoading: camerasLoading } = useQuery<Camera[]>({
    queryKey: ["/api/cameras"],
  });

  const { data: zones, isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ["/api/zones"],
  });

  const addZoneMutation = useMutation({
    mutationFn: async (zoneData: { name: string; type: string; description?: string }) => {
      await apiRequest("POST", "/api/zones", zoneData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
      setNewZoneName("");
      setNewZoneType("");
    },
  });

  const updateCameraMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Camera> }) => {
      await apiRequest("PUT", `/api/cameras/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras"] });
    },
  });

  const handleAddZone = () => {
    if (newZoneName && newZoneType) {
      addZoneMutation.mutate({
        name: newZoneName,
        type: newZoneType,
        description: `${newZoneType} zone`
      });
    }
  };

  const handleCameraUpdate = (cameraId: number, field: string, value: any) => {
    updateCameraMutation.mutate({
      id: cameraId,
      data: { [field]: value }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (camerasLoading || zonesLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Zone & Camera Setup</h1>
          <p className="text-neutral-600">Configure zones and assign cameras for monitoring</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                <div className="h-64 bg-neutral-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-neutral-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Zone & Camera Setup</h1>
        <p className="text-neutral-600">Configure zones and assign cameras for monitoring</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floorplan Upload */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Floorplan Management</h3>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center mb-6">
              <div className="w-full h-64 bg-neutral-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {/* Mock floorplan visualization */}
                    <div className="w-16 h-12 bg-blue-200 rounded flex items-center justify-center text-xs">Zone A</div>
                    <div className="w-16 h-12 bg-green-200 rounded flex items-center justify-center text-xs">Zone B</div>
                    <div className="w-16 h-12 bg-orange-200 rounded flex items-center justify-center text-xs">Zone C</div>
                    <div className="w-16 h-12 bg-purple-200 rounded flex items-center justify-center text-xs">Zone D</div>
                    <div className="w-16 h-12 bg-yellow-200 rounded flex items-center justify-center text-xs">Zone E</div>
                    <div className="w-16 h-12 bg-pink-200 rounded flex items-center justify-center text-xs">Zone F</div>
                  </div>
                  <p className="text-sm text-neutral-500">Current Floorplan</p>
                </div>
              </div>
              <div>
                <CloudUpload className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600">Upload new floorplan</p>
                <p className="text-sm text-neutral-500">Drag & drop or click to browse</p>
                <Button className="mt-3" variant="outline">
                  Choose File
                </Button>
              </div>
            </div>
            
            {/* Zone Definition */}
            <div className="space-y-4">
              <h4 className="font-medium text-neutral-900">Define Zones</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Zone name"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                />
                <Select value={newZoneType} onValueChange={setNewZoneType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zone type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrance">Entrance</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="common">Common Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddZone}
                disabled={!newZoneName || !newZoneType || addZoneMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
              
              {/* Existing Zones */}
              {zones && zones.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-neutral-700 mb-2">Existing Zones</h5>
                  <div className="space-y-2">
                    {zones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                        <div>
                          <span className="font-medium">{zone.name}</span>
                          <span className="text-sm text-neutral-500 ml-2">({zone.type})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Camera Assignment */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Camera Assignment</h3>
            
            {/* Available Cameras */}
            <div className="space-y-4">
              {cameras?.map((camera) => (
                <div key={camera.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-neutral-900">{camera.name}</h4>
                      <p className="text-sm text-neutral-500">{camera.ip}</p>
                    </div>
                    <Badge className={getStatusColor(camera.status)}>
                      {camera.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Assigned Zone</Label>
                      <Select 
                        value={camera.assignedZone || ""} 
                        onValueChange={(value) => handleCameraUpdate(camera.id, "assignedZone", value)}
                        disabled={camera.status !== "active"}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Assign to zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No zone assigned</SelectItem>
                          {zones?.map((zone) => (
                            <SelectItem key={zone.id} value={zone.name.toLowerCase().replace(/\s+/g, '-')}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Detection Sensitivity</Label>
                      <div className="mt-1">
                        <Slider
                          value={[camera.sensitivity || 7]}
                          onValueChange={(value) => handleCameraUpdate(camera.id, "sensitivity", value[0])}
                          max={10}
                          min={1}
                          step={1}
                          disabled={camera.status !== "active"}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 text-sm">
                    <span className="text-neutral-600">
                      Detection Sensitivity: <span className="font-medium">{(camera.sensitivity || 7) * 10}%</span>
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      disabled={camera.status !== "active"}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="w-full mt-6">
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
