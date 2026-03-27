import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  myPublications,
  mySubmissions,
  myFollowing,
  allPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  unfollowPublication,
} from "../api/api";
import { UserContext } from "../../context/usercontext";
import Loading from "./Loading";
import { toast } from "react-toastify";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PLACEHOLDER_IMG =
  "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg";
const PLACEHOLDER_AVT =
  "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

const statusMeta = {
  pending:  { bg: "rgba(255,193,7,0.12)",  text: "#92670f", icon: "fa-clock",        label: "Pending Review" },
  approved: { bg: "rgba(39,174,96,0.12)",  text: "#1a6b3e", icon: "fa-check-circle", label: "Approved" },
  rejected: { bg: "rgba(231,76,60,0.12)",  text: "#b03a2e", icon: "fa-times-circle",  label: "Rejected" },
};

// ─── Reusable empty-state ─────────────────────────────────────────────────────
const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ textAlign: "center", padding: "52px 20px", background: "#fff", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)" }}>
    <i className={`fas ${icon} fa-3x mb-4 d-block`} style={{ color: "#ddd" }}></i>
    <h5 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", marginBottom: "8px" }}>{title}</h5>
    <p style={{ color: "#aaa", fontSize: "0.9rem", maxWidth: "340px", margin: "0 auto 24px" }}>{sub}</p>
    {action}
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = statusMeta[status] || statusMeta.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: m.bg, color: m.text, fontSize: "0.72rem", fontWeight: 700, fontFamily: '"Outfit", sans-serif', letterSpacing: "0.05em", padding: "4px 12px", borderRadius: "99px", textTransform: "uppercase" }}>
      <i className={`fas ${m.icon}`}></i> {m.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyPublicationsPage() {
  const { name, avatar } = useContext(UserContext);
  const [tab, setTab] = useState("owned");
  const [noteInputs, setNoteInputs] = useState({});
  const [acting, setActing] = useState(null);
  const [expandedPub, setExpandedPub] = useState(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: ownedData,   isLoading: l1 } = useQuery({ queryKey: ["my-pubs"],      queryFn: myPublications,        enabled: tab === "owned" });
  const { data: followData,  isLoading: l2 } = useQuery({ queryKey: ["my-following"], queryFn: myFollowing,           enabled: tab === "following" });
  const { data: subData,     isLoading: l3 } = useQuery({ queryKey: ["my-subs"],      queryFn: mySubmissions,         enabled: tab === "submissions" });
  const { data: pendingData, isLoading: l4, refetch: refetchPending } = useQuery({ queryKey: ["all-pending"], queryFn: allPendingSubmissions, enabled: tab === "owned" });

  const pubs       = ownedData?.publications ?? [];
  const following  = followData?.publications ?? [];
  const subs       = subData?.submissions ?? [];
  const allPending = pendingData?.submissions ?? [];

  // ─── Approve / Reject ──────────────────────────────────────────────────────
  const handleApprove = async (pubId, subId) => {
    setActing(subId + "-a");
    try {
      await approveSubmission(pubId, subId, noteInputs[subId] || "");
      toast.success("Submission approved — post is now live!");
      qc.invalidateQueries(["all-pending"]);
      refetchPending();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setActing(null); }
  };

  const handleReject = async (pubId, subId) => {
    setActing(subId + "-r");
    try {
      await rejectSubmission(pubId, subId, noteInputs[subId] || "");
      toast.info("Submission rejected.");
      qc.invalidateQueries(["all-pending"]);
      refetchPending();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setActing(null); }
  };

  // ─── Unfollow ──────────────────────────────────────────────────────────────
  const handleUnfollow = async (pubId) => {
    try {
      await unfollowPublication(pubId);
      toast.info("Unfollowed publication.");
      qc.invalidateQueries(["my-following"]);
    } catch { toast.error("Failed to unfollow"); }
  };

  const tabs = [
    { key: "owned",       icon: "fa-book",          label: "My Publications" },
    { key: "following",   icon: "fa-rss",            label: "Following" },
    { key: "submissions", icon: "fa-paper-plane",    label: "My Submissions" },
  ];

  const isLoading = (tab === "owned" && (l1 || l4)) || (tab === "following" && l2) || (tab === "submissions" && l3);

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "#fafafa" }}>
      <div className="container py-5">
        <div className="row">

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="col-lg-3 mb-4">
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px 20px", border: "1px solid rgba(0,0,0,0.07)", position: "sticky", top: "80px" }}>
              {/* User info */}
              <div style={{ textAlign: "center", marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <img src={avatar || PLACEHOLDER_AVT} alt={name} style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: "3px solid #f0f0f0", marginBottom: "12px" }} />
                <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", margin: "0 0 2px", fontSize: "1rem" }}>{name}</p>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: "0.78rem", color: "#bbb", margin: 0 }}>@{name?.toLowerCase().replace(/\s+/g, "")}</p>
              </div>

              {/* Nav */}
              <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "11px 16px", borderRadius: "12px", border: "none",
                      background: tab === t.key ? "#0a0a0a" : "transparent",
                      color: tab === t.key ? "#fff" : "#666",
                      fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.88rem",
                      cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                    }}
                  >
                    <i className={`fas ${t.icon}`} style={{ width: "18px", fontSize: "0.85rem" }}></i>
                    {t.label}
                    {t.key === "owned" && allPending.length > 0 && (
                      <span style={{ marginLeft: "auto", background: "#e74c3c", color: "#fff", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 800, padding: "2px 7px" }}>
                        {allPending.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick actions */}
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                  to="/publications/create"
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0a0a0a, #333)", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.85rem", padding: "11px 16px", borderRadius: "12px", textDecoration: "none", justifyContent: "center" }}
                >
                  <i className="fas fa-plus"></i> New Publication
                </Link>
                <Link
                  to="/publications"
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", color: "#666", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.85rem", padding: "11px 16px", borderRadius: "12px", textDecoration: "none", justifyContent: "center" }}
                >
                  <i className="fas fa-globe"></i> Browse All
                </Link>
              </div>
            </div>
          </div>

          {/* ── Main Panel ──────────────────────────────────────────────────── */}
          <div className="col-lg-9">
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: "#0a0a0a", fontSize: "1.75rem", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                {tabs.find(t => t.key === tab)?.label}
              </h2>
              <p style={{ color: "#aaa", fontSize: "0.88rem", margin: 0, fontFamily: '"Outfit", sans-serif' }}>
                {tab === "owned" && "Manage publications you created and review submitted posts."}
                {tab === "following" && "Publications you're subscribed to."}
                {tab === "submissions" && "Track the status of posts you've submitted to publications."}
              </p>
            </div>

            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
                <span className="spinner-border text-secondary"></span>
              </div>
            ) : (
              <>
                {/* ── TAB: My Publications (owned) ─────────────────────────── */}
                {tab === "owned" && (
                  <div>
                    {/* Pending submissions notification bar */}
                    {allPending.length > 0 && (
                      <div style={{ background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.25)", borderRadius: "16px", padding: "18px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,193,7,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fas fa-inbox" style={{ color: "#92670f", fontSize: "1rem" }}></i>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#92670f", fontSize: "0.9rem" }}>
                              {allPending.length} pending submission{allPending.length > 1 ? "s" : ""} waiting for review
                            </p>
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "#b8860b" }}>Review them below to approve or reject</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {pubs.length === 0 ? (
                      <EmptyState
                        icon="fa-book"
                        title="No publications yet"
                        sub="Create your first publication and invite writers to submit their stories."
                        action={
                          <Link to="/publications/create" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0a0a0a", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.88rem", padding: "12px 28px", borderRadius: "12px", textDecoration: "none" }}>
                            <i className="fas fa-plus"></i> Create Publication
                          </Link>
                        }
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {pubs.map(pub => {
                          const pubPending = allPending.filter(s => s.publicationId === pub.id);
                          const isExpanded = expandedPub === pub.id;
                          return (
                            <div key={pub.id} style={{ background: "#fff", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden" }}>
                              {/* Publication header row */}
                              <div style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                                <img
                                  src={pub.logo || PLACEHOLDER_AVT}
                                  alt={pub.name}
                                  style={{ width: "56px", height: "56px", borderRadius: "14px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}
                                />
                                <div style={{ flexGrow: 1, minWidth: "160px" }}>
                                  <h5 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: "#0a0a0a", margin: "0 0 4px", fontSize: "1.1rem" }}>{pub.name}</h5>
                                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "0.78rem", color: "#aaa", fontFamily: '"Outfit", sans-serif' }}>
                                      <i className="fas fa-users me-1"></i>{pub.followersCount ?? 0} followers
                                    </span>
                                    {pubPending.length > 0 && (
                                      <span style={{ fontSize: "0.78rem", color: "#e74c3c", fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                                        <i className="fas fa-clock me-1"></i>{pubPending.length} pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  <Link to={`/publication/${pub.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.8rem", padding: "7px 14px", borderRadius: "8px", textDecoration: "none" }}>
                                    <i className="fas fa-eye"></i> View
                                  </Link>
                                  <Link to={`/publication/${pub.id}/edit`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.8rem", padding: "7px 14px", borderRadius: "8px", textDecoration: "none" }}>
                                    <i className="fas fa-edit"></i> Edit
                                  </Link>
                                  {pubPending.length > 0 && (
                                    <button
                                      onClick={() => setExpandedPub(isExpanded ? null : pub.id)}
                                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: isExpanded ? "#0a0a0a" : "rgba(231,76,60,0.08)", border: isExpanded ? "none" : "1px solid rgba(231,76,60,0.2)", color: isExpanded ? "#fff" : "#c0392b", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.8rem", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}
                                    >
                                      <i className={`fas ${isExpanded ? "fa-chevron-up" : "fa-inbox"}`}></i>
                                      Review {pubPending.length}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Expandable submissions panel */}
                              {isExpanded && pubPending.length > 0 && (
                                <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                                  <div style={{ padding: "12px 24px 8px", background: "#fafafa" }}>
                                    <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: "0.75rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                                      Pending Submissions
                                    </p>
                                  </div>
                                  {pubPending.map(sub => (
                                    <div key={sub.id} style={{ padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap", background: "#fff" }}>
                                      <img
                                        src={sub.Post?.headimg || PLACEHOLDER_IMG}
                                        alt={sub.Post?.title}
                                        style={{ width: "72px", height: "52px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                                      />
                                      <div style={{ flexGrow: 1, minWidth: "180px" }}>
                                        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", fontSize: "0.92rem", margin: "0 0 4px" }}>
                                          {sub.Post?.title || "Untitled"}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <img src={sub.Submitter?.avatar || PLACEHOLDER_AVT} alt="" style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover" }} />
                                          <span style={{ fontSize: "0.76rem", color: "#aaa", fontFamily: '"Outfit", sans-serif' }}>by {sub.Submitter?.firstName}</span>
                                          <span style={{ fontSize: "0.76rem", color: "#ccc" }}>·</span>
                                          <span style={{ fontSize: "0.76rem", color: "#ccc" }}>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <input
                                          type="text"
                                          placeholder="Optional note for the writer…"
                                          value={noteInputs[sub.id] || ""}
                                          onChange={e => setNoteInputs(p => ({ ...p, [sub.id]: e.target.value }))}
                                          style={{ marginTop: "8px", width: "100%", maxWidth: "340px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.8rem", fontFamily: '"Outfit", sans-serif', outline: "none", background: "#fafafa" }}
                                        />
                                      </div>
                                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                        <Link to={`/detail/${sub.Post?.slug || sub.Post?.id}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", color: "#888", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.78rem", padding: "7px 12px", borderRadius: "8px", textDecoration: "none" }}>
                                          <i className="fas fa-eye"></i> Read
                                        </Link>
                                        <button
                                          onClick={() => handleApprove(pub.id, sub.id)}
                                          disabled={acting === sub.id + "-a"}
                                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", color: "#1a6b3e", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.78rem", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}
                                        >
                                          {acting === sub.id + "-a" ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-check"></i>}
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleReject(pub.id, sub.id)}
                                          disabled={acting === sub.id + "-r"}
                                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.2)", color: "#b03a2e", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.78rem", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}
                                        >
                                          {acting === sub.id + "-r" ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-times"></i>}
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB: Following ───────────────────────────────────────── */}
                {tab === "following" && (
                  following.length === 0 ? (
                    <EmptyState
                      icon="fa-rss"
                      title="Not following any publications"
                      sub="Discover and follow publications to see their stories in one place."
                      action={
                        <Link to="/publications" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0a0a0a", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.88rem", padding: "12px 28px", borderRadius: "12px", textDecoration: "none" }}>
                          <i className="fas fa-globe"></i> Discover Publications
                        </Link>
                      }
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {following.map(pub => (
                        <div key={pub.id} style={{ background: "#fff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.07)", padding: "18px 22px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                          <Link to={`/publication/${pub.id}`} style={{ display: "flex", alignItems: "center", gap: "14px", flexGrow: 1, minWidth: "200px", textDecoration: "none" }}>
                            <img src={pub.logo || PLACEHOLDER_AVT} alt={pub.name} style={{ width: "50px", height: "50px", borderRadius: "12px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.07)", flexShrink: 0 }} />
                            <div>
                              <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: "#0a0a0a", fontSize: "1rem", margin: "0 0 3px" }}>{pub.name}</p>
                              <p style={{ fontSize: "0.8rem", color: "#aaa", margin: 0, fontFamily: '"Outfit", sans-serif' }}>
                                <i className="fas fa-users me-1"></i>{pub.followersCount ?? 0} followers
                                {pub.Owner && <span> · by {pub.Owner.firstName}</span>}
                              </p>
                            </div>
                          </Link>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <Link to={`/publication/${pub.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.8rem", padding: "7px 14px", borderRadius: "8px", textDecoration: "none" }}>
                              <i className="fas fa-eye"></i> Visit
                            </Link>
                            <button
                              onClick={() => handleUnfollow(pub.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid rgba(231,76,60,0.2)", color: "#c0392b", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.8rem", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}
                            >
                              <i className="fas fa-times"></i> Unfollow
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* ── TAB: My Submissions ──────────────────────────────────── */}
                {tab === "submissions" && (
                  subs.length === 0 ? (
                    <EmptyState
                      icon="fa-paper-plane"
                      title="No submissions yet"
                      sub="Submit your posts to publications for a chance to get featured and reach a wider audience."
                      action={
                        <Link to="/publications" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0a0a0a", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.88rem", padding: "12px 28px", borderRadius: "12px", textDecoration: "none" }}>
                          <i className="fas fa-globe"></i> Find Publications
                        </Link>
                      }
                    />
                  ) : (
                    <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden" }}>
                      {/* Table header */}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr", gap: "12px", padding: "14px 24px", background: "#fafafa", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {["Post", "Publication", "Status", "Submitted"].map(h => (
                          <span key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#bbb", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                        ))}
                      </div>

                      {subs.map((sub, i) => {
                        const m = statusMeta[sub.status] || statusMeta.pending;
                        return (
                          <div
                            key={sub.id}
                            style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr", gap: "12px", padding: "18px 24px", borderBottom: i < subs.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", alignItems: "center" }}
                          >
                            {/* Post */}
                            <Link to={`/detail/${sub.Post?.slug || sub.Post?.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", minWidth: 0 }}>
                              <img src={sub.Post?.headimg || PLACEHOLDER_IMG} alt="" style={{ width: "48px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                              <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: "#0a0a0a", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {sub.Post?.title || "—"}
                              </span>
                            </Link>

                            {/* Publication */}
                            <Link to={`/publication/${sub.Publication?.id}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", minWidth: 0 }}>
                              <img src={sub.Publication?.logo || PLACEHOLDER_AVT} alt="" style={{ width: "26px", height: "26px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                              <span style={{ fontSize: "0.82rem", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {sub.Publication?.name || "—"}
                              </span>
                            </Link>

                            {/* Status */}
                            <div>
                              <StatusBadge status={sub.status} />
                              {sub.reviewNote && (
                                <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#aaa", fontStyle: "italic", lineHeight: 1.4 }} title={sub.reviewNote}>
                                  "{sub.reviewNote.length > 40 ? sub.reviewNote.slice(0, 40) + "…" : sub.reviewNote}"
                                </p>
                              )}
                            </div>

                            {/* Date */}
                            <span style={{ fontSize: "0.78rem", color: "#bbb", fontFamily: '"Outfit", sans-serif' }}>
                              {new Date(sub.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
