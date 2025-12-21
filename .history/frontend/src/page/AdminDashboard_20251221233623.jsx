import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "../Keycloak";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);

  // New State for the Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: ""
  });

  // 1. Fetch Data (Same as before)
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
              const sku = p.skuCode || p.id; 
              const invRes = await axios.get(`http://localhost:9000/api/inventory/${sku}`, { headers });
              invData[sku] = invRes.data.quantity;
          } catch (err) {
              invData[p.skuCode || p.id] = 0;
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

  // 2. Logic to Add Stock (Same as before)
  const handleAddStock = async (skuCode) => {
    const quantityToAdd = prompt(`How many items to add to ${skuCode}?`, "10");
    if (!quantityToAdd) return;

    try {
      await axios.put(
        `http://localhost:9000/api/inventory/increase?skuCode=${skuCode}&quantity=${quantityToAdd}`,
        {}, 
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      alert("Stock Updated!");
      fetchData(); // Refresh data without full page reload
    } catch (err) {
      alert("Failed to update stock");
      console.error(err);
    }
  };

  // 3. NEW LOGIC: Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault(); // Stop page refresh
    if(!newProduct.name || !newProduct.price) {
        alert("Please fill in all required fields");
        return;
    }

    try {
        const token = keycloak.token;
        const headers = { Authorization: `Bearer ${token}` };

        // A. Create Product in Product Service
        const prodResponse = await axios.post("http://localhost:9000/api/product", {
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price)
        }, { headers });

        // Get the actual SKU from the response (use returned skuCode or id)
        const createdSku = prodResponse.data?.skuCode || prodResponse.data?.id;
        console.log("Created product with SKU:", createdSku);

        // B. Initialize Inventory (0 Stock) using the ACTUAL SKU from response
        await axios.post("http://localhost:9000/api/inventory", {
            skuCode: createdSku,
            quantity: 0
        }, { headers });

        alert("✅ Product Created Successfully!");
        
        // Reset Form and Refresh List
        setNewProduct({ name: "", description: "", price: "" });
        fetchData();

    } catch (err) {
        console.error(err);
        alert("Failed to create product. Check console.");
    }
  };

  if (loading && products.length === 0) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading Admin Data...</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px"}}>
        <h1 style={{margin: 0}}>⚙️ Admin Dashboard</h1>
        <button onClick={() => navigate("/")} style={{cursor: "pointer", padding: "8px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", fontSize: "14px"}}>← Back to Store</button>
      </div>

      {/* 👇 NEW: PRODUCT CREATION FORM 👇 */}
      <div style={{background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #ddd"}}>
        <h3>✨ Add New Product</h3>
        <form onSubmit={handleCreateProduct} style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px"}}>
            <input 
                type="text" placeholder="Product Name (e.g. Samsung S24)" 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                style={{padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}} required
            />
            <input 
                type="number" placeholder="Price ($)" 
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                style={{padding: "8px", border: "1px solid #ddd", borderRadius: "4px"}} required
            />
            <input 
                type="text" placeholder="Description" 
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                style={{padding: "8px", border: "1px solid #ddd", borderRadius: "4px", gridColumn: "span 2"}}
            />
            <button type="submit" style={{gridColumn: "span 2", background: "#007bff", color: "white", padding: "10px", border: "none", cursor: "pointer", fontWeight: "bold", borderRadius: "4px"}}>
                ✨ Create Product
            </button>
        </form>
      </div>

      <h3>📦 Inventory Manager</h3>
      <table border="1" cellPadding="12" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
        <thead>
          <tr style={{background: "#007bff", color: "white"}}>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Current Stock</th>
            <th style={{textAlign: "center"}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const sku = p.skuCode || p.id;
            const quantity = inventoryMap[sku] || 0;
            const isLowStock = quantity < 10;

            return (
              <tr key={p.id} style={{borderBottom: "1px solid #ddd"}}>
                <td>{p.name}</td>
                <td>{sku}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td style={{ color: isLowStock ? "#dc3545" : "#28a745", fontWeight: "bold" }}>
                  {quantity} {isLowStock && "⚠️"}
                </td>
                <td style={{textAlign: "center"}}>
                  <button 
                    onClick={() => handleAddStock(sku)}
                    style={{ background: "#007bff", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px", fontSize: "13px" }}
                  >
                    + Add
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