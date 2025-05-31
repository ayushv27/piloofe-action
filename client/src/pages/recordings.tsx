import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Play, 
  Download, 
  Search, 
  Calendar as CalendarIcon,
  Clock,
  HardDrive,
  Video,
  Filter,
  Eye,
  FileVideo,
  Camera as CameraIcon,
  MapPin,
  Volume2,
  Maximize2
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { Recording, Camera } from "@shared/schema";

export default function Recordings() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedQuality, setSelectedQuality] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const { data: cameras = [] } = useQuery<Camera[]>({
    queryKey: ["/api/cameras"],
  });

  const { data: recordings = [], isLoading } = useQuery<Recording[]>({
    queryKey: ["/api/recordings", selectedCamera, timeRange, selectedDate, selectedQuality],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (selectedCamera !== "all") {
        params.append("cameraId", selectedCamera);
      }
      
      if (selectedQuality !== "all") {
        params.append("quality", selectedQuality);
      }

      let startDate, endDate;
      if (timeRange === "today") {
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
      } else if (timeRange === "7days") {
        startDate = startOfDay(subDays(new Date(), 7));
        endDate = endOfDay(new Date());
      } else if (timeRange === "15days") {
        startDate = startOfDay(subDays(new Date(), 15));
        endDate = endOfDay(new Date());
      } else if (timeRange === "custom") {
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
      }

      if (startDate && endDate) {
        params.append("startDate", startDate.toISOString());
        params.append("endDate", endDate.toISOString());
      }

      const response = await fetch(`/api/recordings?${params}`);
      return response.json();
    },
  });

  const filteredRecordings = recordings.filter(recording => {
    if (!searchQuery) return true;
    const camera = cameras.find(c => c.id === recording.cameraId);
    return (
      camera?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera?.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getCameraName = (cameraId: number) => {
    const camera = cameras.find(c => c.id === cameraId);
    return camera?.name || `Camera ${cameraId}`;
  };

  const getCameraLocation = (cameraId: number) => {
    const camera = cameras.find(c => c.id === cameraId);
    return camera?.location || "Unknown Location";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Video className="h-8 w-8 mr-3" />
            Recordings Archive
          </h1>
          <p className="text-muted-foreground">
            View and manage your CCTV footage history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center">
            <HardDrive className="h-3 w-3 mr-1" />
            {recordings.length} recordings
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="15days">Last 15 Days</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeRange === "custom" && (
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label>Camera</Label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cameras</SelectItem>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id.toString()}>
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quality</Label>
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualities</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search recordings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileVideo className="h-5 w-5 mr-2" />
                  Recordings ({filteredRecordings.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                      <div className="w-20 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRecordings.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings found</h3>
                  <p className="text-gray-500">
                    No recordings match your current filters. Try adjusting the time range or camera selection.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredRecordings.map((recording) => (
                    <div
                      key={recording.id}
                      className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedRecording?.id === recording.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedRecording(recording)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-16 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                          {recording.thumbnailPath ? (
                            <img 
                              src={recording.thumbnailPath} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Play className="h-6 w-6 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">
                              {getCameraName(recording.cameraId)}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{recording.quality}</Badge>
                              {recording.hasMotion && (
                                <Badge variant="default" className="bg-orange-100 text-orange-800">
                                  Motion
                                </Badge>
                              )}
                              {recording.hasAudio && (
                                <Volume2 className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {getCameraLocation(recording.cameraId)}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(recording.startTime), "MMM d, HH:mm")}
                              </span>
                              <span>Duration: {formatDuration(recording.duration)}</span>
                              <span>Size: {formatFileSize(recording.fileSize)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Video Player */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRecording ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <video 
                      controls 
                      className="w-full h-full rounded-lg"
                      poster={selectedRecording.thumbnailPath || undefined}
                    >
                      <source src={selectedRecording.filePath || ''} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getCameraName(selectedRecording.cameraId)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getCameraLocation(selectedRecording.cameraId)}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Time:</span>
                        <span>{format(new Date(selectedRecording.startTime), "MMM d, yyyy HH:mm:ss")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">End Time:</span>
                        <span>{format(new Date(selectedRecording.endTime), "MMM d, yyyy HH:mm:ss")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span>{formatDuration(selectedRecording.duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quality:</span>
                        <span>{selectedRecording.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">File Size:</span>
                        <span>{formatFileSize(selectedRecording.fileSize)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Fullscreen
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Select a recording to preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}