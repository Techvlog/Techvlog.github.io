import React from "react";
import { Link } from "react-router-dom";

const LoginPrompt = () => {
  return (
    <div
      className="container  my-5"
      style={{
        maxWidth: "800px",
        animation: "fadeIn 0.6s ease forwards",
      }}
    >
      <div
        className="text-center p-4 p-md-5 rounded-3 shadow-sm"
        style={{
          backgroundColor: "white",
          border: "1px solid #e9ecef",
        }}
      >
        <div className="mb-4">
          <img
            src="https://cdn.pixabay.com/photo/2018/01/17/07/06/laptop-3087585_1280.jpg"
            alt="Login to continue"
            className="img-fluid rounded-3 mb-4"
            style={{
              maxHeight: "300px",
              objectFit: "cover",
              width: "100%",
            }}
          />
          <h2
            className="mb-3"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: "700",
              color: "#292929",
            }}
          >
            Join Our Community
          </h2>
          <p
            className="lead mb-4"
            style={{
              color: "#6c757d",
              fontSize: "1.2rem",
            }}
          >
            Please login or sign up to access this content and enjoy all the
            benefits of our platform.
          </p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div
              className="h-100 p-4 rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div
                className="mb-3"
                style={{
                  color: "#00ab6b",
                  fontSize: "2rem",
                }}
              >
                <i className="fas fa-book-open"></i>
              </div>
              <h5 style={{ fontWeight: "600", color: "#292929" }}>
                Access Exclusive Content
              </h5>
              <p style={{ color: "#6c757d", fontSize: "0.95rem" }}>
                Read premium articles and tutorials only available to members.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="h-100 p-4 rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div
                className="mb-3"
                style={{
                  color: "#00ab6b",
                  fontSize: "2rem",
                }}
              >
                <i className="fas fa-heart"></i>
              </div>
              <h5 style={{ fontWeight: "600", color: "#292929" }}>
                Save Favorites
              </h5>
              <p style={{ color: "#6c757d", fontSize: "0.95rem" }}>
                Bookmark your favorite posts and access them anytime.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="h-100 p-4 rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div
                className="mb-3"
                style={{
                  color: "#00ab6b",
                  fontSize: "2rem",
                }}
              >
                <i className="fas fa-comments"></i>
              </div>
              <h5 style={{ fontWeight: "600", color: "#292929" }}>
                Join Discussions
              </h5>
              <p style={{ color: "#6c757d", fontSize: "0.95rem" }}>
                Participate in conversations with other members.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="h-100 p-4 rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div
                className="mb-3"
                style={{
                  color: "#00ab6b",
                  fontSize: "2rem",
                }}
              >
                <i className="fas fa-bell"></i>
              </div>
              <h5 style={{ fontWeight: "600", color: "#292929" }}>
                Get Notifications
              </h5>
              <p style={{ color: "#6c757d", fontSize: "0.95rem" }}>
                Stay updated with new content from authors you follow.
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
          <Link
            to="/login"
            className="btn btn-primary px-4 py-2"
            style={{
              borderRadius: "50px",
              fontWeight: "500",
              minWidth: "120px",
            }}
          >
            <i className="fas fa-sign-in-alt me-2"></i> Login
          </Link>
          <Link
            to="/signup"
            className="btn btn-outline-primary px-4 py-2"
            style={{
              borderRadius: "50px",
              fontWeight: "500",
              minWidth: "120px",
            }}
          >
            <i className="fas fa-user-plus me-2"></i> Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
