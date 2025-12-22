import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "../Keycloak";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = keycloak.token;
        const email = keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username;
        
        const response = await axios.get(`http://localhost:9000/api/order/user/${email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Debugging: Log the data to see the new structure
        console.log("Orders Data:", response.data);
        
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading your history...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>📦 My Orders</h1>
      <button onClick={() => navigate("/")} style={{marginBottom: "20px", cursor: "pointer"}}>← Back to Store</button>

      {orders.length === 0 ? (
        <p>You haven't bought anything yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              
              {/* Order Header */}
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "10px"}}>
                <div>
                  <strong>Order #{order.orderNumber ? order.orderNumber.substring(0, 8) : "N/A"}...</strong>
                </div>
                <span style={{color: "green", fontWeight: "bold"}}>Confirmed</span>
              </div>

              {/* 👇 NEW: Loop through the Items List inside the Order 👇 */}
              {order.orderLineItemsList && order.orderLineItemsList.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "14px" }}>
                   <span>
                     <strong>{item.skuCode}</strong> <span style={{color: "#666"}}>x {item.quantity}</span>
                   </span>
                   <span>${item.price}</span>
                </div>
              ))}
              
              {/* If list is empty (fallback) */}
              {(!order.orderLineItemsList || order.orderLineItemsList.length === 0) && (
                <p style={{color: "red"}}>No items found in this order data.</p>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;