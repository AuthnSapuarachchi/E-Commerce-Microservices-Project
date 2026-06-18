import './index.css';
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
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          {/* Header/Navbar */}
          <div className="bg-white/95 shadow-lg p-4 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[#667eea]">🛒 ShopWise</h1>
              {isAdmin && (
                <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  ⭐ ADMIN
                </span>
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
              {isAdmin && (
                <button 
                  onClick={() => navigate("/admin")}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer font-semibold text-sm transition-all duration-300 shadow-md hover:bg-gray-700 hover:-translate-y-0.5"
                >
                  ⚙️ Admin Dashboard
                </button>
              )}
              
              <button 
                onClick={() => navigate("/my-orders")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer font-semibold text-sm transition-all duration-300 shadow-md hover:bg-blue-600 hover:-translate-y-0.5"
              >
                📦 My Orders
              </button>
              
              <button 
                onClick={() => navigate("/cart")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg cursor-pointer font-semibold text-sm transition-all duration-300 relative shadow-md hover:bg-yellow-600 hover:-translate-y-0.5"
              >
                🛒 Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
              </button>
              
              <button 
                onClick={() => keycloak.logout()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer font-semibold text-sm transition-all duration-300 shadow-md hover:bg-red-600 hover:-translate-y-0.5"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="p-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-2 text-shadow">
              Welcome back, {keycloak.tokenParsed?.preferred_username}! 👋
            </h2>
            <p className="text-lg opacity-90 text-shadow-sm">
              Discover amazing products at great prices
            </p>
          </div>

          {/* Products Section */}
          <div className="bg-gray-100 min-h-[calc(100vh-250px)] p-5 rounded-t-3xl">
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
