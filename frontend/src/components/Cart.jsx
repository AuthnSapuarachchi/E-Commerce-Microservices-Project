import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import keycloak from "../Keycloak";

const Cart = () => {
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsCheckingOut(true);
    try {
      const token = keycloak.token;
      const userEmail = keycloak.tokenParsed.email || keycloak.tokenParsed.preferred_username;

      // 1. Prepare Data for Backend
      const orderPayload = {
        userEmail: userEmail,
        orderLineItemsList: cart.map(item => ({
          skuCode: item.skuCode || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      // 2. Send Request
      await axios.post("http://localhost:9000/api/order", orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Success!
      alert("✅ Order Placed Successfully!");
      clearCart(); // Empty the memory
      navigate("/my-orders"); // Redirect to history

    } catch (err) {
      console.error(err);
      alert("❌ Checkout Failed. Check console.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      {/* Header */}
      <div className="bg-white/95 shadow-lg p-5 flex justify-between items-center flex-wrap gap-4">
        <h1 className="m-0 text-3xl font-bold text-purple-600">
          🛒 Shopping Cart
        </h1>
        
        <button 
          onClick={() => navigate("/")} 
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl cursor-pointer font-bold text-sm shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
        >
          ← Continue Shopping
        </button>
      </div>

      {/* Content */}
      <div className="p-5 md:p-10 max-w-4xl mx-auto">
        {cart.length === 0 ? (
          <div className="bg-white p-10 md:p-16 rounded-2xl text-center shadow-2xl">
            <div className="text-7xl mb-5">🛒</div>
            <h2 className="text-gray-800 text-2xl md:text-3xl font-bold mb-3">Your Cart is Empty</h2>
            <p className="text-gray-500 text-base md:text-lg mb-6">
              Add some products to your cart and they will appear here!
            </p>
            <button 
              onClick={() => navigate("/")}
              className="mt-5 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl cursor-pointer font-bold text-sm shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white p-7 rounded-2xl shadow-2xl">
            {/* Cart Items */}
            <div className="grid gap-4 mb-7">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex justify-between items-center p-5 bg-gray-50 rounded-xl transition-all duration-300 ease-in-out flex-wrap gap-4 hover:bg-gray-100 hover:shadow-lg"
                >
                  {/* Product Info */}
                  <div className="flex-grow min-w-[200px]">
                    <h3 className="m-0 text-lg font-bold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="m-0 text-sm text-gray-500">
                      SKU: {item.skuCode || item.id}
                    </p>
                  </div>

                  {/* Price & Quantity */}
                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Price</div>
                      <div className="text-base font-bold text-gray-800">
                        ${parseFloat(item.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Quantity</div>
                      <div className="text-base font-bold text-gray-800">
                        {item.quantity}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Total</div>
                      <div className="text-lg font-bold text-green-600">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg cursor-pointer font-semibold text-xs shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-0.5"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t-2 border-gray-100 pt-6 flex justify-between items-center flex-wrap gap-5">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Total Amount
                </div>
                <div className="text-4xl font-bold text-green-600">
                  ${getCartTotal()}
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`px-10 py-4 text-white rounded-xl cursor-pointer font-bold text-base transition-all duration-300 ease-in-out ${
                  isCheckingOut 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-green-500 to-teal-500 shadow-lg hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {isCheckingOut ? "⏳ Processing..." : "✓ Checkout Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;