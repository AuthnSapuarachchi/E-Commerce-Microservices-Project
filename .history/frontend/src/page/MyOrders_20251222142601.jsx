import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "../Keycloak";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = keycloak.token;
        // Get user ID (Email or Username)
        const userIdToUse = keycloak.tokenParsed?.email || keycloak.tokenParsed?.preferred_username;

        if (!userIdToUse) {
           console.error("No User ID found");
           setLoading(false);
           return;
        }

        const encodedId = encodeURIComponent(userIdToUse);
        const url = `http://localhost:9000/api/order/user/${encodedId}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Orders received:", response.data); // Debug log

        // Direct assignment (No JSON.parse needed anymore)
        setOrders(response.data); 
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>📦 My Orders</h1>
      <button onClick={() => navigate("/")} style={{marginBottom: "20px", cursor: "pointer"}}>← Back to Store</button>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", background: "#fff" }}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "10px"}}>
                <strong>Order #{order.orderNumber?.substring(0, 8)}</strong>
                <span style={{color: "green", fontWeight: "bold"}}>Confirmed</span>
              </div>
              {order.orderLineItemsList?.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span><strong>{item.name || item.skuCode}</strong> x {item.quantity}</span>
                   <span><strong>{item.skuCode}</strong> x {item.quantity}</span>
                   <span>${item.price}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;