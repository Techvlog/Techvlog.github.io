import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Outlet, Link } from "react-router-dom";
import { UserProvider } from "../context/usercontext";
import { UserContext } from "../context/usercontext";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <UserProvider>
        <Navbar />
        <div className="main-content">
          <Outlet />
        </div>
        <footer className="footer bg-light pt-5 pb-4 mt-auto border-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 mb-4">
                <Link
                  to="/"
                  className="navbar-brand d-flex align-items-center mb-3"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: "800",
                    fontSize: "1.5rem",
                  }}
                >
                  <i className="fas fa-bolt me-2 text-gradient" style={{ fontSize: "1.2rem" }}></i>
                  <span className="text-dark">Tech</span><span className="text-gradient">vlog</span>
                </Link>
                <p className="text-secondary" style={{ maxWidth: "300px" }}>
                  Techvlog is a modern platform for writers and readers to
                  connect, share ideas, and discover new perspectives.
                </p>
                <div className="d-flex gap-3 mt-4">
                  <a href="#" className="text-secondary hover-text-primary fs-5"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="text-secondary hover-text-primary fs-5"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="text-secondary hover-text-primary fs-5"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="text-secondary hover-text-primary fs-5"><i className="fab fa-linkedin-in"></i></a>
                </div>
              </div>
              <div className="col-lg-2 col-md-4 mb-4">
                <h5 className="fw-bold mb-3 text-dark">Explore</h5>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  <li><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
                  <li><Link to="/discover/all" className="text-secondary text-decoration-none">Discover</Link></li>
                  <li><Link to="/catagories" className="text-secondary text-decoration-none">Categories</Link></li>
                  <li><Link to="/publications" className="text-secondary text-decoration-none">Publications</Link></li>
                  <li><Link to="/about" className="text-secondary text-decoration-none">About</Link></li>
                  <li><Link to="/signup" className="text-secondary text-decoration-none">Sign Up</Link></li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-4 mb-4">
                <h5 className="fw-bold mb-3 text-dark">Categories</h5>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  <li><Link to="/cat/Technology" className="text-secondary text-decoration-none">Technology</Link></li>
                  <li><Link to="/cat/Business" className="text-secondary text-decoration-none">Business</Link></li>
                  <li><Link to="/cat/Health" className="text-secondary text-decoration-none">Health</Link></li>
                  <li><Link to="/cat/Travel" className="text-secondary text-decoration-none">Travel</Link></li>
                  <li><Link to="/cat/Food" className="text-secondary text-decoration-none">Food</Link></li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-4 mb-4">
                <h5 className="fw-bold mb-3 text-dark">Company</h5>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  <li><Link to="/about" className="text-secondary text-decoration-none">About Us</Link></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Careers</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Privacy Policy</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Terms of Service</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Contact</a></li>
                </ul>
              </div>
              <div className="col-lg-2 mb-4">
                <h5 className="fw-bold mb-3 text-dark">Support</h5>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  <li><a href="#" className="text-secondary text-decoration-none">Help Center</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Community</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Guidelines</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Feedback</a></li>
                </ul>
              </div>
            </div>
            <div className="border-top pt-4 mt-2 mb-0 d-flex flex-column flex-md-row justify-content-between align-items-center">
              <p className="text-secondary mb-2 mb-md-0 small">
                &copy; {new Date().getFullYear()} Techvlog. All rights reserved.
              </p>
              <p className="text-secondary mb-0 small">
                Made with <i className="fas fa-heart text-danger mx-1"></i> by Techvlog Team
              </p>
            </div>
          </div>
        </footer>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </UserProvider>
    </>
  );
}

export default App;
