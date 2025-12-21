import './App.css'
import { useEffect, useState } from 'react'
import keycloak from './Keycloak'
import ProductList from "./ProductList";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize Keycloak
    keycloak
      .init({ onLoad: "login-required" }) // Forces login immediately
      .then((authenticated) => {
        setAuthenticated(authenticated);
      })
      .catch((err) => {
        console.error("Authentication Failed", err);
      });
  }, []);

  if (!authenticated) {
    return <div style={{textAlign: "center", marginTop: "50px"}}>Loading... Please wait while we redirect you.</div>;
  }
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🛒 ShopWise Frontend</h1>
      <h2>Welcome, {keycloak.tokenParsed?.preferred_username}!</h2>
      <p>You have successfully logged in via Keycloak.</p>
      
      <button 
        onClick={() => keycloak.logout()}
        style={{padding: "10px 20px", background: "red", color: "white", border: "none", cursor: "pointer"}}
      >
        Logout
      </button>
      <

      <ProductList keycloak={keycloak} />
    </div>
  )
}

export default App
