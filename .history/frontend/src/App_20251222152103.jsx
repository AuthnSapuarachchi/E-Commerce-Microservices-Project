import './App.css'
import { useEffect, useState } from 'react'
import keycloak, { initPromise } from './Keycloak'
import ProductList from "./components/ProductList";
import AdminDashboard from "./page/AdminDashboard";
import { Routes, Route, useNavigate } from "react-router-dom";
import MyOrders from "./page/MyOrders";
import Cart from "./components/Cart";
import { useCart } from "./context/CartContext";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart(); 

  useEffect(() => {
    // Wait for keycloak initialization to complete
    if (initPromise) {
      initPromise
        .then((authenticated) => {
          setAuthenticated(authenticated);
        })
        .catch((err) => {
          console.error("Authentication Failed", err);
        });
    } else {
      // Already authenticated
      setAuthenticated(keycloak.authenticated);
    }
  }, []);

  if (!authenticated) {
    return <div style={{textAlign: "center", marginTop: "50px"}}>Loading... Please wait while we redirect you.</div>;
  }
  const isAdmin = keycloak.hasRealmRole("admin");

  return (
    <Routes>
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/cart" element={<Cart />} />
      {/* ROUTE 1: THE HOME PAGE (Store) */}
      <Route path="/" element={
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          {/* Header/Navbar */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "15px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <h1 style={{ margin: 0, fontSize: "24px", color: "#667eea" }}>🛒 ShopWise</h1>
              {isAdmin && (
                <span style={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}>
                  ⭐ ADMIN
                </span>
              )}
            </div>
            
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {isAdmin && (
                <button 
                  onClick={() => navigate("/admin")}
                  style={{
                    padding: "10px 20px",
                    background: "#2c3e50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#34495e";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#2c3e50";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  ⚙️ Admin Dashboard
                </button>
              )}
              
              <button 
                onClick={() => navigate("/my-orders")}
                style={{
                  padding: "10px 20px",
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#2980b9";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#3498db";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                📦 My Orders
              </button>
              
              <button 
                onClick={() => navigate("/cart")}
                style={{
                  padding: "10px 20px",
                  background: "#f39c12",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  position: "relative",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#e67e22";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f39c12";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🛒 Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
              </button>
              
              <button 
                onClick={() => keycloak.logout()}
                style={{
                  padding: "10px 20px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#c0392b";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#e74c3c";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Welcome Section */}
          <div style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "white"
          }}>
            <h2 style={{
              fontSize: "32px",
              fontWeight: "700",
              margin: "0 0 10px 0",
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
            }}>
              Welcome back, {keycloak.tokenParsed?.preferred_username}! 👋
            </h2>
            <p style={{
              fontSize: "18px",
              opacity: 0.9,
              margin: 0,
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
            }}>
              Discover amazing products at great prices
            </p>
          </div>

          {/* Products Section */}
          <div style={{
            background: "#f8f9fa",
            minHeight: "calc(100vh - 250px)",
            padding: "30px 20px",
            borderRadius: "30px 30px 0 0"
          }}>
            <ProductList keycloak={keycloak} />
          </div>
        </div>
      } />

      {/* ROUTE 2: THE ADMIN DASHBOARD */}
      {isAdmin && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}
    </Routes>
  )
}

export default App
