import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, Star, Package, Image, Gift, Zap, Info, Sparkles } from "lucide-react";

interface Product {
  id: number;
  type: string;
  name: string;
  price: number;
  features: string[];
  popular: boolean;
  image: string;
}

// Ghibli-themed product types
const productTypes = [
  {
    id: "digital",
    name: "Digital Downloads",
    description: "Instantly download your Ghibli-style artwork for digital use"
  },
  {
    id: "prints",
    name: "Premium Prints",
    description: "High-quality physical prints shipped worldwide"
  },
  {
    id: "merchandise",
    name: "Custom Merchandise",
    description: "Your Ghibli-style artwork on t-shirts, mugs, and more"
  }
];

// Ghibli-themed products
const ghibliProducts = [
  {
    id: 1,
    type: "digital",
    name: "Ghibli Digital Art - Personal License",
    price: 9.99,
    features: [
      "High-resolution digital file",
      "Personal use license",
      "Instant download",
      "Multiple formats (JPG, PNG, PDF)"
    ],
    popular: false,
    image: "https://images.unsplash.com/photo-1533135347859-2d6efd2b5ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    type: "digital",
    name: "Ghibli Digital Art - Commercial License",
    price: 29.99,
    features: [
      "High-resolution digital file",
      "Commercial use license",
      "Instant download",
      "Multiple formats (JPG, PNG, PDF, SVG)",
      "Print rights included",
      "Priority support"
    ],
    popular: true,
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    type: "prints",
    name: "Totoro Forest Art Print - 12\" x 16\"",
    price: 39.99,
    features: [
      "Gallery-quality printing",
      "Archival paper",
      "Vibrant Ghibli-inspired colors",
      "Ready to frame",
      "Signed digital certificate",
      "Worldwide shipping"
    ],
    popular: false,
    image: "https://images.unsplash.com/photo-1605941442838-33e316b1d2c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    type: "prints",
    name: "Spirited Away Framed Art - 18\" x 24\"",
    price: 89.99,
    features: [
      "Gallery-quality printing",
      "Archival paper",
      "Elegant frame included",
      "UV-protective glass",
      "Ready to hang",
      "Signed digital certificate",
      "Worldwide shipping"
    ],
    popular: true,
    image: "https://images.unsplash.com/photo-1581337544825-790a880ced7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    type: "merchandise",
    name: "My Neighbor Totoro T-Shirt",
    price: 29.99,
    features: [
      "Premium cotton fabric",
      "Your custom Ghibli-style image",
      "Multiple sizes available",
      "Long-lasting print",
      "Machine washable",
      "Global shipping"
    ],
    popular: false,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    type: "merchandise",
    name: "Spirited Away Merchandise Bundle",
    price: 99.99,
    features: [
      "T-shirt with your Ghibli artwork",
      "Coffee mug with custom artwork",
      "Phone case with magical spirits",
      "Tote bag with forest spirits",
      "Premium quality materials",
      "Global shipping"
    ],
    popular: true,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    type: "digital",
    name: "Howl's Moving Castle Digital Pack",
    price: 14.99,
    features: [
      "Collection of 5 digital wallpapers",
      "Phone, tablet and desktop sizes",
      "Magical castle theme",
      "Personal use only"
    ],
    popular: false,
    image: "https://images.unsplash.com/photo-1510925758641-869d353cecc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    type: "prints",
    name: "Kiki's Delivery Service Canvas Print",
    price: 59.99,
    features: [
      "Premium stretched canvas",
      "Flying witch themed artwork",
      "Ready to hang",
      "Fade-resistant inks",
      "Available in multiple sizes"
    ],
    popular: false,
    image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 9,
    type: "merchandise",
    name: "Princess Mononoke Hoodie",
    price: 49.99,
    features: [
      "Warm, cozy hoodie",
      "Forest spirit designs",
      "Premium cotton-polyester blend",
      "Machine washable",
      "Unisex design"
    ],
    popular: false,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

export function Store() {
  const [activeTab, setActiveTab] = useState("digital");
  const { toast } = useToast();
  
  const handleProductInfo = (product: Product) => {
    toast({
      title: "Product Information",
      description: `${product.name} - $${product.price.toFixed(2)}`,
    });
  };
  
  return (
    <section className="py-12" id="store">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Transform Your Images into Ghibli Products</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Take your Ghibli-style artwork to the next level with our premium products. From digital downloads to physical merchandise, bring the magic of Studio Ghibli to life.
        </p>
      </div>
      
      {/* Benefits Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="bg-primary/5 border border-primary/20">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Zap size={24} />
            </div>
            <CardTitle>Studio Ghibli Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our advanced AI processing ensures the highest quality transformation with stunning Ghibli-style details and aesthetics.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border border-primary/20">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Sparkles size={24} />
            </div>
            <CardTitle>Miyazaki's Magic</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Each transformation captures the whimsical and magical aesthetic that makes Studio Ghibli films so beloved worldwide.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border border-primary/20">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Gift size={24} />
            </div>
            <CardTitle>Perfect Ghibli Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Transform personal photos into heartfelt gifts for any Studio Ghibli fan. Create custom merchandise featuring your loved ones in Ghibli style.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Product Tabs */}
      <Tabs defaultValue="digital" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8 w-full max-w-2xl mx-auto">
          {productTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="text-center py-2">
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {productTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="mt-0">
            <div className="text-center mb-8">
              <h3 className="text-xl font-medium">{type.name}</h3>
              <p className="text-gray-600">{type.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ghibliProducts
                .filter((product) => product.type === type.id)
                .map((product) => (
                  <Card key={product.id} className="overflow-hidden relative">
                    {product.popular && (
                      <Badge className="absolute top-4 right-4 z-10 bg-primary">
                        Popular Choice
                      </Badge>
                    )}
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center" 
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>
                        <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full gap-2" 
                        onClick={() => handleProductInfo(product)}
                      >
                        <Info size={16} />
                        <span>View Details</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Testimonials */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-center mb-8">What Ghibli Fans Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Alex Johnson",
              quote: "I transformed our family vacation photos into Ghibli art and had them printed. They look absolutely magical on our wall, just like scenes from My Neighbor Totoro!",
              rating: 5
            },
            {
              name: "Samantha Lee",
              quote: "The t-shirts with our pets in Spirited Away style were the perfect gift for my anime-loving friends. The quality is outstanding and truly captures the Ghibli magic.",
              rating: 5
            },
            {
              name: "Michael Chen",
              quote: "I've tried other art transformers, but this one captures the Ghibli aesthetic perfectly. My photos now look like they're straight from Howl's Moving Castle. Worth every penny.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-gray-600 mb-4">"{testimonial.quote}"</p>
                <p className="font-medium">— {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Art into Ghibli Products?</h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Start by transforming your image with our Ghibli style AI, then choose from our range of high-quality products.
        </p>
        <Button size="lg" className="gap-2">
          <Package size={18} />
          <span>Start Creating Now</span>
        </Button>
      </div>
    </section>
  );
}