import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { createPublication, updatePublication, getPublication } from "../api/api";
import { toast } from "react-toastify";
import Loading from "./Loading";

function CreatePublication() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [logo, setLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPub, setLoadingPub] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getPublication(id).then(d => {
      const pub = d.publication;
      setName(pub.name ?? "");
      setDescription(pub.description ?? "");
      setCoverImage(pub.coverImage ?? "");
      setLogo(pub.logo ?? "");
      setLoadingPub(false);
    }).catch(() => { toast.error("Could not load publication"); navigate("/publications"); });
  }, [id, isEdit]);

  const uploadToCloudinary = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axios.post("http://localhost:3000/image/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.filepath;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      setter(url);
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.warning("Publication name is required"); return; }
    setSaving(true);
    try {
      const payload = { name, description, coverImage, logo };
      if (isEdit) {
        await updatePublication(id, payload);
        toast.success("Publication updated!");
        navigate(`/publication/${id}`);
      } else {
        const res = await createPublication(payload);
        toast.success("Publication created!");
        navigate(`/publication/${res.publication.id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save publication");
    } finally {
      setSaving(false);
    }
  };

  if (loadingPub) return <Loading />;

  return (
    <div className="page active fade-in" style={{ minHeight: "100vh", background: "#fafafa" }}>
      <div className="container py-5" style={{ maxWidth: "680px" }}>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontFamily: '"Outfit", sans-serif', fontSize: "0.85rem", marginBottom: "32px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>

        <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: "2rem", color: "#0a0a0a", letterSpacing: "-0.02em", marginBottom: "6px" }}>
          {isEdit ? "Edit Publication" : "Create a Publication"}
        </h2>
        <p style={{ color: "#999", marginBottom: "40px", fontSize: "0.95rem" }}>
          {isEdit ? "Update your publication's details." : "Set up your curated space for stories."}
        </p>

        <div className="d-flex flex-column gap-4">

          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#555", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Publication Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Weekly Brief"
              style={{ width: "100%", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "12px", padding: "14px 18px", fontSize: "0.95rem", fontFamily: '"Outfit", sans-serif', outline: "none", transition: "border 0.2s", background: "#fff" }}
              onFocus={e => e.target.style.borderColor = "#0a0a0a"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#555", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this publication about?"
              rows={4}
              style={{ width: "100%", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "12px", padding: "14px 18px", fontSize: "0.92rem", fontFamily: '"Outfit", sans-serif', outline: "none", resize: "vertical", background: "#fff", lineHeight: 1.65 }}
              onFocus={e => e.target.style.borderColor = "#0a0a0a"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"}
            />
          </div>

          {/* Logo */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#555", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Logo (Square Image)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {logo && (
                <img src={logo} alt="logo" style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)" }} />
              )}
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px dashed rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px 20px", cursor: "pointer", fontSize: "0.85rem", color: "#666", fontFamily: '"Outfit", sans-serif', transition: "border-color 0.2s" }}>
                <i className="fas fa-image text-secondary"></i>
                {uploading ? "Uploading…" : "Upload Logo"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, setLogo)} disabled={uploading} />
              </label>
              {logo && <button onClick={() => setLogo("")} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "0.82rem" }}>Remove</button>}
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#555", fontFamily: '"Outfit", sans-serif', textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Cover Image (Wide)
            </label>
            {coverImage ? (
              <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden", marginBottom: "8px" }}>
                <img src={coverImage} alt="cover" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                <button
                  onClick={() => setCoverImage("")}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "6px", color: "#fff", padding: "5px 12px", cursor: "pointer", fontSize: "0.78rem" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", background: "#fff", border: "1px dashed rgba(0,0,0,0.2)", borderRadius: "14px", height: "160px", cursor: "pointer", color: "#bbb", fontSize: "0.88rem", fontFamily: '"Outfit", sans-serif' }}>
                <i className="fas fa-image fa-2x"></i>
                {uploading ? "Uploading…" : "Click to upload cover image"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, setCoverImage)} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              style={{ background: "#0a0a0a", color: "#fff", fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: "0.92rem", padding: "14px 36px", borderRadius: "12px", border: "none", cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
            >
              {saving ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-check"></i>}
              {isEdit ? "Save Changes" : "Create Publication"}
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.15)", color: "#666", fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: "0.88rem", padding: "14px 24px", borderRadius: "12px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePublication;
