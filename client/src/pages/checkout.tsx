import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, ShoppingBag, Truck, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Checkout() {
  const [location, navigate] = useLocation();
  const { state: cartState, clearCart } = useCart();
  const { toast } = useToast();
  const [formStep, setFormStep] = useState<"shipping" | "payment" | "confirmation">("shipping");
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: ""
  });

  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  // Handle input change
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setFormStep("confirmation");
      clearCart();
    }, 1500);
  };

  const handleReturnToCart = () => {
    navigate("/");
  };

  const handleReturnToStore = () => {
    navigate("/");
  };

  // Calculate totals
  const subtotal = cartState.totalPrice;
  const shipping = 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cartState.items.length === 0 && formStep !== "confirmation") {
    return (
      <div className="bg-[#F8F9FA] font-sans text-[#202124] min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any Ghibli-style products to your cart yet.
            </p>
            <Button onClick={handleReturnToStore}>
              Return to Store
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] font-sans text-[#202124] min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-8">
          <button 
            onClick={handleReturnToCart}
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-2xl font-bold ml-auto">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout steps */}
          <div className="md:col-span-2">
            {formStep === "shipping" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Truck className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        value={shippingDetails.fullName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        value={shippingDetails.email}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address"
                        value={shippingDetails.address}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip / Postal Code</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode"
                        value={shippingDetails.zipCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="country"
                        value={shippingDetails.country}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {formStep === "payment" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold">Payment Information</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit}>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input 
                        id="cardName" 
                        name="cardName"
                        value={paymentDetails.cardName}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input 
                          id="expiryDate" 
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                          id="cvv" 
                          name="cvv"
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                  </Button>
                </form>
              </div>
            )}

            {formStep === "confirmation" && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Thank You for Your Order!</h2>
                <p className="text-gray-600 mb-6">
                  Your order has been successfully placed. We've sent a confirmation email to {shippingDetails.email}.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <p className="text-sm text-gray-600 mb-1">Order #: GHB-{Math.floor(Math.random() * 10000)}</p>
                  <p className="text-sm text-gray-600">Expected delivery: 3-5 business days</p>
                </div>
                <Button onClick={handleReturnToStore} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            )}
          </div>
          
          {/* Order summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              {formStep !== "confirmation" && (
                <div className="mb-4 max-h-[300px] overflow-auto">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex py-3 border-b last:border-0">
                      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}