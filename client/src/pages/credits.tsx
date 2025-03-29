import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

// Define credit packages
const creditPackages = [
  { id: 'basic', credits: 5, amount: 99, description: 'Basic Package' },
  { id: 'standard', credits: 15, amount: 249, description: 'Standard Package' },
  { id: 'premium', credits: 50, amount: 699, description: 'Premium Package' },
];

// Razorpay response schema
const razorpayResponseSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
});

export default function CreditsPage() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<typeof creditPackages[0] | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Create an order
  const createOrderMutation = useMutation({
    mutationFn: async (packageData: { amount: number; credits: number }) => {
      return apiRequest('POST', '/api/create-order', {
        amount: packageData.amount,
        credits: packageData.credits,
        currency: 'INR',
      });
    },
    onError: (error) => {
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to create payment order',
        variant: 'destructive',
      });
      setPaymentProcessing(false);
    },
  });

  // Verify payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: z.infer<typeof razorpayResponseSchema> & { credits: number }) => {
      return apiRequest('POST', '/api/verify-payment', paymentData);
    },
    onSuccess: (data) => {
      toast({
        title: 'Payment Successful',
        description: `You've successfully purchased ${selectedPackage?.credits} credits!`,
      });
      
      // Invalidate relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/credits'] });
      
      // Navigate to profile page
      navigate('/profile');
    },
    onError: (error) => {
      toast({
        title: 'Payment Verification Failed',
        description: error instanceof Error ? error.message : 'Failed to verify your payment',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setPaymentProcessing(false);
      setSelectedPackage(null);
    },
  });

  // Handle package selection
  const handlePackageSelect = (pkg: typeof creditPackages[0]) => {
    setSelectedPackage(pkg);
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedPackage || !user) return;

    try {
      setPaymentProcessing(true);
      
      // Create order
      const orderData = await createOrderMutation.mutateAsync({
        amount: selectedPackage.amount,
        credits: selectedPackage.credits,
      });

      // Initialize Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Ghiblify',
        description: `Purchase ${selectedPackage.credits} credits`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Validate response
            const validatedResponse = razorpayResponseSchema.parse(response);
            
            // Verify payment
            await verifyPaymentMutation.mutateAsync({
              ...validatedResponse,
              credits: selectedPackage.credits,
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Error',
              description: 'Failed to process payment response',
              variant: 'destructive',
            });
            setPaymentProcessing(false);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#4285F4',
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You have cancelled the payment process',
            });
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentProcessing(false);
      toast({
        title: 'Payment Error',
        description: 'Failed to initialize payment',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to purchase credits</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Purchase Credits</h1>
          <p className="text-muted-foreground mb-6">
            Buy credits to transform more images into Ghibli style
          </p>
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <CreditCard className="h-4 w-4" />
            <span>Your current balance: </span>
            <Badge variant="default" className="text-sm font-semibold">
              {user.credits} credits
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative cursor-pointer transition-all hover:shadow-md ${
                selectedPackage?.id === pkg.id 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : ''
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{pkg.description}</CardTitle>
                <CardDescription>Transform {pkg.credits} images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{pkg.amount}</div>
                <div className="text-muted-foreground mt-1">
                  {pkg.credits} credits
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={selectedPackage?.id === pkg.id ? "default" : "outline"} 
                  className="w-full"
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {selectedPackage?.id === pkg.id ? 'Selected' : 'Select'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            size="lg" 
            disabled={!selectedPackage || paymentProcessing} 
            onClick={processPayment}
            className="px-8"
          >
            {paymentProcessing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {paymentProcessing 
              ? 'Processing...' 
              : `Pay ₹${selectedPackage?.amount || 0}`}
          </Button>
        </div>
      </div>
    </div>
  );
}