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
      <div className="p-10 text-center text-lg text-gray-600">
        <div className="inline-block p-5 bg-white rounded-xl shadow-lg">
          ⏳ Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        📦 Available Products
      </h2>
      
      {error && (
        <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-lg mb-5 shadow-lg font-medium text-center">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg mb-5 shadow-lg font-medium text-center">
          {successMsg}
        </div>
      )}
      
      {products.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl shadow-md">
          <p className="text-lg text-gray-500 m-0">📭 No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed h-24 overflow-hidden">
                  {product.description}
                </p>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ${parseFloat(product.price).toFixed(2)}
                </div>
              </div>
              
              <div className="p-5 bg-gray-50 flex gap-3 mt-auto">
                <button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white border-none px-5 py-3 rounded-lg cursor-pointer text-sm font-bold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:-translate-y-1"
                  onClick={() => buyProduct(product)}
                >
                  🛒 Buy Now
                </button>
                
                <button 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white border-none px-5 py-3 rounded-lg cursor-pointer text-sm font-bold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:-translate-y-1"
                  onClick={() => addToCart(product)}
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