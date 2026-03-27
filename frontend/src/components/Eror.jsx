import React from "react";

const ErrorPage = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        padding: "40px 20px",
        position: "relative"
      }}
    >
      <div className="container" style={{ zIndex: 1 }}>
        <div className="row justify-content-center w-100">
          <div className="col-md-8 col-lg-6 text-center">
            {/* Animated GIF */}
            <div style={{ animation: "float 4s ease-in-out infinite" }}>
              <img
                src="https://cdn.svgator.com/images/2024/04/electrocuted-caveman-animation-404-error-page.gif"
                alt="Error animation"
                className="img-fluid"
                style={{
                  width: "250px",
                  height: "250px",
                  marginBottom: "30px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid rgba(244, 63, 94, 0.3)",
                  boxShadow: "0 0 40px rgba(244, 63, 94, 0.2)",
                  filter: "contrast(1.2)"
                }}
              />
            </div>

            {/* Error Heading */}
            <h1
              className="mb-4 text-dark"
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: "3rem",
                fontWeight: "800",
                textShadow: "0 4px 20px rgba(244, 63, 94, 0.4)"
              }}
            >
              System Malfunction
            </h1>

            {/* Error Message */}
            <p
              className="mb-5 text-secondary"
              style={{
                fontSize: "1.2rem",
                lineHeight: "1.7",
              }}
            >
              We encountered a disruption in the matrix while processing your request.
              Our top engineers have been notified and are working on a fix.
            </p>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center gap-4 mb-5 flex-wrap">
              <a
                href="/"
                className="btn text-dark"
                style={{
                  background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                  padding: "12px 30px",
                  borderRadius: "30px",
                  fontWeight: "600",
                  border: "none",
                  boxShadow: "0 8px 20px rgba(225, 29, 72, 0.4)"
                }}
              >
                <i className="fas fa-home me-2"></i> Return Home
              </a>
              <a
                href="/contact"
                className="btn"
                style={{
                  color: "#f43f5e",
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  padding: "12px 30px",
                  borderRadius: "30px",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-headset me-2"></i> Contact Support
              </a>
            </div>

            {/* Additional Help */}
            <div
              className="p-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}
            >
              <h5
                className="mb-3 text-dark"
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: "1.3rem",
                  fontWeight: "700"
                }}
              >
                Need immediate backup?
              </h5>
              <p className="text-secondary mb-0">
                Transmit a message to{" "}
                <a
                  href="mailto:support@bloghub.com"
                  style={{ color: "#06b6d4", textDecoration: "none", fontWeight: "600" }}
                >
                  support@bloghub.com
                </a>{" "}
                or dial{" "}
                <a href="tel:+1234567890" style={{ color: "#06b6d4", textDecoration: "none", fontWeight: "600" }}>
                  +1 (234) 567-890
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
};

export default ErrorPage;
