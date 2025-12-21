import { useEffect, useState } from "react";
import axios from "axios";

// Receive 'keycloak' as a prop so we can use the token
const ProductList = ({ keycloak }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      // Check if keycloak is ready with a token
      if (!keycloak.token) {
        setError("Waiting for authentication...");
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
        setProducts(response.data);
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
      }
    };

    fetchProducts();
  }, [keycloak]); // Run this when component loads

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Available Products</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <div style={{ display: "grid", gap: "10px" }}>
        {products.map((product) => (
          <div 
            key={product.id} 
            style={{ 
              border: "1px solid #ddd", 
              padding: "15px", 
              borderRadius: "8px", 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <h3>{product.name}</h3>
              <p style={{ color: "#666" }}>{product.description}</p>
              <strong>${product.price}</strong>
            </div>
            <button 
              style={{
                background: "#007bff", 
                color: "white", 
                border: "none", 
                padding: "10px 15px", 
                borderRadius: "5px",
                cursor: "pointer"
              }}
              onClick={() => alert("We will build this BUY button next!")}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;