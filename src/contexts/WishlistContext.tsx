import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  originalPrice?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const { data: wishlistItems } = await supabase
      .from("wishlist")
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          categories (name)
        )
      `)
      .eq("user_id", user.id);

    if (wishlistItems) {
      setWishlist(
        wishlistItems.map((item: any) => ({
          id: item.products.id,
          name: item.products.name,
          price: parseFloat(item.products.price),
          image: item.products.image_url || "/placeholder.svg",
          category: item.products.categories?.name || "General",
          rating: 4.5,
          originalPrice: undefined,
        }))
      );
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (item: WishlistItem) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", item.id)
      .single();

    if (!existing) {
      await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: item.id,
      });
      await fetchWishlist();
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) return;

    await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", id);

    await fetchWishlist();
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
