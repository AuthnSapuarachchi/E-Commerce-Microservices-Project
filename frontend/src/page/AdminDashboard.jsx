import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "../Keycloak";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);

  // CHANGED: Removed 'skuCode' from state because Backend generates it
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = keycloak.token;
      const headers = { Authorization: `Bearer ${token}` };

      const prodRes = await axios.get("http://localhost:9000/api/product", { headers });
      const productList = prodRes.data;
      setProducts(productList);

      const invData = {};
      for (const p of productList) {
          try {
              // Always use the Backend Generated ID
              const sku = p.id; 
              const invRes = await axios.get(`http://localhost:9000/api/inventory/${sku}`, { headers });
              invData[sku] = invRes.data.quantity;
          } catch (err) {
              invData[p.id] = 0;
          }
      }
      setInventoryMap(invData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load admin data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStock = async (skuCode) => {
    const quantityToAdd = prompt(`How many items to add?`, "10");
    if (!quantityToAdd) return;

    try {
      await axios.put(
        `http://localhost:9000/api/inventory/increase?skuCode=${skuCode}&quantity=${quantityToAdd}`,
        {}, 
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      alert("Stock Updated!");
      fetchData();
    } catch (err) {
      alert("Failed to update stock");
      console.error(err);
    }
  };

  // FIXED LOGIC HERE
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if(!newProduct.name || !newProduct.price) {
        alert("Please fill in all required fields");
        return;
    }

    try {
        const token = keycloak.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Create Product & WAIT for the generated ID
        const response = await axios.post("http://localhost:9000/api/product", {
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price)
            // We DO NOT send skuCode here. The backend generates it.
        }, { headers });

        const generatedId = response.data.id; // <--- CATCH THE ID
        console.log("Backend Generated ID:", generatedId);

        // 2. Use that ID to create the Inventory
        await axios.post("http://localhost:9000/api/inventory", {
            skuCode: generatedId, // <--- LINKING THEM CORRECTLY
            quantity: 0
        }, { headers });

        alert("✅ Product Created Successfully!");
        
        setNewProduct({ name: "", description: "", price: "" });
        fetchData();

    } catch (err) {
        console.error(err);
        alert("Failed to create product. Check console.");
    }
  };

  if (loading && products.length === 0) return (
    <div style={{textAlign: "center", marginTop: "100px", fontSize: "18px", color: "#666"}}>
      Loading Admin Data...
    </div>
  );

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "#f5f7fa",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px",
        background: "white",
        padding: "20px 30px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{margin: 0, fontSize: "28px", color: "#1a1a1a"}}>⚙️ Admin Dashboard</h1>
        <button 
          onClick={() => navigate("/")} 
          style={{
            cursor: "pointer", 
            padding: "10px 20px",
            background: "#f0f0f0",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "#e0e0e0"}
          onMouseOut={(e) => e.target.style.background = "#f0f0f0"}
        >
          ← Back to Store
        </button>
      </div>

      {/* Add Product Card */}
      <div style={{
        background: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        marginBottom: "30px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <h3 style={{marginTop: 0, marginBottom: "20px", fontSize: "20px", color: "#1a1a1a"}}>✨ Add New Product</h3>
        <form onSubmit={handleCreateProduct} style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px"}}>
            <input 
                type="text" 
                placeholder="Product Name (e.g. Samsung S24)" 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                style={{
                  padding: "12px 15px", 
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#4a90e2"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                required
            />
            <input 
                type="number" 
                placeholder="Price ($)" 
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                style={{
                  padding: "12px 15px", 
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#4a90e2"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                required
            />
            <input 
                type="text" 
                placeholder="Description" 
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                style={{
                  padding: "12px 15px", 
                  gridColumn: "span 2",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#4a90e2"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <button 
              type="submit" 
              style={{
                gridColumn: "span 2", 
                background: "#1a1a1a", 
                color: "white", 
                padding: "12px", 
                border: "none", 
                cursor: "pointer", 
                fontWeight: "600",
                fontSize: "15px",
                borderRadius: "8px",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#333"}
              onMouseOut={(e) => e.target.style.background = "#1a1a1a"}
            >
                Create Product
            </button>
        </form>
      </div>

      {/* Inventory Table Card */}
      <div style={{
        background: "white", 
        padding: "30px", 
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <h3 style={{marginTop: 0, marginBottom: "20px", fontSize: "20px", color: "#1a1a1a"}}>📦 Inventory Manager</h3>
        <div style={{overflowX: "auto"}}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, textAlign: "left" }}>
            <thead>
              <tr style={{background: "#f8f9fa"}}>
                <th style={{padding: "15px", fontWeight: "600", color: "#555", borderBottom: "2px solid #e0e0e0"}}>Product Name</th>
                <th style={{padding: "15px", fontWeight: "600", color: "#555", borderBottom: "2px solid #e0e0e0"}}>ID (SKU)</th>
                <th style={{padding: "15px", fontWeight: "600", color: "#555", borderBottom: "2px solid #e0e0e0"}}>Price</th>
                <th style={{padding: "15px", fontWeight: "600", color: "#555", borderBottom: "2px solid #e0e0e0"}}>Current Stock</th>
                <th style={{padding: "15px", fontWeight: "600", color: "#555", borderBottom: "2px solid #e0e0e0"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const sku = p.id;
                const quantity = inventoryMap[sku] || 0;
                const isLowStock = quantity < 10;

                return (
                  <tr key={p.id} style={{transition: "background 0.2s"}}>
                    <td style={{padding: "15px", borderBottom: "1px solid #f0f0f0", fontWeight: "500"}}>{p.name}</td>
                    <td style={{padding: "15px", borderBottom: "1px solid #f0f0f0", fontSize: "13px", color: "#666", fontFamily: "monospace"}}>{sku}</td>
                    <td style={{padding: "15px", borderBottom: "1px solid #f0f0f0", fontWeight: "600", color: "#1a1a1a"}}>${p.price}</td>
                    <td style={{ 
                      padding: "15px", 
                      borderBottom: "1px solid #f0f0f0",
                      color: isLowStock ? "#e74c3c" : "#27ae60", 
                      fontWeight: "600",
                      fontSize: "15px"
                    }}>
                      {quantity} {isLowStock && <span style={{fontSize: "12px", color: "#e74c3c"}}>(LOW)</span>}
                    </td>
                    <td style={{padding: "15px", borderBottom: "1px solid #f0f0f0"}}>
                      <button 
                        onClick={() => handleAddStock(sku)}
                        style={{ 
                          background: "#4a90e2", 
                          color: "white", 
                          border: "none", 
                          padding: "8px 16px", 
                          cursor: "pointer", 
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.target.style.background = "#357abd"}
                        onMouseOut={(e) => e.target.style.background = "#4a90e2"}
                      >
                        + Add Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;