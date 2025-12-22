import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "./Keycloak";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = keycloak.token;
        const emailFromToken = keycloak.tokenParsed?.email;
        const usernameFromToken = keycloak.tokenParsed?.preferred_username;
        const userIdToUse = emailFromToken || usernameFromToken;

        if (!userIdToUse) {
           setDebugInfo({ error: "No User ID found in token" });
           setLoading(false);
           return;
        }

        const encodedId = encodeURIComponent(userIdToUse);
        const url = `http://localhost:9000/api/order/user/${encodedId}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 👇 CRASH PROTECTION LOGIC 👇
        const responseData = response.data;
        const isArray = Array.isArray(responseData);

        setDebugInfo({
             email: emailFromToken,
             username: usernameFromToken,
             sentId: userIdToUse,
             dataType: typeof responseData,
             isArray: isArray ? "YES" : "NO",
             rawData: JSON.stringify(responseData).substring(0, 100) // Show first 100 chars
        });

        if (isArray) {
            setOrders(responseData);
        } else {
            console.error("API did not return an array:", responseData);
            setOrders([]); // Set to empty to prevent crash
        }
        
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch orders", err);
        setDebugInfo({ error: err.message });
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

      {/* 👇 DEBUG BOX 👇 */}
      <div style={{background: "#333", color: "#0f0", padding: "15px", marginBottom: "20px", fontFamily: "monospace", borderRadius: "5px", wordBreak: "break-all"}}>
        <h3>🔍 DEBUG INFO</h3>
        <p><strong>Email in Token:</strong> {debugInfo.email || "NULL"}</p>
        <p><strong>Username in Token:</strong> {debugInfo.username || "NULL"}</p>
        <p><strong>Is Data an Array?:</strong> {debugInfo.isArray}</p>
        <p><strong>Raw Data Received:</strong> {debugInfo.rawData}</p>
      </div>

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