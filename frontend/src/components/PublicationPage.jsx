import React, { useState, useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPublication,
  followPublication,
  unfollowPublication,
  checkFollowPublication,
} from "../api/api";
import { UserContext } from "../../context/usercontext";
import Loading from "./Loading";
import ErrorPage from "./Eror";
import SubmitToPublicationModal from "./SubmitToPublicationModal";
import { toast } from "react-toastify";

const PLACEHOLDER_COVER =
  "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg";
const PLACEHOLDER_AVATAR =
  "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

const parseCategories = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [String(p)]; }
  catch { return String(raw).split(",").map(s => s.trim()).filter(Boolean); }
};

const get10Words = (html) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, 18).join(" ") + (words.length > 18 ? "…" : "");
};

function PublicationPage() {
  const { id } = useParams();
  const { isloggedin, userid, loading: authLoading } = useContext(UserContext);
  const [page, setPage] = useState(1);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["publication", id, page],
    queryFn: () => getPublication(id, page),
    keepPreviousData: true,
  });

  const pub = data?.publication;
  const posts = data?.posts ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Check follow status
  useEffect(() => {
    if (!authLoading && isloggedin && pub) {
      setLocalFollowers(pub.followersCount ?? 0);
      checkFollowPublication(id)
        .then(r => setFollowing(r.following))
        .catch(() => {});
    } else if (pub) {
      setLocalFollowers(pub.followersCount ?? 0);
    }
  }, [pub, isloggedin, authLoading, id]);

  const handleFollowToggle = async () => {
    if (!isloggedin) { toast.info("Sign in to follow publications"); return; }
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowPublication(id);
        setFollowing(false);
        setLocalFollowers(p => Math.max(0, p - 1));
        toast.info("Unfollowed publication");
      } else {
        await followPublication(id);
        setFollowing(true);
        setLocalFollowers(p => p + 1);
        toast.success("Now following!");
      }
      qc.invalidateQueries(["publication", id]);
    } catch { toast.error("Failed to update follow status"); }
    finally { setFollowLoading(false); }
  };

  if (isLoading) return <Loading />;
  if (error || !pub) return <ErrorPage />;

  const isOwner = userid === pub.ownerId;

  return (
    <div id="publication-page" className="page active fade-in" style={{ minHeight: "100vh" }}>

      {/* ── Cover / Hero ── */}
      <div style={{ position: "relative", height: "280px", overflow: "hidden" }}>
        <img
          src={pub.coverImage || PLACEHOLDER_COVER}
          alt={pub.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)" }} />

        {/* Breadcrumb */}
        <div style={{ position: "absolute", top: "24px", left: "32px" }}>
          <Link to="/publications" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", textDecoration: "none", fontFamily: '"Outfit", sans-serif' }}>
            <i className="fas fa-arrow-left me-2"></i>Publications
          </Link>
        </div>
      </div>

      {/* ── Publication Info Bar ── */}
      <div className="container" style={{ marginTop: "-60px", position: "relative", zIndex: 10 }}>
        <div
          className="glass-panel p-4 mb-5"
          style={{ borderRadius: "24px", border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}
        >
          <div className="d-flex align-items-start gap-4 flex-wrap">
            {/* Logo */}
            <img
              src={pub.logo || PLACEHOLDER_AVATAR}
              alt={pub.name}
              style={{ width: "80px", height: "80px", borderRadius: "18px", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", flexShrink: 0 }}
            />

            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)", color: "#0a0a0a", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                    {pub.name}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.82rem", color: "#888", fontFamily: '"Outfit", sans-serif' }}>
                      By{" "}
                      <Link to={`/other/${pub.ownerId}`} style={{ color: "#0a0a0a", fontWeight: 600, textDecoration: "none" }}>
                        {pub.Owner?.firstName}
                      </Link>
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "#888", fontFamily: '"Outfit", sans-serif' }}>
                      <i className="fas fa-users me-1" style={{ fontSize: "0.72rem" }}></i>
                      {localFollowers} followers
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "#888", fontFamily: '"Outfit", sans-serif' }}>
                      <i className="fas fa-file-alt me-1" style={{ fontSize: "0.72rem" }}></i>
                      {data?.totalPosts ?? 0} posts
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {isOwner ? (
                    <>
                      <Link
                        to={`/publication/${id}/dashboard`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#0a0a0a", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem", padding: "9px 20px", borderRadius: "10px", textDecoration: "none" }}
                      >
                        <i className="fas fa-tachometer-alt"></i> Dashboard
                      </Link>
                      <Link
                        to={`/publication/${id}/edit`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "transparent", color: "#555", border: "1px solid rgba(0,0,0,0.15)", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem", padding: "9px 20px", borderRadius: "10px", textDecoration: "none" }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          background: following ? "transparent" : "#0a0a0a",
                          color: following ? "#555" : "#fff",
                          border: following ? "1px solid rgba(0,0,0,0.15)" : "none",
                          fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem",
                          padding: "9px 22px", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                        }}
                      >
                        {followLoading
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : <i className={following ? "fas fa-check" : "fas fa-plus"}></i>}
                        {following ? "Following" : "Follow"}
                      </button>
                      {isloggedin && (
                        <button
                          onClick={() => setShowSubmitModal(true)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            background: "transparent", color: "#555",
                            border: "1px solid rgba(0,0,0,0.15)",
                            fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem",
                            padding: "9px 20px", borderRadius: "10px", cursor: "pointer",
                          }}
                        >
                          <i className="fas fa-paper-plane"></i> Submit Post
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {pub.description && (
                <p style={{ color: "#666", fontSize: "0.92rem", lineHeight: 1.65, marginTop: "14px", marginBottom: 0, maxWidth: "600px" }}>
                  {pub.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Posts Grid ── */}
        {posts.length === 0 ? (
          <div className="text-center py-5 glass-panel" style={{ borderRadius: "20px" }}>
            <i className="fas fa-feather-alt fa-3x mb-3 d-block text-secondary" style={{ opacity: 0.3 }}></i>
            <h5 className="text-dark fw-bold" style={{ fontFamily: '"Outfit", sans-serif' }}>No published posts yet</h5>
            <p className="text-secondary">
              {isOwner
                ? "Approve submissions from your dashboard to publish them here."
                : "Check back soon for new content."}
            </p>
          </div>
        ) : (
          <>
            <h4 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", marginBottom: "28px" }}>
              Latest Stories
            </h4>
            <div className="row g-4 mb-5">
              {posts.map((post) => (
                <div className="col-md-6 col-lg-4" key={post?.id}>
                  <Link to={`/detail/${post?.slug || post?.id}`} className="text-decoration-none">
                    <div
                      style={{
                        background: "#fff", borderRadius: "18px",
                        overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)",
                        height: "100%", display: "flex", flexDirection: "column",
                        transition: "all 0.3s cubic-bezier(0.165,0.84,0.44,1)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)"; }}
                      onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
                    >
                      <div style={{ height: "180px", overflow: "hidden" }}>
                        <img
                          src={post?.headimg || PLACEHOLDER_COVER}
                          alt={post?.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                          onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                        />
                      </div>
                      <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {parseCategories(post?.categories).slice(0, 2).map((c, i) => (
                            <span key={i} style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", background: "rgba(0,0,0,0.04)", borderRadius: "4px", padding: "3px 9px" }}>{c}</span>
                          ))}
                        </div>
                        <h5 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", fontSize: "1.05rem", lineHeight: 1.3, marginBottom: "10px", flexGrow: 1 }}>
                          {post?.title}
                        </h5>
                        <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "16px" }}>
                          {get10Words(post?.content)}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                          <img src={post?.User?.avatar || PLACEHOLDER_AVATAR} alt="author" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                          <span style={{ fontSize: "0.78rem", color: "#999", fontFamily: '"Outfit", sans-serif' }}>
                            {post?.User?.firstName} · {new Date(post?.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mb-5">
                <ul className="pagination justify-content-center" style={{ gap: "0.5rem" }}>
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link bg-transparent border-secondary border-opacity-25 text-dark rounded" onClick={() => setPage(p => p - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                      <button
                        className={`page-link rounded border-0 ${page === i + 1 ? "text-white" : "text-dark bg-transparent"}`}
                        style={page === i + 1 ? { background: "linear-gradient(135deg, #000, #434343)" } : {}}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button className="page-link bg-transparent border-secondary border-opacity-25 text-dark rounded" onClick={() => setPage(p => p + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>

      {/* ── Submit Modal ── */}
      {showSubmitModal && (
        <SubmitToPublicationModal
          publicationId={id}
          publicationName={pub.name}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
}

export default PublicationPage;
