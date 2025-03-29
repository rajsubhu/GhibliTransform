import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, CreditCard } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email
      .split('@')[0]
      .split('.')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Logo className="mr-3" />
          <h1 className="font-bold text-2xl text-primary">Ghiblify</h1>
        </div>
        
        {/* Navigation removed as requested */}
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center">
                <Badge variant="outline" className="font-semibold">
                  Credits: {user.credits}
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full" size="icon">
                    <Avatar>
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/credits" className="cursor-pointer flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="md:hidden cursor-pointer flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Credits: {user.credits}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

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
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-16 right-0 left-0 bg-white shadow-md z-50 md:hidden">
            <ul className="py-2 px-4">
              {!user ? (
                <>
                  <li className="py-2 border-b">
                    <Link href="/login" className="block font-medium hover:text-primary transition-all">
                      Login
                    </Link>
                  </li>
                  <li className="py-2">
                    <Link href="/register" className="block font-medium hover:text-primary transition-all">
                      Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="py-2 border-b">
                    <Link href="/profile" className="block font-medium hover:text-primary transition-all">
                      My Profile
                    </Link>
                  </li>
                  <li className="py-2">
                    <Link href="/credits" className="block font-medium hover:text-primary transition-all">
                      Buy Credits
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
