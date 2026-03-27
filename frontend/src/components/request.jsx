import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/usercontext";
import { useContext } from "react";

const SignInModal = ({ show, onClose }) => {
  const { loading: authLoading } = useContext(UserContext);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!show || authLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        opacity: isClosing ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="shadow-lg rounded"
        style={{
          backgroundColor: "white",
          width: "90%",
          maxWidth: "500px",
          padding: "30px",
          transform: isClosing ? "scale(0.9)" : "scale(1)",
          transition: "transform 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              color: "#2c3e50",
              fontWeight: "700",
              margin: 0,
              fontSize: "1.8rem",
            }}
          >
            <i className="fas fa-user-circle me-2"></i>
            Join Our Community
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: "#6c757d",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <p style={{ fontSize: "1.1rem", color: "#495057" }}>
            To like this post and interact with our community, please sign in or
            create an account.
          </p>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              margin: "15px 0",
            }}
          >
            <h5 style={{ color: "#3b82f6", marginBottom: "10px" }}>
              <i className="fas fa-star me-2"></i>Member Benefits:
            </h5>
            <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
              <li>Like and save your favorite posts</li>
              <li>Comment and join discussions</li>
              <li>Personalized content recommendations</li>
              <li>Create your own blog posts</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <button
            className="btn btn-primary"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
            onClick={() => {
              navigate("/login");
            }}
          >
            <i className="fas fa-sign-in-alt"></i>{" "}
            <Link to="/login" className="un-rem">
              Sign In
            </Link>
          </button>
          <button
            className="btn btn-success"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
            onClick={() => {
              navigate("/signup");
            }}
          >
            <i className="fas fa-user-plus"></i> Create Account
          </button>
          <button
            onClick={handleClose}
            className="btn btn-link"
            style={{
              color: "#6c757d",
              textDecoration: "none",
              marginTop: "10px",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
export default SignInModal;
