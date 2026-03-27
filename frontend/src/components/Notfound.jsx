import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center min-vh-100"
      style={{
        background: "transparent",
        position: "relative",
      }}
    >
      {/* Main Content */}
      <div
        className="container text-center px-4 py-5"
        style={{ maxWidth: "800px", zIndex: 1 }}
      >
        {/* Animated 404 Illustration */}
        <div style={{ animation: "float 4s ease-in-out infinite" }}>
          <img
            src="https://www.scopycode.com/includes/images/blog/404_error_page_not_found.gif"
            alt="Lost astronaut"
            className="img-fluid mb-4"
            style={{
              width: "350px",
              borderRadius: "50%",
              border: "4px solid rgba(139, 92, 246, 0.3)",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.4)",
              filter: "contrast(1.2)"
            }}
          />
        </div>

        {/* 404 Text */}
        <h1
          className="display-1 fw-bold mb-3"
          style={{
            fontFamily: '"Outfit", sans-serif',
            background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 10px 30px rgba(139, 92, 246, 0.2)"
          }}
        >
          404
        </h1>

        <h2 className="h2 mb-4 text-dark" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
          <i className="fas fa-satellite-dish me-2 text-info"></i>
          Signal Lost in the Digital Void
        </h2>

        <p className="lead mb-4 text-secondary" style={{ lineHeight: 1.7 }}>
          The page you are looking for has been pulled into a black hole.<br />
          Or maybe it just never existed in this dimension.
        </p>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-4 mt-5">
          <Link
            to="/"
            className="btn btn-lg px-5 py-3 rounded-pill d-flex align-items-center"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
              color: "white",
              fontWeight: 700,
              transition: "all 0.3s ease",
              boxShadow: "0 8px 25px rgba(139, 92, 246, 0.5)",
              border: "none"
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <i className="fas fa-home me-2"></i>
            Warp Back Home
          </Link>
        </div>

        {/* Fun "Survival Tips" Section */}
        <div
          className="mt-5 p-4 text-start glass-panel mx-auto"
          style={{
            maxWidth: '600px'
          }}
        >
          <h5
            className="d-flex align-items-center mb-3 fw-bold text-dark"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            <i className="fas fa-lightbulb me-2 text-warning"></i>
            Survival Tips for the Void:
          </h5>
          <ul className="text-secondary mb-0" style={{ lineHeight: '1.8' }}>
            <li>Double-check your navigational coordinates (URL)</li>
            <li>Make sure your hyperdrive connection is stable</li>
            <li>Return to the homepage before your oxygen runs out</li>
          </ul>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}
      </style>
    </div>
  );
};

export default NotFoundPage;
