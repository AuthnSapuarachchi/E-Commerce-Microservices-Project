import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "..Keycloak";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = keycloak.token;
        const email = keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username;
        
        console.log("Fetching orders for:", email);

        const response = await axios.get(`http://localhost:9000/api/order/user/${email}`, {
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

      {orders.length === 0 ? (
        <p>You haven't bought anything yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", background: "#f9f9f9" }}>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <strong>Order #{order.orderNumber.substring(0, 8)}...</strong>
                <span style={{color: "green", fontWeight: "bold"}}>Confirmed</span>
              </div>
              <hr style={{margin: "10px 0", border: "0", borderTop: "1px solid #eee"}}/>
              <p>Product SKU: <strong>{order.skuCode}</strong></p>
              <p>Quantity: {order.quantity}</p>
              <p>Price Paid: <strong>${order.price}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;