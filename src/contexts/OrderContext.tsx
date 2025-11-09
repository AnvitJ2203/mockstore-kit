import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { CartItem } from "./CartContext";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered";
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price,
            image_url,
            categories (name)
          )
        ),
        addresses (full_address, city, state, postal_code)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(
        ordersData.map((order: any) => ({
          id: order.id,
          items: order.order_items.map((item: any) => ({
            id: item.products.id,
            name: item.products.name,
            price: parseFloat(item.price),
            image: item.products.image_url || "/placeholder.svg",
            quantity: item.quantity,
            category: item.products.categories?.name || "General",
          })),
          total: parseFloat(order.total_amount),
          address: order.addresses
            ? `${order.addresses.full_address}, ${order.addresses.city}, ${order.addresses.state} ${order.addresses.postal_code}`
            : "Address not found",
          date: order.created_at,
          status: order.status as "Processing" | "Shipped" | "Delivered",
        }))
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const addOrder = async (order: Omit<Order, "id" | "date" | "status">) => {
    if (!user) return;

    // Find address ID from the address string
    const { data: addresses } = await supabase
      .from("addresses")
      .select("id, full_address, city, state, postal_code")
      .eq("user_id", user.id);

    const matchingAddress = addresses?.find((addr) => 
      order.address.includes(addr.full_address)
    );

    // Create order
    const { data: newOrder } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: order.total,
        address_id: matchingAddress?.id,
        status: "Processing",
      })
      .select()
      .single();

    if (newOrder) {
      // Create order items
      const orderItems = order.items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabase.from("order_items").insert(orderItems);
      await fetchOrders();
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
