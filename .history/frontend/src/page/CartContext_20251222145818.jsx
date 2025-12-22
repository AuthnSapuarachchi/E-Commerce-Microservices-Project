import { createContext, useState, useContext } from "react";

// 1. Create the Context
const CartContext = createContext();

// 2. Create the Provider (The Wrapper)
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Function to add item
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if item already exists
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // If exists, just increase quantity
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If new, add it with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    alert(`Added ${product.name} to Cart!`);
  };

  // Function to remove item
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Function to clear cart (after purchase)
  const clearCart = () => {
    setCart([]);
  };

  // Calculate Total Price
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom Hook to use it easily
export const useCart = () => useContext(CartContext);