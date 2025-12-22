import { useCart } from "../components/";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import keycloak from "./Keycloak";

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
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🛒 Shopping Cart</h1>
      <button onClick={() => navigate("/")} style={{marginBottom: "20px", cursor: "pointer"}}>← Continue Shopping</button>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{borderBottom: "2px solid #ddd", textAlign: "left"}}>
                <th style={{padding: "10px"}}>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{borderBottom: "1px solid #eee"}}>
                  <td style={{padding: "10px"}}>
                    <strong>{item.name}</strong><br/>
                    <small style={{color:"#666"}}>{item.skuCode || item.id}</small>
                  </td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price * item.quantity}</td>
                  <td>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{color: "red", background: "none", border: "none", cursor: "pointer"}}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{textAlign: "right", marginTop: "20px"}}>
            <h2>Total: ${getCartTotal()}</h2>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{
                background: "green", 
                color: "white", 
                padding: "15px 30px", 
                fontSize: "18px", 
                border: "none", 
                borderRadius: "5px", 
                cursor: isCheckingOut ? "not-allowed" : "pointer",
                opacity: isCheckingOut ? 0.7 : 1
              }}
            >
              {isCheckingOut ? "Processing..." : "Checkout Now"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;