import './App.css'
import { useEffect, useState } from 'react'
import keycloak, { initPromise } from './Keycloak'
import ProductList from "./components/ProductList";
import AdminDashboard from "./page/AdminDashboard";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

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
      {/* ROUTE 1: THE HOME PAGE (Store) */}
      <Route path="/" element={
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>🛒 ShopWise Frontend</h1>
          <h2>Welcome, {keycloak.tokenParsed?.preferred_username}!</h2>
          
          {isAdmin && (
            <div style={{marginBottom: "20px"}}>
              <span style={{background: "red", color: "white", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold"}}>
                ADMIN MODE
              </span>
            </div>
          )}

          <div style={{marginBottom: "20px"}}>
            {isAdmin && (
              <button 
                onClick={() => navigate("/admin")} // <--- NAVIGATE TO ADMIN
                style={{marginRight: "10px", padding: "10px", background: "#333", color: "white", border: "none", cursor: "pointer"}}
              >
                ⚙️ Admin Dashboard
              </button>
            )}

            <button onClick={() => keycloak.logout()} style={{ padding: "10px" }}>
              Logout
            </button>
          </div>
          <hr />
          <ProductList keycloak={keycloak} />
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
