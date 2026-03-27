import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/usercontext";
import { logout } from "../../hooks/hooks";

function Navbar() {
  const navigate = useNavigate();

  const handleNavCollapse = () => {
    const navbar = document.getElementById("navbarSupportedContent");
    if (navbar?.classList.contains("show")) {
      const bsCollapse = new window.bootstrap.Collapse(navbar, {
        toggle: false,
      });
      bsCollapse.hide();
    }
  };

  const { isloggedin, setisloggedin, name, avatar } = useContext(UserContext);
  const log = () => {
    logout();
    setisloggedin(false);
    navigate("/");
  };

  return (
    <>
      <nav
        className="navbar sticky-top navbar-expand-lg navbar-light bg-white shadow-sm"
        style={{
          padding: "1rem 0",
          zIndex: 1000,
        }}
      >
        <div className="container">
         

        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center text-decoration-none"
          to="/"
          onClick={handleNavCollapse}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: "600",
            fontSize: "1.6rem",
            letterSpacing: "-0.02em",
            color: "#0a0a0a",
          }}
        >
          BlogHub
        </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars text-dark"></i>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <NavItem
                to="/"
                icon="home"
                label="Home"
                onClick={handleNavCollapse}
                active
              />
              <NavItem
                to="/discover/all"
                icon="compass"
                label="Discover"
                onClick={handleNavCollapse}
              />
              <NavItem
                to="/catagories"
                icon="tags"
                label="Categories"
                onClick={handleNavCollapse}
              />
              <NavItem
                to="/publications"
                icon="book-open"
                label="Publications"
                onClick={handleNavCollapse}
              />
            </ul>

            <div className="d-flex align-items-center">
              
              {!isloggedin ? (
                <>
                  <Link className="nav-link" to="/login">
                    <button
                      className="btn btn-outline me-2 d-flex align-items-center"
                      onClick={handleNavCollapse}
                      style={{ borderRadius: "50px", padding: "0.375rem 1.25rem" }}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </button>
                  </Link>
                  <Link className="nav-link" to="/signup">
                    <button
                      className="btn btn-primary d-flex align-items-center"
                      style={{ borderRadius: "50px", padding: "0.375rem 1.25rem" }}
                      onClick={handleNavCollapse}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Sign Up
                    </button>
                  </Link>
                </>
              ) : (
                <div className="d-flex align-items-center">
                  <Link to="/newpost" className="text-decoration-none me-3">
                    <button
                      className="btn btn-dark d-flex align-items-center shadow-sm"
                      style={{ borderRadius: "50px", padding: "0.4rem 1.2rem", fontWeight: "600" }}
                      onClick={handleNavCollapse}
                    >
                      <i className="fas fa-pen me-2"></i> Write
                    </button>
                  </Link>
                  
                  <div className="nav-item dropdown profile-section d-flex align-items-center">
                    <button
                      className="btn p-0 border-0 bg-transparent position-relative dropdown-toggle"
                      type="button"
                      id="profileDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      <img
                        src={
                          avatar ||
                          "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                        }
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid white",
                        }}
                      ></div>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="profileDropdown" style={{ minWidth: '200px', borderRadius: '12px' }}>
                      <li className="px-3 py-2 border-bottom mb-1">
                        <span className="fw-bold text-dark d-block">{name}</span>
                        <small className="text-muted">@{name?.toLowerCase().replace(/\s+/g, '')}</small>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 d-flex align-items-center" to="/profile" onClick={handleNavCollapse}>
                          <i className="fas fa-user-circle me-3 text-dark"></i> View Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 d-flex align-items-center" to="/my-publications" onClick={handleNavCollapse}>
                          <i className="fas fa-book-open me-3 text-dark"></i> My Publications
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 d-flex align-items-center" to="/profile" onClick={handleNavCollapse}>
                          <i className="fas fa-cog me-3 text-secondary"></i> Settings
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider my-1" /></li>
                      <li>
                        <button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={() => { handleNavCollapse(); log(); }}>
                          <i className="fas fa-sign-out-alt me-3"></i> Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

// Reusable NavItem component
const NavItem = ({ to, icon, label, onClick, active = false }) => (
  <li className="nav-item">
    <Link
      className={`nav-link text-dark d-flex align-items-center ${
        active ? "fw-bold text-dark" : ""
      }`}
      to={to}
      onClick={onClick}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "50px",
        margin: "0 0.25rem",
        opacity: active ? 1 : 0.8,
      }}
    >
      <i className={`fas fa-${icon} me-2 ${active ? 'text-dark' : 'text-secondary'}`} style={{ width: "20px" }}></i>
      {label}
    </Link>
  </li>
);

export default Navbar;
