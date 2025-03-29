import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Logo className="mr-3" />
          <h1 className="font-bold text-2xl text-primary">Ghiblify</h1>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="font-medium hover:text-primary transition-all">
                Home
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="font-medium hover:text-primary transition-all">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/about" className="font-medium hover:text-primary transition-all">
                About
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 focus:outline-none"
          >
            <Menu />
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-16 right-0 left-0 bg-white shadow-md z-50 md:hidden">
            <ul className="py-2 px-4">
              <li className="py-2 border-b">
                <Link href="/" className="block font-medium hover:text-primary transition-all">
                  Home
                </Link>
              </li>
              <li className="py-2 border-b">
                <Link href="/gallery" className="block font-medium hover:text-primary transition-all">
                  Gallery
                </Link>
              </li>
              <li className="py-2">
                <Link href="/about" className="block font-medium hover:text-primary transition-all">
                  About
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
