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
  const handleAddStockClick = (skuCode) => {
    setSelectedSku(skuCode);
    setQuantityInput("10"); // Default value
    setShowModal(true);
  };

  const handleConfirmAddStock = async () => {
    if (!quantityInput || parseInt(quantityInput) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      await axios.put(
        `http://localhost:9000/api/inventory/increase?skuCode=${selectedSku}&quantity=${quantityInput}`,
        {}, // Empty body
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      
      alert("✅ Stock Updated Successfully!");
      setShowModal(false);
      setQuantityInput("");
      setSelectedSku("");
      
      // Refresh inventory data
      const token = keycloak.token;
      const headers = { Authorization: `Bearer ${token}` };
      const invData = {};
      for (const p of products) {
        try {
          const sku = p.skuCode || p.id;
          const invRes = await axios.get(`http://localhost:9000/api/inventory/${sku}`, { headers });
          invData[sku] = invRes.data.quantity;
        } catch (err) {
          invData[p.skuCode || p.id] = 0;
        }
      }
      setInventoryMap(invData);
    } catch (err) {
      alert("❌ Failed to update stock");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setQuantityInput("");
    setSelectedSku("");
  };

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading Admin Data...</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
        <h1 style={{margin: 0}}>⚙️ Admin Dashboard</h1>
        <button onClick={() => navigate("/")} style={{padding: "8px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}>
          ← Back to Store
        </button>
      </div>

      <h3 style={{marginTop: "30px", marginBottom: "15px"}}>📦 Inventory Manager</h3>
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
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{sku}</td>
                <td>${p.price}</td>
                <td style={{ color: isLowStock ? "red" : "green", fontWeight: "bold" }}>
                  {quantity} {isLowStock && "(LOW)"}
                </td>
                <td>
                  <button 
                    onClick={() => handleAddStockClick(sku)}
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

      {/* MODAL POPUP FOR ADDING STOCK */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            maxWidth: "400px",
            width: "90%"
          }}>
            <h2>📦 Add Stock for {selectedSku}</h2>
            
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              How many items to add?
            </label>
            <input
              type="number"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="Enter quantity"
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
              autoFocus
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: "10px 20px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddStock}
                style={{
                  padding: "10px 20px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;