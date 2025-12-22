import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";

// Receive 'keycloak' as a prop so we can use the token
const ProductList = ({ keycloak }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const successTimeoutRef = useRef(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      // Check if keycloak is ready with a token
      if (!keycloak || !keycloak.token) {
        setError("Waiting for authentication...");
        setLoading(false);
        return;
      }

      try {
        // 1. Call the API Gateway
        const response = await axios.get("http://localhost:9000/api/product", {
          headers: {
            // 2. Attach the "Passport" (Token)
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        setProducts(response.data || []);
        setError(""); // Clear error on success
      } catch (err) {
        console.error("Product fetch error:", err);
        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view products.");
        } else if (err.code === "ERR_NETWORK") {
          setError("Network error: API Gateway is not accessible at http://localhost:9000");
        } else {
          setError(`Failed to load products: ${err.message}`);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Cleanup timeout on unmount
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [keycloak]); // Run this when component loads

  const buyProduct = async (product) => {
    setError("");
    setSuccessMsg("");

    // Clear any existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    if (!keycloak.token) {
      setError("Session expired. Please refresh the page.");
      return;
    }

    try {
      const userEmail = keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username;
      const response = await axios.post(
        "http://localhost:9000/api/order",
        {
          userEmail: userEmail,
          orderLineItemsList: [   // <--- The Backend now wants this Array
            {
              skuCode: product.skuCode || product.id,
              name: product.name,
              price: product.price,
              quantity: 1
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );
      
      // Only show success message if we get a successful response
      const successMessage = `✅ Successfully bought ${product.name}!`;
      console.log("Order successful:", response.data);
      setSuccessMsg(successMessage);
      
      // Clear success message after 5 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
      
    } catch (err) {
      console.error("Purchase error:", err);
      if (err.response?.status === 503) {
        setError("❌ Failed: Service Unavailable (Circuit Breaker)");
      } else if (err.response?.status === 401) {
        setError("❌ Session expired. Please refresh and log in again.");
      } else {
        setError(`❌ Failed to place order: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "40px", 
        textAlign: "center",
        fontSize: "18px",
        color: "#666"
      }}>
        <div style={{
          display: "inline-block",
          padding: "20px 40px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          ⏳ Loading products...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{
        fontSize: "28px",
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: "25px",
        textAlign: "center"
      }}>
        📦 Available Products
      </h2>
      
      {error && (
        <div style={{ 
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)", 
          color: "white", 
          padding: "16px 20px", 
          borderRadius: "12px", 
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(238, 90, 111, 0.3)",
          fontWeight: "500",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ 
          background: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)", 
          color: "white", 
          padding: "16px 20px", 
          borderRadius: "12px", 
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(86, 171, 47, 0.3)",
          fontWeight: "500",
          textAlign: "center"
        }}>
          {successMsg}
        </div>
      )}
      
      {products.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>
          <p style={{ fontSize: "18px", color: "#999", margin: 0 }}>📭 No products available</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px" 
        }}>
          {products.map((product) => (
            <div 
              key={product.id} 
              style={{ 
                background: "white",
                padding: "20px", 
                borderRadius: "16px", 
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                border: "none"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: "0 0 10px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#2c3e50"
                }}>
                  {product.name}
                </h3>
                <p style={{ 
                  color: "#7f8c8d", 
                  margin: "0 0 15px 0",
                  fontSize: "14px",
                  lineHeight: "1.6"
                }}>
                  {product.description}
                </p>
                <div style={{ 
                  fontSize: "24px", 
                  fontWeight: "700",
                  color: "#27ae60",
                  marginBottom: "15px"
                }}>
                  ${parseFloat(product.price).toFixed(2)}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button 
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                    color: "white", 
                    border: "none", 
                    padding: "12px 20px", 
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)"
                  }}
                  onClick={() => buyProduct(product)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 15px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 10px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  🛒 Buy Now
                </button>
                
                <button 
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white", 
                    border: "none", 
                    padding: "12px 20px", 
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 10px rgba(240, 147, 251, 0.3)"
                  }}
                  onClick={() => addToCart(product)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 15px rgba(240, 147, 251, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 10px rgba(240, 147, 251, 0.3)";
                  }}
                >
                  ➕ Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;