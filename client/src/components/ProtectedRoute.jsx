import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background:"#F7F3ED" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12, color:"#1A4731" }}><FontAwesomeIcon icon={faLeaf} /></div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14,
            color:"#4A5E50" }}>Loading AgriSmart...</div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
