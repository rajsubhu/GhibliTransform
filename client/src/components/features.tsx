import { Brush, Zap, Lock } from "lucide-react";

export function Features() {
  return (
    <section className="mb-16">
      <h2 className="font-bold text-2xl mb-8 text-center">Features & Benefits</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-md transition-all border border-gray-100">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
            <Brush size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Authentic Ghibli Style</h3>
          <p className="text-gray-600">Our AI model transforms your images to match the iconic Studio Ghibli animation style with remarkable accuracy.</p>
        </div>
        
        {/* Feature 2 */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-md transition-all border border-gray-100">
          <div className="w-12 h-12 bg-[#34A853]/10 rounded-lg flex items-center justify-center mb-4 text-[#34A853]">
            <Zap size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Fast Processing</h3>
          <p className="text-gray-600">Advanced AI processing delivers your transformed images in seconds, powered by Replicate's robust API infrastructure.</p>
        </div>
        
        {/* Feature 3 */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-md transition-all border border-gray-100">
          <div className="w-12 h-12 bg-[#FBBC05]/10 rounded-lg flex items-center justify-center mb-4 text-[#FBBC05]">
            <Lock size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Privacy Focused</h3>
          <p className="text-gray-600">Your uploaded images are processed securely and not stored permanently. We prioritize your privacy and data security.</p>
        </div>
      </div>
    </section>
  );
}
