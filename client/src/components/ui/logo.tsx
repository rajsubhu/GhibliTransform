import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <path
          d="M20 3C10.6 3 3 10.6 3 20C3 29.4 10.6 37 20 37C29.4 37 37 29.4 37 20C37 10.6 29.4 3 20 3Z"
          fill="#4285F4"
        />
        <path
          d="M20 7C12.8 7 7 12.8 7 20C7 27.2 12.8 33 20 33C27.2 33 33 27.2 33 20C33 12.8 27.2 7 20 7Z"
          fill="#FBBC05"
          fillOpacity="0.3"
        />
        <path
          d="M28 20C28 24.4 24.4 28 20 28C15.6 28 12 24.4 12 20C12 15.6 15.6 12 20 12C24.4 12 28 15.6 28 20Z"
          fill="#34A853"
          fillOpacity="0.5"
        />
        <path
          d="M24 20C24 22.2 22.2 24 20 24C17.8 24 16 22.2 16 20C16 17.8 17.8 16 20 16C22.2 16 24 17.8 24 20Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
