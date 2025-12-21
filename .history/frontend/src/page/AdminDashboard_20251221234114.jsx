import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "./Keycloak";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);

  // 👇 CHANGED: Removed 'skuCode' from state because Backend generates it
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

  // 👇 FIXED LOGIC HERE 👇
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

  if (loading && products.length === 0) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading Admin Data...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
        <h1>⚙️ Admin Dashboard</h1>
        <button onClick={() => navigate("/")} style={{cursor: "pointer", padding: "10px"}}>← Back to Store</button>
      </div>

      <div style={{background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #ddd"}}>
        <h3>✨ Add New Product</h3>
        <form onSubmit={handleCreateProduct} style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px"}}>
            <input 
                type="text" placeholder="Product Name (e.g. Samsung S24)" 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                style={{padding: "8px"}} required
            />
            {/* SKU Input REMOVED - Auto Generated */}
             <input 
                type="number" placeholder="Price ($)" 
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                style={{padding: "8px"}} required
            />
            <input 
                type="text" placeholder="Description" 
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                style={{padding: "8px", gridColumn: "span 2"}}
            />
            <button type="submit" style={{gridColumn: "span 2", background: "black", color: "white", padding: "10px", border: "none", cursor: "pointer", fontWeight: "bold"}}>
                Create Product
            </button>
        </form>
      </div>

      <h3>📦 Inventory Manager</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{background: "#f4f4f4"}}>
            <th>Product Name</th>
            <th>ID (SKU)</th>
            <th>Price</th>
            <th>Current Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const sku = p.id; // Use ID as SKU
            const quantity = inventoryMap[sku] || 0;
            const isLowStock = quantity < 10;

            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td style={{fontSize: "12px", color: "#555"}}>{sku}</td>
                <td>${p.price}</td>
                <td style={{ color: isLowStock ? "red" : "green", fontWeight: "bold" }}>
                  {quantity} {isLowStock && "(LOW)"}
                </td>
                <td>
                  <button 
                    onClick={() => handleAddStock(sku)}
                    style={{ background: "#007bff", color: "white", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}
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
  );
};

export default AdminDashboard;