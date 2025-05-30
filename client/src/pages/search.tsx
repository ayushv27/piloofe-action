import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search as SearchIcon, 
  Upload, 
  Video, 
  Image, 
  Mic, 
  Clock,
  MapPin,
  Play,
  Download,
  Brain,
  Zap
} from "lucide-react";
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
  const [searchType, setSearchType] = useState("text");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: cameras = [] } = useQuery<any[]>({
    queryKey: ["/api/cameras"],
  });

  const searchMutation = useMutation({
    mutationFn: async (searchData: any) => {
      // For now, return mock data since we need OpenAI API key for real search
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      return {
        results: [
          {
            id: "1",
            timestamp: "2024-01-15T14:30:00Z",
            cameraId: 1,
            cameraName: "Main Entrance",
            location: "Building A - Entrance",
            confidence: 0.92,
            thumbnail: "/api/placeholder/160/120",
            description: "Person matching search criteria detected",
            type: "person" as const,
            duration: 45
          },
          {
            id: "2", 
            timestamp: "2024-01-15T16:15:00Z",
            cameraId: 2,
            cameraName: "Parking Lot",
            location: "Outdoor - Parking",
            confidence: 0.87,
            thumbnail: "/api/placeholder/160/120",
            description: "Vehicle activity matching search parameters",
            type: "vehicle" as const,
            duration: 120
          }
        ],
        executionTime: 1850
      };
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
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to find footage.",
        variant: "destructive",
      });
      return;
    }

    const searchData = {
      query: searchQuery,
      queryType: searchType,
      filters: {
        cameraIds: cameras.map((c: any) => c.id),
      }
    };

    searchMutation.mutate(searchData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Search</h1>
        <p className="text-muted-foreground">
          Search through surveillance footage using natural language, images, or audio queries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Multi-Modal Search
              </CardTitle>
              <CardDescription>
                Use AI to search footage with text, images, video, or audio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={searchType} onValueChange={setSearchType}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text">
                    <SearchIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <Image className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    <Video className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="audio">
                    <Mic className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="text-search">Natural Language Query</Label>
                    <Textarea
                      id="text-search"
                      placeholder="Describe what you're looking for... e.g., 'person with red jacket entering through main door'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="min-h-[100px] mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div>
                    <Label>Upload Reference Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload an image or drag and drop</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Describe what to look for in the image..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <div>
                    <Label>Upload Reference Video</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload a video clip to find similar footage</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Additional search context..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  <div>
                    <Label>Upload Audio File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload audio to find matching sounds</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Describe the audio you're looking for..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </TabsContent>
              </Tabs>

              <Button 
                onClick={handleSearch}
                className="w-full"
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Search Footage
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Results</CardTitle>
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
                  <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-40 h-30 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.cameraName}
                          </h4>
                          <Badge 
                            variant={result.confidence > 0.9 ? "default" : "secondary"}
                          >
                            {Math.round(result.confidence * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {result.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-2 space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {result.location}
                          </span>
                          {result.duration && (
                            <span>{result.duration}s duration</span>
                          )}
                        </div>
                      </div>
                    </div>
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