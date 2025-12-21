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

  if (loading) return (
    <div style={{
      textAlign: "center", 
      marginTop: "50px",
      fontSize: "18px",
      color: "#666"
    }}>
      <div style={{ animation: "spin 1s linear infinite" }}>⏳</div>
      Loading Admin Data...
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (inventoryMap[p.skuCode || p.id] || 0) < 10).length;
  const totalStock = Object.values(inventoryMap).reduce((a, b) => a + b, 0);

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      {/* HEADER SECTION */}
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        padding: "30px",
        marginBottom: "30px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: 0, color: "#333", fontSize: "32px" }}>⚙️ Admin Dashboard</h1>
          <button 
            onClick={() => navigate("/")} 
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#5a6268"}
            onMouseLeave={(e) => e.target.style.background = "#6c757d"}
          >
            ← Back to Store
          </button>
        </div>
        <p style={{ color: "#666", marginBottom: "20px" }}>Manage inventory and monitor stock levels in real-time</p>

        {/* STATS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totalProducts}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Products</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totalStock}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Stock</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{lowStockCount}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Low Stock Items</div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        padding: "30px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        overflowX: "auto"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>📦 Inventory Manager</h3>
        
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <p style={{ fontSize: "18px" }}>No products found</p>
          </div>
        ) : (
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            fontSize: "14px"
          }}>
            <thead>
              <tr style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white"
              }}>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Product Name</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>SKU</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Price</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Stock Level</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => {
                const sku = p.skuCode || p.id;
                const quantity = inventoryMap[sku] || 0;
                const isLowStock = quantity < 10;

                return (
                  <tr 
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      background: index % 2 === 0 ? "#f9f9f9" : "white",
                      transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#f9f9f9" : "white"}
                  >
                    <td style={{ padding: "15px" }}>
                      <strong>{p.name}</strong>
                    </td>
                    <td style={{ padding: "15px", color: "#666" }}>{sku}</td>
                    <td style={{ padding: "15px", color: "#28a745", fontWeight: "bold" }}>${parseFloat(p.price).toFixed(2)}</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: isLowStock ? "#ffe6e6" : "#e6f7e6",
                        color: isLowStock ? "#d32f2f" : "#2e7d32",
                        fontWeight: "bold",
                        fontSize: "13px"
                      }}>
                        {quantity} {isLowStock && "⚠️ LOW"}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <button 
                        onClick={() => handleAddStockClick(sku)}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "bold",
                          transition: "all 0.3s",
                          boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.4)";
                        }}
                      >
                        + Add Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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