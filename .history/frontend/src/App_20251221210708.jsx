import './App.css'
import { useEffect, useState } from 'react'
import keycloak, { initPromise } from './Keycloak'
import ProductList from "./components/ProductList";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🛒 ShopWise Frontend</h1>
      <h2>Welcome, {keycloak.tokenParsed?.preferred_username}!</h2>
      <p>You have successfully logged in via Keycloak.</p>
      {isAdmin && (
        <div style={{marginBottom: "20px"}}>
          <span style={{background: "red", color: "white", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold"}}>
            ADMIN MODE
          </span>
        </div>
      )}
      
      <button 
        onClick={() => keycloak.logout()}
        style={{padding: "10px 20px", background: "red", color: "white", border: "none", cursor: "pointer"}}
      >
        Logout
      </button>
      <hr />

      <ProductList keycloak={keycloak} />
    </div>
  )
}

export default App
