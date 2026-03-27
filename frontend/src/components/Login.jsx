import React, { useState } from "react";
import { toast } from "react-toastify";
import { login } from "../api/api";
import Loading from "./Loading";
import { UserContext } from "../../context/usercontext";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Link } from "react-router-dom";
const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);
  const { setname, setisloggedin } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setloading(true);
      const data = await login({ email, password });
      toast.success(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setname(data.name);
      setisloggedin(true);

      window.location.href = "/discover/all";
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password";
      toast.error(errMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setloading(false);
    }
  };

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div id="login-page" className="page active">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="glass-panel p-5 rounded">
                  <div className="text-center mb-5">
                    <h2 className="mb-3 text-dark fw-bold" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem' }}>Welcome Back</h2>
                    <p className="text-secondary">
                      Sign in to your <span className="fw-bold text-dark">BlogHub</span> account
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="loginEmail" className="form-label text-dark fw-bold">
                        Email Address
                      </label>
                      <input
                        className="form-control"
                        id="loginEmail"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="loginPassword" className="form-label text-dark fw-bold">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="loginPassword"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                      />
                    </div>

                   
                    <button
                      type="submit"
                      className="btn btn-dark w-100 mb-4 py-2 fw-bold shadow-minimal"
                    >
                      Sign In <i className="fas fa-sign-in-alt ms-2"></i>
                    </button>

                    <div className="text-center pt-3 border-top border-secondary border-opacity-25">
                      <p className="mb-0 text-secondary">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-dark fw-bold text-decoration-none ms-1">Sign up</Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
