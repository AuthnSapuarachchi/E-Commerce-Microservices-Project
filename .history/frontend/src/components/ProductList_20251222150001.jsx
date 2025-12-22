import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useCart } from "./context/CartContext";

// Receive 'keycloak' as a prop so we can use the token
const ProductList = ({ keycloak }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const successTimeoutRef = useRef(null);

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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>📦 Available Products</h2>
      
      {error && (
        <div style={{ 
          background: "#f8d7da", 
          color: "#721c24", 
          padding: "12px", 
          borderRadius: "4px", 
          marginBottom: "15px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ 
          background: "#d4edda", 
          color: "#155724", 
          padding: "12px", 
          borderRadius: "4px", 
          marginBottom: "15px",
          border: "1px solid #c3e6cb"
        }}>
          {successMsg}
        </div>
      )}
      
      {products.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No products available</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {products.map((product) => (
            <div 
              key={product.id} 
              style={{ 
                border: "1px solid #ddd", 
                padding: "15px", 
                borderRadius: "8px", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"}
            >
              <div>
                <h3 style={{ margin: "0 0 8px 0" }}>{product.name}</h3>
                <p style={{ color: "#666", margin: "0 0 10px 0" }}>
                  {product.description}
                </p>
                <strong style={{ fontSize: "18px", color: "#28a745" }}>
                  ${parseFloat(product.price).toFixed(2)}
                </strong>
              </div>
              <button 
                style={{
                  background: "#007bff", 
                  color: "white", 
                  border: "none", 
                  padding: "10px 20px", 
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  marginLeft: "15px",
                  transition: "background-color 0.2s"
                }}
                onClick={() => buyProduct(product)}
                onMouseEnter={(e) => e.target.style.background = "#0056b3"}
                onMouseLeave={(e) => e.target.style.background = "#007bff"}
              >
                🛒 Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;