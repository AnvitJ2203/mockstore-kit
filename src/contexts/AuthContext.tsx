import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name: string;
  addresses: Address[];
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: addresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId);

    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.full_name || "",
        addresses: (addresses || []).map((addr) => ({
          id: addr.id,
          name: addr.label,
          phone: "",
          addressLine1: addr.full_address,
          addressLine2: "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.postal_code || "",
          isDefault: addr.is_default || false,
        })),
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return !error;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: name,
        },
      },
    });
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    if (updates.name) {
      await supabase
        .from("users")
        .update({ full_name: updates.name })
        .eq("id", user.id);
    }

    setUser({ ...user, ...updates });
  };

  const addAddress = async (address: Omit<Address, "id">) => {
    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: address.name,
        full_address: address.addressLine1,
        city: address.city,
        state: address.state,
        postal_code: address.pincode,
        is_default: address.isDefault,
      })
      .select()
      .single();

    if (data) {
      await fetchUserData(user.id);
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.name) updateData.label = updates.name;
    if (updates.addressLine1) updateData.full_address = updates.addressLine1;
    if (updates.city) updateData.city = updates.city;
    if (updates.state) updateData.state = updates.state;
    if (updates.pincode) updateData.postal_code = updates.pincode;
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

    await supabase
      .from("addresses")
      .update(updateData)
      .eq("id", id);

    await fetchUserData(user.id);
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;

    await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    await fetchUserData(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        updateUser,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
