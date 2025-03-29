import { Logo } from "@/components/ui/logo";
import { Twitter, Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#202124] text-white mt-16 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo size="sm" className="mr-2 bg-white rounded-full p-1" />
              <h3 className="font-bold text-xl">Ghiblify</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Transform your images into the magical world of Studio Ghibli with our AI-powered tool.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-all">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Gallery</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">How it Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact & Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-all">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Ghiblify. All rights reserved. Powered by <a href="https://replicate.com" className="text-primary hover:underline">Replicate API</a>.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            This service is not affiliated with Studio Ghibli. All Ghibli-related trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
