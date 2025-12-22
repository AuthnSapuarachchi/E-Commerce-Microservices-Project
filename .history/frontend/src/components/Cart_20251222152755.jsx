import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import keycloak from "../Keycloak";

const Cart = () => {
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsCheckingOut(true);
    try {
      const token = keycloak.token;
      const userEmail = keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username;

      // 1. Prepare Data for Backend
      const orderPayload = {
        userEmail: userEmail,
        orderLineItemsList: cart.map(item => ({
          skuCode: item.skuCode || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      // 2. Send Request
      await axios.post("http://localhost:9000/api/order", orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Success!
      alert("✅ Order Placed Successfully!");
      clearCart(); // Empty the memory
      navigate("/my-orders"); // Redirect to history

    } catch (err) {
      console.error(err);
      alert("❌ Checkout Failed. Check console.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        padding: "20px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "28px", 
          color: "#667eea",
          fontWeight: "700"
        }}>
          🛒 Shopping Cart
        </h1>
        
        <button 
          onClick={() => navigate("/")} 
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 15px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 10px rgba(102, 126, 234, 0.3)";
          }}
        >
          ← Continue Shopping
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: "40px 20px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        {cart.length === 0 ? (
          <div style={{
            background: "white",
            padding: "60px 40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
            <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>Your Cart is Empty</h2>
            <p style={{ color: "#7f8c8d", fontSize: "16px", marginBottom: "20px" }}>
              Add some products to your cart and they will appear here!
            </p>
            <button 
              onClick={() => navigate("/")}
              style={{
                padding: "12px 30px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 15px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 10px rgba(102, 126, 234, 0.3)";
              }}
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
          }}>
            {/* Cart Items */}
            <div style={{ display: "grid", gap: "15px", marginBottom: "30px" }}>
              {cart.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    flexWrap: "wrap",
                    gap: "15px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f2f5";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Product Info */}
                  <div style={{ flex: "1 1 200px" }}>
                    <h3 style={{ 
                      margin: "0 0 5px 0",
                      fontSize: "18px",
                      color: "#2c3e50",
                      fontWeight: "700"
                    }}>
                      {item.name}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "13px", 
                      color: "#95a5a6" 
                    }}>
                      SKU: {item.skuCode || item.id}
                    </p>
                  </div>

                  {/* Price & Quantity */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "20px",
                    flexWrap: "wrap"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#7f8c8d",
                        marginBottom: "3px"
                      }}>
                        Price
                      </div>
                      <div style={{ 
                        fontSize: "16px", 
                        fontWeight: "700",
                        color: "#2c3e50"
                      }}>
                        ${parseFloat(item.price).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#7f8c8d",
                        marginBottom: "3px"
                      }}>
                        Quantity
                      </div>
                      <div style={{ 
                        fontSize: "16px", 
                        fontWeight: "700",
                        color: "#2c3e50"
                      }}>
                        {item.quantity}
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#7f8c8d",
                        marginBottom: "3px"
                      }}>
                        Total
                      </div>
                      <div style={{ 
                        fontSize: "18px", 
                        fontWeight: "700",
                        color: "#27ae60"
                      }}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(238, 90, 111, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(238, 90, 111, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(238, 90, 111, 0.3)";
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{
              borderTop: "2px solid #f0f0f0",
              paddingTop: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px"
            }}>
              <div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#7f8c8d",
                  marginBottom: "5px"
                }}>
                  Total Amount
                </div>
                <div style={{ 
                  fontSize: "32px", 
                  fontWeight: "700",
                  color: "#27ae60"
                }}>
                  ${getCartTotal()}
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                style={{
                  padding: "15px 40px",
                  background: isCheckingOut 
                    ? "#95a5a6" 
                    : "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isCheckingOut ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                  boxShadow: isCheckingOut 
                    ? "none" 
                    : "0 4px 15px rgba(86, 171, 47, 0.4)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isCheckingOut) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(86, 171, 47, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCheckingOut) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(86, 171, 47, 0.4)";
                  }
                }}
              >
                {isCheckingOut ? "⏳ Processing..." : "✓ Checkout Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;