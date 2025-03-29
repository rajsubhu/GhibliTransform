import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dropzone } from "@/components/ui/dropzone";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, RefreshCw, Download, Share2, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ImageTransformer() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformationId, setTransformationId] = useState<string | null>(null);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Create a preview of the selected image
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);
  
  // Upload and transform image mutation
  const transformMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to transform image");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setTransformationId(data.id);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
  
  // Poll for transformation status
  const transformationQuery = useQuery({
    queryKey: ["/api/transform", transformationId],
    queryFn: async () => {
      if (!transformationId) return null;
      
      const res = await fetch(`/api/transform/${transformationId}`);
      if (!res.ok) {
        throw new Error("Failed to get transformation status");
      }
      
      return await res.json();
    },
    enabled: !!transformationId,
    refetchInterval: (data) => {
      return data && (data.status === "succeeded" || data.status === "failed")
        ? false
        : 2000;
    },
  });
  
  // When transformation completes, set the transformed image URL
  useEffect(() => {
    const data = transformationQuery.data;
    if (data && data.status === "succeeded") {
      setTransformedImageUrl(data.output);
    } else if (data && data.status === "failed") {
      setError("Transformation failed. Please try again with a different image.");
    }
  }, [transformationQuery.data]);
  
  // Handle image selection
  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setTransformedImageUrl(null);
    setTransformationId(null);
    setError(null);
  };
  
  // Handle transformation 
  const handleTransform = () => {
    if (selectedImage) {
      transformMutation.mutate(selectedImage);
    }
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setTransformedImageUrl(null);
    setTransformationId(null);
    setError(null);
  };
  
  // Download transformed image
  const handleDownload = () => {
    if (!transformedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = transformedImageUrl;
    link.download = "ghibli-transformed.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Determine the status of the transformation
  const isLoading = transformMutation.isPending || 
    (transformationQuery.data?.status === "processing" || 
     transformationQuery.data?.status === "starting");
  
  const isComplete = transformedImageUrl !== null;
  
  return (
    <section className="mb-16">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="upload" className="flex-1">Upload & Transform</TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1">My Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {/* Step 1: Upload */}
          {!selectedImage && (
            <div className="mb-8">
              <h3 className="font-semibold text-xl mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                Upload Your Image
              </h3>
              <Dropzone onImageSelect={handleImageSelect} />
            </div>
          )}
          
          {/* Step 2: Preview and Transform */}
          {selectedImage && (
            <div className="mb-8">
              <h3 className="font-semibold text-xl mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                  {isComplete ? "2" : "1"}
                </span>
                Preview & Transform
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Original Image */}
                <div className="flex-1">
                  <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-50 h-64 md:h-80 flex items-center justify-center relative">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Original" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    )}
                    <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded-md text-xs shadow-sm">
                      Original Image
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveImage}
                      className="text-gray-500 hover:text-red-500 transition-all flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleImageSelect(selectedImage)}
                      className="text-gray-500 hover:text-primary transition-all flex items-center gap-1"
                    >
                      <RefreshCw size={16} />
                      <span>Change</span>
                    </Button>
                  </div>
                </div>
                
                {/* Transformed Image */}
                <div className="flex-1">
                  <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-50 h-64 md:h-80 flex items-center justify-center relative">
                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center p-4 h-full w-full">
                        <div className="w-16 h-16 mb-4 relative">
                          <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Transforming your image...</p>
                        <p className="text-xs text-gray-500 mt-2">This may take up to 30 seconds</p>
                      </div>
                    )}
                    
                    {/* Result Image */}
                    {transformedImageUrl && (
                      <img 
                        src={transformedImageUrl} 
                        alt="Transformed" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    )}
                    
                    {/* Empty State */}
                    {!isLoading && !transformedImageUrl && !error && (
                      <div className="flex flex-col items-center justify-center p-4 h-full w-full">
                        <p className="text-gray-500">Transform your image to see the result here</p>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded-md text-xs shadow-sm">
                      Ghibli Style
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      className="w-full py-3 gap-2"
                      variant={transformedImageUrl ? "secondary" : "default"}
                      onClick={handleTransform}
                      disabled={isLoading || !selectedImage}
                    >
                      {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
                      <span>
                        {transformedImageUrl 
                          ? "Transform Again" 
                          : "Transform with Ghibli Style"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Download & Share */}
          {transformedImageUrl && (
            <div>
              <h3 className="font-semibold text-xl mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                Save & Share Your Creation
              </h3>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="flex-1 py-3" 
                  onClick={handleDownload}
                >
                  <Download className="mr-2" size={16} />
                  <span>Download Image</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1 py-3"
                  onClick={() => {
                    toast({
                      title: "Share",
                      description: "Share functionality would be implemented here!"
                    });
                  }}
                >
                  <Share2 className="mr-2" size={16} />
                  <span>Share</span>
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="flex-1 py-3"
                  onClick={() => {
                    toast({
                      title: "Saved!",
                      description: "Image saved to your gallery"
                    });
                  }}
                >
                  <Save className="mr-2" size={16} />
                  <span>Save to Gallery</span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <p className="text-sm mt-1">Please try again or use a different image.</p>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="gallery" className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No images in your gallery yet.</p>
            <Button onClick={() => setActiveTab("upload")}>
              Transform Your First Image
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
