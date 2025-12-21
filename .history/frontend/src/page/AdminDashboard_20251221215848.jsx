import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>⚙️ Admin Dashboard</h1>
      <p>Manage your Inventory and Products here.</p>
      
      <div style={{marginTop: "30px", padding: "20px", border: "1px dashed red"}}>
        <h3>Inventory Manager</h3>
        <p>(We will build the data table here in the next step)</p>
      </div>

      <button 
        onClick={() => navigate("/")}
        style={{marginTop: "20px", padding: "10px", cursor: "pointer"}}
      >
        ← Back to Store
      </button>
    </div>
  );
};

export default AdminDashboard;