import React, { useEffect, useRef, useState } from "react";
import { useMakepost } from "../../hooks/hooks";
import { UserContext } from "../../context/usercontext";
import { useContext } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .mw-root * { box-sizing: border-box; }

  .mw-root {
    min-height: 100vh;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Main canvas ── */
  .mw-main {
    max-width: 740px;
    margin: 0 auto;
    padding: 48px 32px 120px 80px;
  }

  /* ── Title row with publish button ── */
  .mw-title-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .mw-title-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: 'Lora', serif;
    font-size: 40px;
    font-weight: 700;
    color: #0a0a0a;
    line-height: 1.2;
    letter-spacing: -0.02em;
    padding: 0 0 16px 0;
    resize: none;
    overflow: hidden;
    background: transparent;
    caret-color: #1a8917;
    display: block;
  }
  .mw-title-input::placeholder { color: #ddd; }

  /* ── Publish button ── */
  .mw-publish-btn {
    flex-shrink: 0;
    margin-top: 6px;
    background: #1a8917 !important;
    color: #fff !important;
    border: none !important;
    border-radius: 99px !important;
    padding: 8px 22px !important;
    font-size: 14px !important;
    font-family: 'DM Sans', sans-serif !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    white-space: nowrap;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    transition: background 0.15s !important;
  }
  .mw-publish-btn:hover { background: #156812 !important; }
  .mw-publish-btn:disabled { opacity: 0.6 !important; cursor: not-allowed !important; }

  /* ── Tags ── */
  .mw-tags-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 0 18px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    flex-wrap: wrap;
    min-height: 44px;
  }

  .mw-tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(26,137,23,0.07);
    border: 1px solid rgba(26,137,23,0.15);
    border-radius: 3px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #1a8917;
  }
  .mw-tag-pill-remove {
    background: none; border: none; cursor: pointer;
    color: rgba(26,137,23,0.5); font-size: 15px; line-height: 1; padding: 0;
  }
  .mw-tag-pill-remove:hover { color: #1a8917; }

  .mw-tag-input {
    border: none; outline: none;
    font-size: 13px; font-weight: 300; color: #555;
    background: transparent; min-width: 200px; flex: 1;
  }
  .mw-tag-input::placeholder { color: #ccc; }

  /* ── Content row ── */
  .mw-content-row {
    position: relative;
    padding-top: 24px;
  }

  .mw-plus-btn {
    position: absolute;
    left: -52px; top: 28px;
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.18);
    background: #fff;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #aaa; font-size: 22px; line-height: 1;
    transition: border-color 0.15s, color 0.15s, transform 0.2s;
    z-index: 10;
  }
  .mw-plus-btn:hover { border-color: #1a8917; color: #1a8917; }
  .mw-plus-btn.open { transform: rotate(45deg); border-color: #1a8917; color: #1a8917; }

  /* ── Floating toolbar ── */
  .mw-float-toolbar {
    position: absolute;
    left: -46px; top: 68px;
    display: flex; align-items: center; gap: 4px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 99px;
    padding: 5px 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    z-index: 50;
    animation: tbFadeIn 0.12s ease;
  }
  @keyframes tbFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mw-float-toolbar button {
    background: none; border: none; cursor: pointer; color: #888;
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 50%;
    transition: background 0.1s, color 0.1s;
  }
  .mw-float-toolbar button:hover { background: rgba(26,137,23,0.07); color: #1a8917; }

  /* ── Quill ── */
  .mw-root .ql-toolbar { display: none !important; }
  .mw-root .ql-container {
    border: none !important;
    font-family: 'Lora', serif !important;
    font-size: 20px !important;
    line-height: 1.85 !important;
  }
  .mw-root .ql-editor {
    padding: 0 !important;
    min-height: 50vh;
    font-family: 'Lora', serif !important;
    font-size: 20px !important;
    line-height: 1.85 !important;
    color: #1a1a1a;
    caret-color: #1a8917;
  }
  .mw-root .ql-editor.ql-blank::before {
    color: #ddd !important;
    font-style: italic !important;
    font-family: 'Lora', serif;
    font-size: 20px;
    left: 0 !important;
  }
  .mw-root .ql-editor blockquote {
    border-left: 3px solid #1a8917;
    padding-left: 1em; color: #666;
    font-style: italic; margin: 1.2em 0;
  }
  .mw-root .ql-editor pre {
    background: #f6f6f6; border-radius: 4px;
    padding: 1em; font-size: 0.85em; overflow-x: auto;
  }

  /* ── Featured image ── */
  .mw-feat-section {
    margin-top: 48px; padding-top: 32px;
    border-top: 1px solid rgba(0,0,0,0.06);
  }
  .mw-feat-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: #bbb; margin-bottom: 12px;
  }
  .mw-feat-label span { font-weight: 400; text-transform: none; letter-spacing: 0; color: #ddd; }
  .mw-feat-drop {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px;
    border: 1.5px dashed rgba(0,0,0,0.1); border-radius: 5px;
    cursor: pointer; background: #fafafa; transition: border-color 0.15s;
  }
  .mw-feat-drop:hover { border-color: rgba(26,137,23,0.35); }
  .mw-feat-drop-text { font-size: 13px; font-weight: 300; color: #bbb; }
  .mw-feat-img-wrap { position: relative; }
  .mw-feat-img {
    width: 100%; max-height: 220px; object-fit: cover;
    border-radius: 5px; display: block; border: 1px solid rgba(0,0,0,0.07);
  }
  .mw-feat-remove {
    position: absolute; top: 8px; right: 8px;
    background: rgba(0,0,0,0.55); color: #fff;
    border: none; border-radius: 3px; padding: 4px 12px;
    font-size: 11px; cursor: pointer;
  }

  /* ── Status bar ── */
  .mw-statusbar {
    position: fixed;
    bottom: 0; left: 0; right: 0; height: 40px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(0,0,0,0.06);
    display: flex; align-items: center; justify-content: center;
    font-size: 11.5px; color: #ccc; letter-spacing: 0.03em;
    z-index: 100;
  }

  /* ── Responsive: Newpost Editor ─────────────────────────── */
  @media (max-width: 768px) {
    .mw-main {
      padding: 24px 16px 100px 16px !important;
    }
    .mw-title-input {
      font-size: 26px !important;
    }
    .mw-title-row {
      flex-direction: column;
      gap: 12px;
    }
    .mw-publish-btn {
      width: 100% !important;
      text-align: center;
    }
    .mw-plus-btn {
      left: -8px !important;
      top: 20px !important;
      width: 28px !important;
      height: 28px !important;
      font-size: 18px !important;
    }
    .mw-float-toolbar {
      left: -4px !important;
      top: 56px !important;
    }
    .mw-root .ql-editor,
    .mw-root .ql-container {
      font-size: 16px !important;
    }
    .mw-root .ql-editor.ql-blank::before {
      font-size: 16px !important;
    }
  }

  @media (max-width: 480px) {
    .mw-title-input {
      font-size: 22px !important;
    }
    .mw-tags-row {
      padding: 8px 0 12px;
    }
    .mw-tag-input {
      min-width: 120px !important;
    }
    .mw-feat-section {
      margin-top: 24px !important;
      padding-top: 16px !important;
    }
  }
`;

function BlogWriter() {
  const [featuredImage, setFeaturedImage] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [slug, setSlug] = useState("");
  const [showSlugEditor, setShowSlugEditor] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const titleRef = useRef(null);
  const toolbarWrapRef = useRef(null);

  const { mutate, isPending, isSuccess, error, data } = useMakepost();
  const { userid } = useContext(UserContext);
  const navigate = useNavigate();

  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  };

  useEffect(() => {
    if (window.Quill && editorRef.current && !quillRef.current) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Tell your story...",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline"],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
            handlers: { image: imageHandler },
          },
        },
      });

      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        const text = quillRef.current.getText().trim();
        setContent(html);
        setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
      });
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (toolbarWrapRef.current && !toolbarWrapRef.current.contains(e.target)) {
        setShowToolbar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const imageUrl = await uploadImageToCloudinary(file);
          const range = quillRef.current.getSelection() || { index: 0 };
          quillRef.current.insertEmbed(range.index, "image", imageUrl);
          quillRef.current.setSelection(range.index + 1);
        } catch {
          toast.error("Image upload failed", { position: "top-right", autoClose: 5000 });
        }
      }
    };
  };

  const uploadImageToCloudinary = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(`${API_URL}/image/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsUploading(false);
      return response.data.filepath;
    } catch (err) {
      setIsUploading(false);
      toast.error("Error uploading image", { position: "top-right", autoClose: 5000 });
      throw err;
    }
  };

  const handleFeaturedUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImageToCloudinary(file);
      setFeaturedImage(url);
    } catch {}
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,+$/, "");
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handlePost = () => {
    const postData = { title, content, featuredImage, tags, slug: slug || undefined };
    mutate({ id: userid, post: postData });
    if (error) toast.error(error.message, { position: "top-right", autoClose: 5000 });
  };

  useEffect(() => {
    if (data) {
      toast.success("Post published!", { position: "top-right", autoClose: 5000 });
      // Navigate to the new post using its slug
      const newSlug = data?.data?.post?.slug;
      if (newSlug) {
        navigate(`/detail/${newSlug}`);
      } else {
        navigate("/after");
      }
    }
  }, [isSuccess, data]);

  const insertQuillFormat = (format, value = true) => {
    if (!quillRef.current) return;
    quillRef.current.focus();
    quillRef.current.getSelection(true);
    quillRef.current.format(format, value);
    setShowToolbar(false);
  };

  const insertImage = () => { imageHandler(); setShowToolbar(false); };

  return (
    <>
      <style>{styles}</style>
      <div className="mw-root">
        <div className="mw-main">

          {/* Title + Publish on same row */}
          <div className="mw-title-row">
            <textarea
              ref={titleRef}
              className="mw-title-input"
              placeholder="Title"
              value={title}
              rows={1}
              onChange={(e) => {
                setTitle(e.target.value);
                autoResize(e.target);
                // Auto-update slug only if user hasn't manually edited it
                if (!showSlugEditor) {
                  setSlug(generateSlug(e.target.value));
                }
              }}
            />
            <button className="mw-publish-btn" onClick={handlePost} disabled={isPending}>
              {isPending ? "Publishing…" : "Publish"}
            </button>
          </div>

          {/* Tags */}
          <div className="mw-tags-row">
            {tags.map((tag) => (
              <span key={tag} className="mw-tag-pill">
                {tag}
                <button className="mw-tag-pill-remove" onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
            <input
              className="mw-tag-input"
              placeholder={tags.length === 0 ? "Add tags — press Enter or comma" : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>

          {/* Slug editor (collapsible) */}
          <div style={{ paddingBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              type="button"
              onClick={() => setShowSlugEditor(v => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "11px", fontWeight: 500, color: "#999",
                padding: "4px 0", display: "flex", alignItems: "center", gap: "4px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span style={{ transform: showSlugEditor ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", display: "inline-block" }}>▸</span>
              {showSlugEditor ? "Hide URL slug" : "Customize URL slug"}
            </button>
            {showSlugEditor && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                <span style={{ color: "#bbb", fontSize: "12px", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>/detail/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"))}
                  placeholder="auto-generated-from-title"
                  style={{
                    border: "none", outline: "none", borderBottom: "1px solid rgba(0,0,0,0.1)",
                    fontSize: "12px", fontFamily: "monospace", color: "#555",
                    padding: "4px 2px", flex: 1, background: "transparent",
                  }}
                />
              </div>
            )}
          </div>

          {/* Body + floating + */}
          <div className="mw-content-row" ref={toolbarWrapRef}>
            <button
              className={`mw-plus-btn${showToolbar ? " open" : ""}`}
              onClick={() => setShowToolbar(v => !v)}
              title="Insert"
            >
              +
            </button>

            {showToolbar && (
              <div className="mw-float-toolbar">
                <button title="Image" onClick={insertImage}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>
                <button title="Blockquote" onClick={() => insertQuillFormat("blockquote")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                  </svg>
                </button>
                <button title="Code block" onClick={() => insertQuillFormat("code-block")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                </button>
                <button title="Heading" onClick={() => insertQuillFormat("header", 2)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16M4 12h16M4 18h8"/>
                  </svg>
                </button>
                <button title="Divider" onClick={() => {
                  const range = quillRef.current?.getSelection(true) || { index: 0 };
                  quillRef.current?.insertText(range.index, "\n――――――――――\n");
                  setShowToolbar(false);
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                  </svg>
                </button>
              </div>
            )}

            <div style={{ width: "100%" }}>
              <div ref={editorRef} />
            </div>
          </div>

          {/* Featured image */}
          <div className="mw-feat-section">
            <div className="mw-feat-label">Featured Image <span>— optional</span></div>
            {featuredImage ? (
              <div className="mw-feat-img-wrap">
                <img src={featuredImage} alt="Featured" className="mw-feat-img" />
                <button className="mw-feat-remove" onClick={() => setFeaturedImage(null)}>Remove</button>
              </div>
            ) : (
              <label className="mw-feat-drop">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="mw-feat-drop-text">{isUploading ? "Uploading…" : "Click to add a featured image"}</span>
                <input type="file" accept="image/*" onChange={handleFeaturedUpload} disabled={isUploading} style={{ display: "none" }} />
              </label>
            )}
          </div>

        </div>

        {/* Status bar */}
        <div className="mw-statusbar">
          {isUploading ? "Uploading image…" : `${wordCount} word${wordCount !== 1 ? "s" : ""} · Publish when ready`}
        </div>

      </div>
    </>
  );
}

export default BlogWriter;