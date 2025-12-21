import './App.css'
import { useEffect, useState } from 'react'
import keycloak from './Keycloak'

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
    
  )
}

export default App
