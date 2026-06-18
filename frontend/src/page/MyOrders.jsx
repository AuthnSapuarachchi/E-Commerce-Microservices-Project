import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import keycloak from "../Keycloak";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = keycloak.token;
        // Get user ID (Email or Username)
        const userIdToUse = keycloak.tokenParsed?.email || keycloak.tokenParsed?.preferred_username;

        if (!userIdToUse) {
           console.error("No User ID found");
           setLoading(false);
           return;
        }

        const encodedId = encodeURIComponent(userIdToUse);
        const url = `http://localhost:9000/api/order/user/${encodedId}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Orders received:", response.data); // Debug log

        // Direct assignment (No JSON.parse needed anymore)
        setOrders(response.data); 
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-lg text-gray-700">
        ⏳ Loading your orders...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      {/* Header */}
      <div className="bg-white/95 shadow-lg p-5 flex justify-between items-center flex-wrap gap-4">
        <h1 className="m-0 text-3xl font-bold text-purple-600">
          📦 My Orders
        </h1>
        
        <button 
          onClick={() => navigate("/")} 
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl cursor-pointer font-bold text-sm shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
        >
          ← Back to Store
        </button>
      </div>

      {/* Content */}
      <div className="p-5 md:p-10 max-w-4xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white p-10 md:p-16 rounded-2xl text-center shadow-2xl">
            <div className="text-7xl mb-5">📭</div>
            <h2 className="text-gray-800 text-2xl md:text-3xl font-bold mb-3">No Orders Yet</h2>
            <p className="text-gray-500 text-base md:text-lg mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button 
              onClick={() => navigate("/")}
              className="mt-5 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl cursor-pointer font-bold text-sm shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, index) => (
              <div 
                key={order.id || index} 
                className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Order Header */}
                <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-100">
                  <div>
                    <h3 className="m-0 text-lg font-bold text-gray-800">
                      Order #{order.orderNumber?.substring(0, 8) || "N/A"}...
                    </h3>
                    <p className="m-0 text-sm text-gray-500">
                      {order.orderLineItemsList?.length || 0} item(s)
                    </p>
                  </div>
                  <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md">
                    ✓ Confirmed
                  </span>
                </div>

                {/* Order Items */}
                {order.orderLineItemsList && order.orderLineItemsList.length > 0 ? (
                  <div>
                    <div className="grid gap-3">
                      {order.orderLineItemsList.map((item, itemIndex) => (
                        <div 
                          key={item.id || itemIndex} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex-1">
                            <strong className="text-gray-800 text-base">
                              {item.name || item.skuCode || "Unknown Product"}
                            </strong>
                            <p className="m-0 text-xs text-gray-500">
                              SKU: {item.skuCode || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                              Qty: <strong>{item.quantity || 0}</strong>
                            </span>
                            <span className="font-bold text-green-600 text-lg w-20 text-right">
                              ${parseFloat(item.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total Price */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <strong className="text-lg text-gray-800">
                        Total:
                      </strong>
                      <strong className="text-2xl text-green-600 font-bold">
                        ${order.orderLineItemsList.reduce((sum, item) => 
                          sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 text-center p-5 bg-red-50 rounded-lg">
                    ⚠️ No items found in this order
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;