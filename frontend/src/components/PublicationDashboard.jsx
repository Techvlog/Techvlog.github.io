import React, { useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPublication,
  getSubmissions,
  approveSubmission,
  rejectSubmission,
  deletePublication,
} from "../api/api";
import { UserContext } from "../../context/usercontext";
import Loading from "./Loading";
import ErrorPage from "./Eror";
import { toast } from "react-toastify";

const PLACEHOLDER =
  "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg";
const AVATAR_PLACEHOLDER =
  "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

const statusColor = {
  pending: { bg: "rgba(255,165,0,0.1)", text: "#b8860b", label: "Pending" },
  approved: { bg: "rgba(39,174,96,0.1)", text: "#1e8449", label: "Approved" },
  rejected: { bg: "rgba(231,76,60,0.1)", text: "#c0392b", label: "Rejected" },
};

function PublicationDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userid } = useContext(UserContext);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const qc = useQueryClient();

  // Publication info
  const { data: pubData, isLoading: pubLoading, error: pubError } = useQuery({
    queryKey: ["publication", id],
    queryFn: () => getPublication(id),
  });

  // Submissions
  const { data: subData, isLoading: subLoading, refetch } = useQuery({
    queryKey: ["submissions", id, activeStatus],
    queryFn: () => getSubmissions(id, activeStatus),
    enabled: !!id,
  });

  const pub = pubData?.publication;
  const submissions = subData?.submissions ?? [];

  if (pubLoading) return <Loading />;
  if (pubError || !pub) return <ErrorPage />;
  if (pub.ownerId !== userid) return (
    <div className="container py-5 text-center">
      <h4 className="text-dark">Access denied — you are not the owner of this publication.</h4>
      <Link to="/publications" className="btn btn-dark mt-3">Browse Publications</Link>
    </div>
  );

  const handleApprove = async (subId) => {
    setActionLoading(subId + "-approve");
    try {
      await approveSubmission(id, subId, noteInputs[subId] || "");
      toast.success("Submission approved!");
      qc.invalidateQueries(["publication", id]);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    } finally { setActionLoading(null); }
  };

  const handleReject = async (subId) => {
    setActionLoading(subId + "-reject");
    try {
      await rejectSubmission(id, subId, noteInputs[subId] || "");
      toast.info("Submission rejected.");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    } finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    try {
      await deletePublication(id);
      toast.success("Publication deleted");
      navigate("/publications");
    } catch { toast.error("Failed to delete publication"); }
  };

  const tabs = ["pending", "approved", "rejected"];

  return (
    <div className="page active fade-in" style={{ minHeight: "100vh", background: "#fafafa" }}>
      <div className="container py-5">

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-5">
          <div>
            <Link to={`/publication/${id}`} style={{ fontSize: "0.82rem", color: "#888", textDecoration: "none", fontFamily: '"Outfit", sans-serif', display: "block", marginBottom: "6px" }}>
              <i className="fas fa-arrow-left me-1"></i> {pub.name}
            </Link>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: "#0a0a0a", fontSize: "1.8rem", letterSpacing: "-0.02em", margin: 0 }}>
              Publication Dashboard
            </h2>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to={`/publication/${id}/edit`}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid rgba(0,0,0,0.15)", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem", padding: "9px 18px", borderRadius: "10px", textDecoration: "none" }}
            >
              <i className="fas fa-edit"></i> Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.2)", color: "#c0392b", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem", padding: "9px 18px", borderRadius: "10px", cursor: "pointer" }}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="row g-3 mb-5">
          {[
            { label: "Total Followers", value: pub.followersCount ?? 0, icon: "fa-users", color: "#3498db" },
            { label: "Total Posts", value: pubData?.totalPosts ?? 0, icon: "fa-file-alt", color: "#2ecc71" },
            { label: "Pending Reviews", value: submissions.filter ? (activeStatus === "pending" ? submissions.length : "—") : "—", icon: "fa-clock", color: "#f39c12" },
          ].map(({ label, value, icon, color }) => (
            <div className="col-md-4" key={label}>
              <div className="glass-panel p-4" style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`fas ${icon}`} style={{ color, fontSize: "1.1rem" }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#aaa", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    <h3 style={{ margin: 0, fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: "#0a0a0a", fontSize: "1.8rem" }}>{value}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submissions section */}
        <div className="glass-panel" style={{ borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {/* Tab header */}
          <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h5 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", margin: 0 }}>Submissions</h5>
            <div style={{ display: "flex", gap: "6px" }}>
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveStatus(t)}
                  style={{
                    padding: "6px 18px", borderRadius: "8px",
                    border: activeStatus === t ? "none" : "1px solid rgba(0,0,0,0.12)",
                    background: activeStatus === t ? "#0a0a0a" : "transparent",
                    color: activeStatus === t ? "#fff" : "#666",
                    fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.82rem",
                    cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.02em",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Submission list */}
          {subLoading ? (
            <div className="text-center py-5"><span className="spinner-border text-secondary"></span></div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-5">
              <i className={`fas ${activeStatus === "pending" ? "fa-inbox" : activeStatus === "approved" ? "fa-check-circle" : "fa-times-circle"} fa-3x mb-3 d-block text-secondary`} style={{ opacity: 0.3 }}></i>
              <p className="text-secondary" style={{ fontFamily: '"Outfit", sans-serif' }}>No {activeStatus} submissions</p>
            </div>
          ) : (
            <div>
              {submissions.map((sub) => {
                const post = sub.Post;
                const s = statusColor[sub.status] || statusColor.pending;
                const isActing = actionLoading?.startsWith(String(sub.id));
                return (
                  <div
                    key={sub.id}
                    style={{ padding: "24px 28px", borderBottom: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}
                  >
                    {/* Post thumbnail */}
                    <img
                      src={post?.headimg || PLACEHOLDER}
                      alt={post?.title}
                      style={{ width: "80px", height: "60px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                    />

                    {/* Info */}
                    <div style={{ flexGrow: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <h6 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", margin: 0, fontSize: "0.95rem" }}>
                          {post?.title || "Untitled Post"}
                        </h6>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, background: s.bg, color: s.text, borderRadius: "99px", padding: "3px 10px", fontFamily: '"Outfit", sans-serif' }}>
                          {s.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <img src={sub.Submitter?.avatar || AVATAR_PLACEHOLDER} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                        <span style={{ fontSize: "0.78rem", color: "#999", fontFamily: '"Outfit", sans-serif' }}>
                          by {sub.Submitter?.firstName} · {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Note input for pending */}
                      {activeStatus === "pending" && (
                        <input
                          type="text"
                          placeholder="Optional review note…"
                          value={noteInputs[sub.id] || ""}
                          onChange={e => setNoteInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                          style={{ width: "100%", maxWidth: "360px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "7px 12px", fontSize: "0.82rem", fontFamily: '"Outfit", sans-serif', outline: "none", background: "#fafafa" }}
                        />
                      )}
                      {sub.reviewNote && activeStatus !== "pending" && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#aaa", fontStyle: "italic" }}>Note: {sub.reviewNote}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                      <Link
                        to={`/detail/${post?.slug || post?.id}`}
                        target="_blank"
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "#666", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.8rem", padding: "7px 14px", borderRadius: "8px", textDecoration: "none" }}
                      >
                        <i className="fas fa-eye"></i> View
                      </Link>
                      {activeStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(sub.id)}
                            disabled={isActing}
                            style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.25)", color: "#1e8449", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.8rem", padding: "7px 16px", borderRadius: "8px", cursor: "pointer" }}
                          >
                            {actionLoading === sub.id + "-approve"
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <i className="fas fa-check"></i>}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(sub.id)}
                            disabled={isActing}
                            style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(231,76,60,0.07)", border: "1px solid rgba(231,76,60,0.2)", color: "#c0392b", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.8rem", padding: "7px 16px", borderRadius: "8px", cursor: "pointer" }}
                          >
                            {actionLoading === sub.id + "-reject"
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <i className="fas fa-times"></i>}
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div onClick={() => setShowDeleteConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: "20px", padding: "36px", width: "min(440px,90vw)", zIndex: 1001, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <h5 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: "#0a0a0a", marginBottom: "12px" }}>Delete Publication?</h5>
            <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "28px" }}>
              This will permanently delete <strong>{pub.name}</strong> and all its submission history. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.15)", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.88rem", padding: "10px 22px", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDelete} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.88rem", padding: "10px 24px", borderRadius: "10px", cursor: "pointer" }}>
                <i className="fas fa-trash me-2"></i>Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PublicationDashboard;
