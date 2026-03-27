import React, { useState, useEffect } from "react";
import { signup } from "../api/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/usercontext";
import { useContext } from "react";
import { toast } from "react-toastify";
import Loading from "./Loading";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [avatarOptions, setAvatarOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const { setisloggedin, setname } = useContext(UserContext);

  // Generate 8 random avatar options on component mount
  useEffect(() => {
    const generateAvatarOptions = () => {
      const options = [];
      for (let i = 0; i < 8; i++) {
        const randomSeed = Math.floor(Math.random() * 1000);
        options.push({
          id: i,
          url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`,
          seed: randomSeed,
        });
      }
      setAvatarOptions(options);
      setSelectedAvatar(options[0]?.url || "");
    };

    generateAvatarOptions();
  }, []);

  // Password validation rules
  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number.";
    }
    return null; // valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await signup({
        fstname: firstName,
        lstName: lastName,
        email,
        password,
        avatar: selectedAvatar,
      });

      setisloggedin(true);
      setname(data.name);
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
      window.location.href = "/discover/all";
    } catch (error) {
      console.log(error.response?.data?.error);
      toast.error(error.response?.data?.error || "An error occurred", {
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
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
  };

  const generateNewAvatars = () => {
    const newOptions = [];
    for (let i = 0; i < 8; i++) {
      const randomSeed = Math.floor(Math.random() * 1000);
      newOptions.push({
        id: i,
        url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`,
        seed: randomSeed,
      });
    }
    setAvatarOptions(newOptions);
    setSelectedAvatar(newOptions[0]?.url || "");
  };

  // Live password strength indicator
  const getPasswordHints = () => {
    if (!password) return null;
    const checks = [
      { label: "At least 8 characters", pass: password.length >= 8 },
      { label: "One uppercase letter (A-Z)", pass: /[A-Z]/.test(password) },
      { label: "One lowercase letter (a-z)", pass: /[a-z]/.test(password) },
      { label: "One number (0-9)", pass: /[0-9]/.test(password) },
    ];
    return checks;
  };

  const passwordHints = getPasswordHints();

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div id="register-page" className="page active fade-in">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="glass-panel p-5 rounded">
                  <div className="text-center mb-5">
                    <h2 className="mb-3 text-dark fw-bold" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem' }}>Join BlogHub</h2>
                    <p className="text-secondary">
                      Create your account to start writing and reading
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label htmlFor="firstName" className="form-label text-dark fw-bold">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label htmlFor="lastName" className="form-label text-dark fw-bold">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="registerEmail" className="form-label text-dark fw-bold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="registerEmail"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="registerPassword" className="form-label text-dark fw-bold">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="registerPassword"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                      />
                    </div>

                    {/* Live password hints */}
                    {passwordHints && (
                      <div className="mb-4 px-1">
                        {passwordHints.map((hint, i) => (
                          <div key={i} className="d-flex align-items-center gap-2 mt-1">
                            <i
                              className={`fas ${hint.pass ? 'fa-check-circle text-success' : 'fa-times-circle text-secondary'}`}
                              style={{ fontSize: '0.75rem' }}
                            ></i>
                            <small className={hint.pass ? 'text-success' : 'text-secondary'}>
                              {hint.label}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label text-dark fw-bold">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-dark w-100 mb-4 py-2 fw-bold shadow-minimal"
                    >
                      Create Account <i className="fas fa-user-plus ms-2"></i>
                    </button>

                    <div className="text-center pt-3 border-top border-secondary border-opacity-25">
                      <p className="mb-0 text-secondary">
                        Already have an account?{" "}
                        <Link to="/login" className="text-dark fw-bold text-decoration-none ms-1">Sign in</Link>
                      </p>
                    </div>
                  </form>

                  {/* Avatar Selection Section */}
                  <div className="mt-5 pt-4 border-top border-secondary border-opacity-25">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0 text-dark fw-bold">Choose Your Avatar</h5>
                      <button
                        className="btn btn-sm btn-outline-dark rounded-pill"
                        onClick={generateNewAvatars}
                      >
                        <i className="fas fa-sync-alt me-1"></i> Regenerate
                      </button>
                    </div>

                    <div className="mb-4 text-center">
                      {selectedAvatar && (
                        <div className="mb-3 position-relative d-inline-block">
                          <div style={{
                            position: 'absolute',
                            top: -5, left: -5, right: -5, bottom: -5,
                            background: 'var(--accent-primary)',
                            borderRadius: '50%',
                            zIndex: 0,
                          }}></div>
                          <img
                            src={selectedAvatar}
                            alt="Selected Avatar"
                            className="img-fluid rounded-circle position-relative bg-light"
                            style={{ width: "110px", height: "110px", border: "4px solid #ffffff", zIndex: 1 }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="row g-3">
                      {avatarOptions.map((avatar) => (
                        <div className="col-3" key={avatar.id}>
                          <div
                            className={`p-1 rounded-circle d-flex justify-content-center align-items-center ${
                              selectedAvatar === avatar.url
                                ? ""
                                : "opacity-75"
                            }`}
                            onClick={() => handleAvatarSelect(avatar.url)}
                            style={{ 
                              cursor: "pointer", 
                              transition: "all 0.3s ease",
                              background: selectedAvatar === avatar.url ? 'var(--accent-primary)' : 'transparent',
                              transform: selectedAvatar === avatar.url ? 'scale(1.1)' : 'scale(1)'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={e => e.currentTarget.style.transform = selectedAvatar === avatar.url ? 'scale(1.1)' : 'scale(1)'}
                          >
                            <img
                              src={avatar.url}
                              alt={`Avatar ${avatar.id}`}
                              className="img-fluid rounded-circle bg-light"
                              style={{
                                width: "60px",
                                height: "60px",
                                border: selectedAvatar === avatar.url ? "2px solid #000" : "2px solid rgba(0,0,0,0.1)"
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterPage;