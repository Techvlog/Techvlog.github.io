import React, { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { profile, submitPostToPublication, listPublications } from "../api/api";
import { UserContext } from "../../context/usercontext";
import { toast } from "react-toastify";

/**
 * Two modes:
 *  1. publicationId given  → user picks one of THEIR posts to submit
 *  2. postIdOverride given → user picks a publication to submit TO
 */
function SubmitToPublicationModal({ publicationId, publicationName, postIdOverride, onClose }) {
  const { isloggedin } = useContext(UserContext);
  const [selectedId, setSelectedId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mode = postIdOverride ? "pick-pub" : "pick-post";

  // Mode 1: fetch user's posts
  const { data: profileData, isLoading: postsLoading } = useQuery({
    queryKey: ["profile-for-submit"],
    queryFn: () => profile(1, 50),
    enabled: isloggedin && mode === "pick-post",
  });

  // Mode 2: fetch all publications
  const { data: pubsData, isLoading: pubsLoading } = useQuery({
    queryKey: ["publications-for-submit"],
    queryFn: () => listPublications(1, 50),
    enabled: mode === "pick-pub",
  });

  const posts = profileData?.posts ?? [];
  const pubs  = pubsData?.publications ?? [];
  const isLoading = mode === "pick-post" ? postsLoading : pubsLoading;
  const items = mode === "pick-post" ? posts : pubs;

  const handleSubmit = async () => {
    if (!selectedId) { toast.warning("Please make a selection"); return; }
    setSubmitting(true);
    try {
      const pubId  = mode === "pick-post" ? publicationId : parseInt(selectedId);
      const postId = mode === "pick-post" ? parseInt(selectedId) : postIdOverride;
      await submitPostToPublication(pubId, postId);
      const targetName = mode === "pick-post"
        ? publicationName
        : pubs.find(p => String(p.id) === selectedId)?.name;
      toast.success(`Post submitted to "${targetName}" for review!`, { autoClose: 4000 });
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally { setSubmitting(false); }
  };

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const renderItem = (item) =>
    mode === "pick-post" ? (
      <>
        <img
          src={item.headimg || "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg"}
          alt={item.title}
          style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
        />
        <div style={{ overflow: "hidden" }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#0a0a0a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
          <p style={{ fontSize: "0.75rem", color: "#aaa", margin: 0 }}>{new Date(item.updatedAt).toLocaleDateString()}</p>
        </div>
      </>
    ) : (
      <>
        <img
          src={item.logo || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
          alt={item.name}
          style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }}
        />
        <div style={{ overflow: "hidden" }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#0a0a0a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
          <p style={{ fontSize: "0.75rem", color: "#aaa", margin: 0 }}>{item.followersCount ?? 0} followers</p>
        </div>
      </>
    );

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 1000 }}
      />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(520px,95vw)", background: "#fff", borderRadius: "24px", padding: "36px", zIndex: 1001, boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", fontFamily: '"Outfit", sans-serif', marginBottom: "4px" }}>
              Submit for review
            </p>
            <h4 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: "#0a0a0a", fontSize: "1.4rem", margin: 0 }}>
              {mode === "pick-post" ? publicationName : "Publish to a Publication"}
            </h4>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "1rem", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ×
          </button>
        </div>

        {/* Info banner */}
        <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "0.83rem", color: "#666", lineHeight: 1.6 }}>
          <i className="fas fa-info-circle me-2" style={{ color: "#aaa" }}></i>
          Your post will be reviewed by the publication owner before it appears publicly.
        </div>

        {/* Selector label */}
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#555", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          {mode === "pick-post" ? "Choose a post to submit" : "Choose a publication"}
        </label>

        {/* Item list */}
        {isLoading ? (
          <div className="text-center py-3">
            <span className="spinner-border spinner-border-sm text-secondary"></span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#aaa", fontSize: "0.9rem" }}>
            {mode === "pick-post" ? "You haven't written any posts yet." : "No publications available."}
          </div>
        ) : (
          <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "14px", maxHeight: "260px", overflowY: "auto", marginBottom: "24px" }}>
            {items.map((item) => (
              <label
                key={item.id}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.05)", background: selectedId === String(item.id) ? "rgba(0,0,0,0.03)" : "transparent", transition: "background 0.15s" }}
              >
                <input
                  type="radio"
                  name="modal-select"
                  value={item.id}
                  checked={selectedId === String(item.id)}
                  onChange={() => setSelectedId(String(item.id))}
                  style={{ accentColor: "#0a0a0a", width: "16px", height: "16px", flexShrink: 0 }}
                />
                {renderItem(item)}
              </label>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.15)", color: "#555", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.88rem", padding: "10px 22px", borderRadius: "10px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedId}
            style={{ background: "#0a0a0a", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.88rem", padding: "10px 28px", borderRadius: "10px", border: "none", cursor: submitting || !selectedId ? "not-allowed" : "pointer", opacity: !selectedId ? 0.5 : 1, display: "flex", alignItems: "center", gap: "8px" }}
          >
            {submitting ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-paper-plane"></i>}
            Submit for Review
          </button>
        </div>
      </div>
    </>
  );
}

export default SubmitToPublicationModal;
