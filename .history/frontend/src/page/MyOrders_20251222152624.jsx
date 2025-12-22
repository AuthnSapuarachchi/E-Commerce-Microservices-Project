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

  if (loading) return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "white",
        padding: "30px 50px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        fontSize: "18px",
        color: "#666"
      }}>
        ⏳ Loading your orders...
      </div>
    </div>
  );

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
          📦 My Orders
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
          ← Back to Store
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: "40px 20px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        {orders.length === 0 ? (
          <div style={{
            background: "white",
            padding: "60px 40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
            <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>No Orders Yet</h2>
            <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button 
              onClick={() => navigate("/")}
              style={{
                marginTop: "20px",
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
          <div style={{ display: "grid", gap: "20px" }}>
            {orders.map((order, index) => (
              <div 
                key={order.id || index} 
                style={{ 
                  background: "white",
                  padding: "25px", 
                  borderRadius: "16px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "20px", 
                  paddingBottom: "15px",
                  borderBottom: "2px solid #f0f0f0"
                }}>
                  <div>
                    <h3 style={{ 
                      margin: "0 0 5px 0",
                      fontSize: "18px",
                      color: "#2c3e50",
                      fontWeight: "700"
                    }}>
                      Order #{order.orderNumber?.substring(0, 8) || "N/A"}...
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "13px", 
                      color: "#95a5a6" 
                    }}>
                      {order.orderLineItemsList?.length || 0} item(s)
                    </p>
                  </div>
                  <span style={{
                    background: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "700",
                    boxShadow: "0 2px 8px rgba(86, 171, 47, 0.3)"
                  }}>
                    ✓ Confirmed
                  </span>
                </div>

                {/* Order Items */}
                {order.orderLineItemsList && order.orderLineItemsList.length > 0 ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {order.orderLineItemsList.map((item, itemIndex) => (
                      <div 
                        key={item.id || itemIndex} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px",
                          background: "#f8f9fa",
                          borderRadius: "10px",
                          fontSize: "14px"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: "#2c3e50", fontSize: "15px" }}>
                            {item.name || item.skuCode || "Unknown Product"}
                          </strong>
                          <p style={{ 
                            margin: "3px 0 0 0", 
                            fontSize: "12px", 
                            color: "#95a5a6" 
                          }}>
                            SKU: {item.skuCode || "N/A"}
                          </p>
                        </div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "15px" 
                        }}>
                          <span style={{ 
                            color: "#7f8c8d",
                            fontSize: "14px"
                          }}>
                            Qty: <strong>{item.quantity || 0}</strong>
                          </span>
                          <span style={{ 
                            color: "#27ae60",
                            fontWeight: "700",
                            fontSize: "16px",
                            minWidth: "70px",
                            textAlign: "right"
                          }}>
                            ${parseFloat(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Price */}
                    <div style={{
                      marginTop: "10px",
                      paddingTop: "15px",
                      borderTop: "2px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <strong style={{ fontSize: "16px", color: "#2c3e50" }}>
                        Total:
                      </strong>
                      <strong style={{ 
                        fontSize: "22px", 
                        color: "#27ae60",
                        fontWeight: "700"
                      }}>
                        ${order.orderLineItemsList.reduce((sum, item) => 
                          sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p style={{ 
                    color: "#e74c3c", 
                    textAlign: "center",
                    padding: "20px",
                    background: "#fee",
                    borderRadius: "10px"
                  }}>
                    ⚠️ No items found in this order
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;