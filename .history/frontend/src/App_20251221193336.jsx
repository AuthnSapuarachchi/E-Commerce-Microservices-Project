import './App.css'

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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🛒 ShopWise Frontend</h1>
      <p>Welcome to the Store!</p>
    </div>
  )
}

export default App
