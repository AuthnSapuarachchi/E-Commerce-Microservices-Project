import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "../Keycloak";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Debug State
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = keycloak.token;
        // 👇 CAPTURE WHAT KEYCLOAK SEES
        const emailFromToken = keycloak.tokenParsed?.email;
        const usernameFromToken = keycloak.tokenParsed?.preferred_username;
        const subFromToken = keycloak.tokenParsed?.sub;

        setDebugInfo({
             email: emailFromToken,
             username: usernameFromToken,
             sub: subFromToken,
             tokenExists: !!token
        });

        // Try to use email, fallback to username
        const userIdToUse = emailFromToken || usernameFromToken;

        if (!userIdToUse) {
           alert("CRITICAL ERROR: No Email or Username found in token!");
           setLoading(false);
           return;
        }

        // 👇 ENCODE THE EMAIL (Fixes the @ symbol issue)
        const encodedId = encodeURIComponent(userIdToUse);
        const url = `http://localhost:9000/api/order/user/${encodedId}`;

        console.log("Requesting URL:", url); // Check console if possible

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

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

      {/* 👇 DEBUG BOX - SHOWS US THE TRUTH 👇 */}
      <div style={{background: "#333", color: "#0f0", padding: "15px", marginBottom: "20px", fontFamily: "monospace", borderRadius: "5px"}}>
        <h3>🔍 DEBUG INFO (Take a screenshot of this)</h3>
        <p><strong>Email in Token:</strong> {debugInfo.email || "NULL"}</p>
        <p><strong>Username in Token:</strong> {debugInfo.username || "NULL"}</p>
        <p><strong>User ID sent to DB:</strong> {debugInfo.email || debugInfo.username}</p>
        <p><strong>Items Found:</strong> {orders.length}</p>
      </div>
      {/* 👆 END DEBUG BOX 👆 */}

      {orders.length === 0 ? (
        <p>You haven't bought anything yet (or database mismatch).</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", background: "#fff" }}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "10px"}}>
                <strong>Order #{order.orderNumber?.substring(0, 8)}</strong>
                <span style={{color: "green", fontWeight: "bold"}}>Confirmed</span>
              </div>
              {order.orderLineItemsList && order.orderLineItemsList.map((item) => (
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