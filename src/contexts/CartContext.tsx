import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  title: string;
  artist?: string;
  price: number;
  coverImage: string;
  format?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("musicCart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("musicCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    if (cartItems.some((cartItem) => cartItem.id === item.id)) {
      toast({
        title: "Already in Cart",
        description: `${item.title} is already in your cart.`,
        variant: "destructive",
      });
      return;
    }

    setCartItems((prev) => [...prev, item]);
    toast({
      title: "Added to Cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const removeFromCart = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));

    if (item) {
      toast({
        title: "Item Removed",
        description: `${item.title} has been removed from your cart.`,
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getCartTotal = () => cartItems.reduce((total, item) => total + item.price, 0);

  const getCartCount = () => cartItems.length;

  const isInCart = (id: string) => cartItems.some((item) => item.id === id);

  // Memoize context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      isInCart,
    }),
    [cartItems] // only recompute if cartItems changes
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
