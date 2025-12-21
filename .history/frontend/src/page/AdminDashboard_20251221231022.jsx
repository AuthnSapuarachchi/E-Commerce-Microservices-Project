import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import keycloak from "../Keycloak";

const AdminDashboard = () => {
const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({}); // Stores quantity like { "iphone_15": 98 }
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState("");
  const [quantityInput, setQuantityInput] = useState("");

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = keycloak.token;
        const headers = { Authorization: `Bearer ${token}` };

        // A. Get All Products
        const prodRes = await axios.get("http://localhost:9000/api/product", { headers });
        const productList = prodRes.data;
        setProducts(productList);

        // B. Get Stock for each Product
        // (In a real big app, we'd have an endpoint to get ALL inventory at once, but this works for now)
        const invData = {};
        for (const p of productList) {
            try {
                // Determine SKU (handles if you used id vs skuCode)
                const sku = p.skuCode || p.id; 
                const invRes = await axios.get(`http://localhost:9000/api/inventory/${sku}`, { headers });
                invData[sku] = invRes.data.quantity;
            } catch (err) {
                invData[p.skuCode || p.id] = 0; // Default to 0 if not found
            }
        }
        setInventoryMap(invData);
        setLoading(false);

      } catch (err) {
        console.error("Failed to load admin data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Logic to Add Stock
  const handleAddStock = async (skuCode) => {
    const quantityToAdd = prompt(`How many items to add to ${skuCode}?`, "10");
    if (!quantityToAdd) return;

    try {
      await axios.put(
        `http://localhost:9000/api/inventory/increase?skuCode=${skuCode}&quantity=${quantityToAdd}`,
        {}, // Empty body
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      
      alert("Stock Updated!");
      window.location.reload(); // Refresh page to see new numbers
    } catch (err) {
      alert("Failed to update stock");
      console.error(err);
    }
  };

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading Admin Data...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>⚙️ Admin Dashboard</h1>
      <button onClick={() => navigate("/")} style={{marginBottom: "20px", cursor: "pointer"}}>← Back to Store</button>

      <h3>📦 Inventory Manager</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{background: "#f4f4f4"}}>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Current Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const sku = p.skuCode || p.id;
            const quantity = inventoryMap[sku] || 0;
            const isLowStock = quantity < 10;

            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{sku}</td>
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