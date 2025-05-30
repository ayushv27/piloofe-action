import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  Search as SearchIcon, 
  Upload, 
  Video, 
  Image, 
  Mic, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Filter,
  Play,
  Download,
  Share2,
  Star,
  Eye,
  AlertTriangle,
  Users,
  Car,
  FileText,
  Brain,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  timestamp: string;
  cameraId: number;
  cameraName: string;
  location: string;
  confidence: number;
  thumbnail: string;
  description: string;
  type: 'person' | 'vehicle' | 'object' | 'event';
  duration?: number;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"text" | "image" | "video" | "audio">("text");
  const [selectedCameras, setSelectedCameras] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);
  const [confidence, setConfidence] = useState([70]);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cameras } = useQuery({
    queryKey: ["/api/cameras"],
  });

  const searchMutation = useMutation({
    mutationFn: async (searchData: any) => {
      const response = await apiRequest("POST", "/api/search", searchData);
      return response;
    },
    onSuccess: (data) => {
      setResults(data.results || []);
      setSearchTime(data.executionTime || null);
      toast({
        title: "Search Complete",
        description: `Found ${data.results?.length || 0} results in ${data.executionTime || 0}ms`,
      });
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Failed to execute search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim() && searchType === "text") {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    const searchData = {
      query: searchQuery,
      queryType: searchType,
      filters: {
        cameraIds: selectedCameras.length > 0 ? selectedCameras : cameras?.map((c: any) => c.id),
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        timeStart: timeRange[0],
        timeEnd: timeRange[1],
        minConfidence: confidence[0],
      },
    };

    searchMutation.mutate(searchData);
    setIsSearching(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload the file and get back a URL or process it
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded for ${searchType} search.`,
    });
    
    setSearchQuery(`[Uploaded: ${file.name}]`);
  };

  const mockResults: SearchResult[] = [
    {
      id: "1",
      timestamp: "2024-01-15T14:30:00Z",
      cameraId: 1,
      cameraName: "Camera 01 - Main Entrance",
      location: "Building A, Floor 1",
      confidence: 95,
      thumbnail: "https://via.placeholder.com/300x200?text=Person+Detected",
      description: "Person in business attire entering through main entrance",
      type: "person",
      duration: 15
    },
    {
      id: "2",
      timestamp: "2024-01-15T16:45:00Z",
      cameraId: 3,
      cameraName: "Camera 03 - Parking",
      location: "Building A, Basement",
      confidence: 88,
      thumbnail: "https://via.placeholder.com/300x200?text=Vehicle+Detected",
      description: "Blue sedan parking in restricted zone",
      type: "vehicle",
      duration: 32
    },
    {
      id: "3",
      timestamp: "2024-01-15T18:20:00Z",
      cameraId: 2,
      cameraName: "Camera 02 - Hallway",
      location: "Building A, Floor 1",
      confidence: 82,
      thumbnail: "https://via.placeholder.com/300x200?text=Suspicious+Activity",
      description: "Person loitering near security office",
      type: "event",
      duration: 120
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'person': return <Users className="h-4 w-4" />;
      case 'vehicle': return <Car className="h-4 w-4" />;
      case 'object': return <FileText className="h-4 w-4" />;
      case 'event': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">AI-Powered CCTV Search</h1>
        <p className="text-neutral-600">Search through your surveillance footage using natural language, images, or audio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Interface */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Multi-Modal Search
              </CardTitle>
              <CardDescription>
                Use AI to search through your footage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Type Selection */}
              <Tabs value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center">
                    <Image className="h-4 w-4 mr-1" />
                    Image
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="video" className="flex items-center">
                    <Video className="h-4 w-4 mr-1" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center">
                    <Mic className="h-4 w-4 mr-1" />
                    Audio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <div>
                    <Label>Natural Language Query</Label>
                    <Textarea
                      placeholder="e.g., 'Show me all people wearing red shirts in the parking area between 2-4 PM'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      rows={3}
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Try: "person with backpack", "car at night", "delivery truck", "suspicious behavior"
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="mt-4">
                  <div>
                    <Label>Upload Reference Image</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-4">
                  <div>
                    <Label>Upload Reference Video</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Upload video clip
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, AVI up to 100MB
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-4">
                  <div>
                    <Label>Upload Audio Sample</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Mic className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Upload audio file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP3, WAV up to 50MB
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Filters */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <Label className="font-medium">Search Filters</Label>
                </div>

                {/* Camera Selection */}
                <div>
                  <Label className="text-sm">Cameras</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All cameras" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cameras</SelectItem>
                      {cameras?.map((camera: any) => (
                        <SelectItem key={camera.id} value={camera.id.toString()}>
                          {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-sm">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          "Pick a date range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Range */}
                <div>
                  <Label className="text-sm">Time Range</Label>
                  <div className="mt-2">
                    <Slider
                      value={timeRange}
                      onValueChange={setTimeRange}
                      max={24}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{timeRange[0]}:00</span>
                      <span>{timeRange[1]}:00</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Threshold */}
                <div>
                  <Label className="text-sm">Minimum Confidence</Label>
                  <div className="mt-2">
                    <Slider
                      value={confidence}
                      onValueChange={setConfidence}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-muted-foreground mt-1">
                      {confidence[0]}%
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSearch}
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search Footage
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Search Results
                  </CardTitle>
                  <CardDescription>
                    {results.length > 0 ? (
                      <>Found {results.length} results{searchTime && ` in ${searchTime}ms`}</>
                    ) : (
                      "Enter a search query to find relevant footage"
                    )}
                  </CardDescription>
                </div>
                {results.length > 0 && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No search performed yet</h3>
                  <p className="text-gray-500 mb-6">
                    Use the search panel to find specific events, people, or objects in your surveillance footage.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-sm text-gray-600">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">Try</Badge>
                      "person with red jacket"
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">Try</Badge>
                      "delivery truck at gate"
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">Try</Badge>
                      "suspicious behavior"
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">Try</Badge>
                      "after 6 PM activity"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <img 
                          src={result.thumbnail} 
                          alt={result.description}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={cn("text-white", getConfidenceColor(result.confidence))}>
                            {result.confidence}%
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="flex items-center">
                            {getTypeIcon(result.type)}
                            <span className="ml-1 capitalize">{result.type}</span>
                          </Badge>
                        </div>
                        {result.duration && (
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {result.duration}s
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{result.cameraName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(result.timestamp), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          {result.location}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline">
                              <Star className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}