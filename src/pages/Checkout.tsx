import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Checkout = () => {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (cart.length === 0) {
      navigate("/cart");
      return;
    }

    if (user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr?.id || user.addresses[0].id);
    }
  }, [user, cart, navigate]);

  const handlePlaceOrder = () => {
    if (!selectedAddress && user?.addresses.length === 0) {
      toast.error("Please add a delivery address");
      navigate("/profile/addresses");
      return;
    }

    const address = user?.addresses.find((a) => a.id === selectedAddress);
    if (!address) {
      toast.error("Please select a delivery address");
      return;
    }

    addOrder({
      items: cart,
      total: cartTotal,
      address: `${address.addressLine1}, ${address.city}, ${address.state} ${address.pincode}`,
    });

    clearCart();
    toast.success("Order placed successfully!");
    navigate("/profile/orders");
  };

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Delivery Address</h2>
                <Link to="/profile/addresses">
                  <Button variant="outline" size="sm">
                    Add New Address
                  </Button>
                </Link>
              </div>
              {user.addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No addresses saved yet
                  </p>
                  <Link to="/profile/addresses">
                    <Button>Add Address</Button>
                  </Link>
                </div>
              ) : (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  <div className="space-y-4">
                    {user.addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-3 border p-4 rounded-lg">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="font-semibold">{address.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.pincode}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Phone: {address.phone}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-primary font-bold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-success">Free</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={user.addresses.length === 0}
              >
                Place Order
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Cash on Delivery available
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
