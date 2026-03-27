import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../../hooks/hooks";
import { useQuery } from "@tanstack/react-query";
import { getSavedPosts, unsaveBlogPost } from "../api/api";
import Loading from "./Loading";
import ErrorPage from "./Eror";
import { UserContext } from "../../context/usercontext";
import { toast } from "react-toastify";

// ── safe category parser ───────────────────────────────────────────────────────
const parseCategories = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const YourBlogPage = ({ onNavigate }) => {
  const { name, avatar } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [savedPage, setSavedPage] = useState(1);

  const { data, isLoading, error } = useProfile();

  // Saved posts query — only fetches when the "Saved" tab is active
  const {
    data: savedData,
    isLoading: savedLoading,
    refetch: refetchSaved,
  } = useQuery({
    queryKey: ["saved-posts", savedPage],
    queryFn: () => getSavedPosts(savedPage),
    enabled: activeTab === "Saved",
    keepPreviousData: true,
  });

  const handleUnsave = async (postId) => {
    try {
      await unsaveBlogPost(postId);
      toast.info("Post removed from saved", { position: "top-right", autoClose: 3000, theme: "light" });
      refetchSaved();
    } catch {
      toast.error("Failed to unsave post");
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      {error && <ErrorPage />}
      {!isLoading && !error && (
        <div id="your-blog-page" className="page active fade-in">
          <div className="container py-5">
            <div className="row">
              {/* ── Sidebar ── */}
              <div className="col-lg-3">
                <div className="glass-panel p-4 mb-4">
                  <div className="text-center mb-4">
                    <img
                      src={avatar || ""}
                      className="profile-avatar mb-3"
                      alt="Profile"
                      style={{ border: "3px solid rgba(255,255,255,0.1)" }}
                    />
                    <h5 className="text-dark fw-bold">Your Blog</h5>
                    <p className="text-secondary small">@{name}</p>
                  </div>
                  <ul className="nav flex-column">
                    {["Dashboard", "Posts", "Saved", "Stats"].map((item, i) => (
                      <li className="nav-item mb-2" key={i}>
                        <button
                          className={`nav-link w-100 border-0 text-start rounded px-3 py-2 d-flex align-items-center ${
                            activeTab === item
                              ? "bg-dark text-white fw-bold shadow-sm"
                              : "text-secondary bg-transparent hover-bg-light"
                          }`}
                          onClick={() => setActiveTab(item)}
                          style={{ transition: "all 0.3s ease" }}
                        >
                          <i
                            className={`fas ${
                              item === "Dashboard"
                                ? `fa-columns ${activeTab === item ? "text-white" : "text-dark"}`
                                : item === "Posts"
                                ? "fa-pen"
                                : item === "Saved"
                                ? "fa-bookmark"
                                : "fa-chart-line"
                            } me-3`}
                            style={{ width: "20px" }}
                          ></i>
                          {item}
                        </button>
                      </li>
                    ))}
                    <li className="nav-item mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <Link
                        to="/my-publications"
                        className="nav-link text-secondary d-flex align-items-center rounded px-3 py-2"
                        style={{ transition: "all 0.2s", fontWeight: 500 }}
                      >
                        <i className="fas fa-book-open me-3" style={{ width: "20px" }}></i>
                        My Publications
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ── Main Area ── */}
              <div className="col-lg-9">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="text-dark fw-bold" style={{ fontFamily: '"Outfit", sans-serif' }}>
                    {activeTab === "Dashboard"
                      ? "Your Dashboard"
                      : activeTab === "Saved"
                      ? "Saved Posts"
                      : `Your ${activeTab}`}
                  </h2>
                  <Link to="/newpost" className="un-rem">
                    <button className="btn btn-dark" onClick={() => onNavigate?.("new-post")}>
                      <i className="fas fa-plus me-2"></i> New Post
                    </button>
                  </Link>
                </div>

                {/* ── Dashboard Tab ── */}
                {activeTab === "Dashboard" && (
                  <>
                    {/* Stats cards */}
                    <div className="row mb-5">
                      {[
                        { label: "Total Posts", value: data?.totalPosts ?? 0 },
                        { label: "Followers", value: data?.followersCount ?? 0 },
                        { label: "Total Impressions", value: data?.totalViews ?? 0 },
                        { label: "Total Likes", value: data?.totalLikes ?? 0 },
                      ].map(({ label, value }) => (
                        <div className="col-md-3 mb-3" key={label}>
                          <div className="glass-panel h-100 p-4 border-0 position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0))" }}>
                            <div className="position-relative z-1">
                              <h6 className="text-secondary text-uppercase fw-bold mb-3" style={{ letterSpacing: "1px", fontSize: "0.8rem" }}>{label}</h6>
                              <h2 className="text-dark fw-bold mb-0" style={{ fontFamily: '"Outfit", sans-serif', fontSize: "2.5rem" }}>{value}</h2>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Posts table */}
                    <div className="glass-panel mb-4">
                      <div className="p-4 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark fw-bold">Recent Posts</h5>
                        <button className="btn btn-sm btn-link text-dark text-decoration-none fw-bold" onClick={() => setActiveTab("Posts")}>
                          View All
                        </button>
                      </div>
                      <div className="p-0">
                        <div className="table-responsive">
                          <table className="table table-borderless text-dark mb-0">
                            <thead className="border-bottom border-secondary border-opacity-25 text-secondary">
                              <tr>
                                <th className="py-3 px-4 fw-normal">Title</th>
                                <th className="py-3 px-4 fw-normal">Status</th>
                                <th className="py-3 px-4 fw-normal">Views</th>
                                <th className="py-3 px-4 fw-normal">Date</th>
                                <th className="py-3 px-4 fw-normal text-end">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(data?.posts ?? []).slice(0, 5).map((post, i) => (
                                <tr key={i} className="border-bottom border-secondary border-opacity-10">
                                  <td className="py-3 px-4 align-middle fw-bold">{post.title}</td>
                                  <td className="py-3 px-4 align-middle">
                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">Published</span>
                                  </td>
                                  <td className="py-3 px-4 align-middle text-secondary">{post.views || 0}</td>
                                  <td className="py-3 px-4 align-middle text-secondary">{new Date(post.updatedAt).toLocaleDateString()}</td>
                                  <td className="py-3 px-4 align-middle text-end">
                                    <Link to={`/edit/${post.id}`}>
                                      <button className="btn btn-sm btn-outline-dark border-0 me-2"><i className="fas fa-edit"></i></button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                              {(data?.posts ?? []).length === 0 && (
                                <tr>
                                  <td colSpan={5} className="text-center text-secondary py-4">No posts yet — write your first one!</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Following */}
                    {data?.following && data.following.length > 0 && (
                      <div className="glass-panel mb-4">
                        <div className="p-4 border-bottom border-secondary border-opacity-25">
                          <h5 className="mb-0 text-dark fw-bold">People You Follow ({data.following.length})</h5>
                        </div>
                        <div className="p-4">
                          <div className="row g-3">
                            {data.following.map((followedUser, i) => (
                              <div className="col-md-6 col-lg-4" key={i}>
                                <Link to={`/other/${followedUser.id}`} className="text-decoration-none">
                                  <div className="d-flex align-items-center p-3 rounded hover-bg-light border border-secondary border-opacity-10" style={{ transition: "transform 0.2s", cursor: "pointer" }}>
                                    <img src={followedUser.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"} alt={followedUser.firstName} className="rounded-circle me-3" width="50" height="50" style={{ objectFit: "cover" }} />
                                    <div className="overflow-hidden">
                                      <h6 className="text-dark mb-0 fw-bold text-truncate">{followedUser.firstName} {followedUser.lastName}</h6>
                                      <small className="text-secondary text-truncate d-block">{followedUser.bio || "BlogHub User"}</small>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── Posts Tab ── */}
                {activeTab === "Posts" && (
                  <div className="glass-panel p-0">
                    <div className="table-responsive">
                      <table className="table table-borderless text-dark mb-0">
                        <thead className="border-bottom border-secondary border-opacity-25 text-secondary">
                          <tr>
                            <th className="py-3 px-4 fw-normal">Title</th>
                            <th className="py-3 px-4 fw-normal">Views</th>
                            <th className="py-3 px-4 fw-normal">Likes</th>
                            <th className="py-3 px-4 fw-normal">Date</th>
                            <th className="py-3 px-4 fw-normal text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data?.posts ?? []).map((post, i) => (
                            <tr key={i} className="border-bottom border-secondary border-opacity-10">
                              <td className="py-3 px-4 align-middle fw-bold">{post.title}</td>
                              <td className="py-3 px-4 align-middle text-secondary">{post.views || 0}</td>
                              <td className="py-3 px-4 align-middle text-secondary">{post.likes || 0}</td>
                              <td className="py-3 px-4 align-middle text-secondary">{new Date(post.updatedAt).toLocaleDateString()}</td>
                              <td className="py-3 px-4 align-middle text-end">
                                <Link to={`/edit/${post.slug || post.id}`} className="btn btn-sm btn-outline-dark border-0 me-2">
                                  <i className="fas fa-edit"></i>
                                </Link>
                                <Link to={`/detail/${post.slug || post.id}`} className="btn btn-sm btn-outline-dark border-0">
                                  <i className="fas fa-eye"></i>
                                </Link>
                              </td>
                            </tr>
                          ))}
                          {(data?.posts ?? []).length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center text-secondary py-4">No posts yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Saved Posts Tab ── */}
                {activeTab === "Saved" && (
                  <div>
                    {savedLoading ? (
                      <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Loading…</span></div>
                      </div>
                    ) : (savedData?.posts ?? []).length === 0 ? (
                      <div className="glass-panel p-5 text-center" style={{ borderRadius: "20px" }}>
                        <i className="far fa-bookmark fa-3x mb-3 d-block text-secondary" style={{ opacity: 0.3 }}></i>
                        <h5 className="text-dark fw-bold mb-2" style={{ fontFamily: '"Outfit", sans-serif' }}>No saved posts yet</h5>
                        <p className="text-secondary mb-4" style={{ fontSize: "0.95rem" }}>
                          When you save a post, it will appear here for easy access.
                        </p>
                        <Link to="/" className="btn btn-dark px-4 py-2" style={{ borderRadius: "10px", fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                          Browse Posts
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="row g-4 mb-4">
                          {(savedData?.posts ?? []).map((post, i) => (
                            <div className="col-md-6" key={i}>
                              <div className="glass-panel h-100 overflow-hidden" style={{ borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)" }}>
                                {/* Post image */}
                                <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                                  <img
                                    src={post?.headimg || "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg"}
                                    alt={post?.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                  {/* Unsave button overlay */}
                                  <button
                                    onClick={() => handleUnsave(post.id)}
                                    title="Remove from saved"
                                    style={{
                                      position: "absolute", top: "10px", right: "10px",
                                      background: "rgba(255,255,255,0.92)", border: "none",
                                      borderRadius: "8px", padding: "6px 10px",
                                      cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                                      color: "#666", display: "flex", alignItems: "center", gap: "5px",
                                      backdropFilter: "blur(4px)", transition: "all 0.2s",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#c0392b"; }}
                                    onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.92)"; e.currentTarget.style.color = "#666"; }}
                                  >
                                    <i className="fas fa-bookmark"></i> Saved
                                  </button>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                  {/* Categories */}
                                  <div className="d-flex flex-wrap gap-2 mb-2">
                                    {parseCategories(post?.categories).slice(0, 2).map((cat, ci) => (
                                      <span key={ci} style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", background: "rgba(0,0,0,0.04)", borderRadius: "4px", padding: "2px 8px" }}>
                                        {cat}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Title */}
                                  <h5 className="fw-bold text-dark mb-3" style={{ fontFamily: '"Outfit", sans-serif', fontSize: "1.1rem", lineHeight: 1.3 }}>
                                    {post?.title}
                                  </h5>

                                  {/* Author + actions */}
                                  <div className="d-flex align-items-center justify-content-between mt-auto">
                                    <div className="d-flex align-items-center gap-2">
                                      <img
                                        src={post?.User?.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                                        alt="Author"
                                        style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                                      />
                                      <span className="text-secondary" style={{ fontSize: "0.82rem" }}>
                                        {post?.User?.firstName || "Unknown"}
                                      </span>
                                    </div>
                                    <Link to={`/detail/${post?.slug || post?.id}`} className="btn btn-sm btn-dark un-rem" style={{ borderRadius: "8px", fontSize: "0.78rem", padding: "5px 14px", fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                                      Read <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {(savedData?.totalPages ?? 1) > 1 && (
                          <nav aria-label="Saved posts navigation">
                            <ul className="pagination justify-content-center" style={{ gap: "0.5rem" }}>
                              <li className={`page-item ${savedPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link bg-transparent border-secondary border-opacity-25 text-dark rounded" onClick={() => setSavedPage(p => Math.max(1, p - 1))}>Previous</button>
                              </li>
                              {[...Array(savedData?.totalPages ?? 1)].map((_, i) => (
                                <li className={`page-item ${savedPage === i + 1 ? "active" : ""}`} key={i}>
                                  <button
                                    className={`page-link rounded border-0 ${savedPage === i + 1 ? "text-white" : "text-dark bg-transparent"}`}
                                    style={savedPage === i + 1 ? { background: "linear-gradient(135deg, #000, #434343)" } : {}}
                                    onClick={() => setSavedPage(i + 1)}
                                  >
                                    {i + 1}
                                  </button>
                                </li>
                              ))}
                              <li className={`page-item ${savedPage === savedData?.totalPages ? "disabled" : ""}`}>
                                <button className="page-link bg-transparent border-secondary border-opacity-25 text-dark rounded" onClick={() => setSavedPage(p => Math.min(savedData?.totalPages ?? 1, p + 1))}>Next</button>
                              </li>
                            </ul>
                          </nav>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ── Stats Tab ── */}
                {activeTab === "Stats" && (
                  <div className="glass-panel p-5 text-center text-secondary">
                    <i className="fas fa-tools fa-3x mb-3 op-25"></i>
                    <p className="fs-5">Stats module is coming soon!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YourBlogPage;