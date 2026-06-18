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
    <div className="text-center mt-24 text-lg text-gray-600">
      Loading Admin Data...
    </div>
  );

  return (
    <div className="p-5 md:p-10 max-w-7xl mx-auto font-sans bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md">
        <h1 className="m-0 text-3xl font-bold text-gray-800">⚙️ Admin Dashboard</h1>
        <button 
          onClick={() => navigate("/")} 
          className="cursor-pointer px-5 py-2.5 bg-gray-200 border-none rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-300"
        >
          ← Back to Store
        </button>
      </div>

      {/* Add Product Card */}
      <div className="bg-white p-8 rounded-xl mb-8 shadow-md">
        <h3 className="mt-0 mb-5 text-xl font-bold text-gray-800">✨ Add New Product</h3>
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
                type="text" 
                placeholder="Product Name (e.g. Samsung S24)" 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="p-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors duration-200 focus:border-blue-500"
                required
            />
            <input 
                type="number" 
                placeholder="Price ($)" 
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                className="p-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors duration-200 focus:border-blue-500"
                required
            />
            <input 
                type="text" 
                placeholder="Description" 
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                className="p-3 md:col-span-2 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors duration-200 focus:border-blue-500"
            />
            <button 
              type="submit" 
              className="md:col-span-2 bg-gray-800 text-white p-3 border-none cursor-pointer font-semibold text-base rounded-lg transition-all duration-200 hover:bg-gray-900"
            >
                Create Product
            </button>
        </form>
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="mt-0 mb-5 text-xl font-bold text-gray-800">📦 Inventory Manager</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 font-semibold text-gray-600 border-b-2 border-gray-200">Product Name</th>
                <th className="p-4 font-semibold text-gray-600 border-b-2 border-gray-200">ID (SKU)</th>
                <th className="p-4 font-semibold text-gray-600 border-b-2 border-gray-200">Price</th>
                <th className="p-4 font-semibold text-gray-600 border-b-2 border-gray-200">Current Stock</th>
                <th className="p-4 font-semibold text-gray-600 border-b-2 border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const sku = p.id;
                const quantity = inventoryMap[sku] || 0;
                const isLowStock = quantity < 10;

                return (
                  <tr key={p.id} className="transition-colors duration-200 hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-200 font-medium">{p.name}</td>
                    <td className="p-4 border-b border-gray-200 text-sm text-gray-500 font-mono">{sku}</td>
                    <td className="p-4 border-b border-gray-200 font-semibold text-gray-800">${p.price}</td>
                    <td className={`p-4 border-b border-gray-200 font-semibold text-base ${isLowStock ? "text-red-500" : "text-green-600"}`}>
                      {quantity} {isLowStock && <span className="text-xs text-red-500">(LOW)</span>}
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <button 
                        onClick={() => handleAddStock(sku)}
                        className="bg-blue-500 text-white border-none px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-600"
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