import { Header } from "@/components/header";
import { ImageTransformer } from "@/components/image-transformer";
import { Features } from "@/components/features";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Store } from "@/components/store";

export default function Home() {
  return (
    <div className="bg-[#F8F9FA] font-sans text-[#202124] min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-4 text-[#202124]">
            Transform Your Images into <span className="text-primary">Ghibli Art</span>
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-[#202124]/80">
            Experience the magic of Studio Ghibli's iconic animation style with our AI-powered transformation tool. Upload any image and watch it transform with the Mirage Ghibli AI model.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="h-24 w-32 rounded-lg bg-[#7AA2F7]/20 animate-pulse"></div>
            <div className="h-24 w-32 rounded-lg bg-[#9ECE6A]/20 animate-pulse"></div>
            <div className="h-24 w-32 rounded-lg bg-[#EAE4D0]/20 animate-pulse"></div>
          </div>
        </section>
        
        {/* Main Image Transformer Component */}
        <ImageTransformer />
        
        {/* Store Section */}
        <Store />
        
        {/* Features Section */}
        <Features />
        
        {/* FAQ Section */}
        <FAQ />
      </main>
      
      <Footer />
    </div>
  );
}
