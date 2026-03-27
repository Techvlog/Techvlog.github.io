import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../../context/usercontext";
import Loading from "./Loading";
import ErrorPage from "./Eror";

const BlogEditor = () => {
  const { slug: urlSlug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userid, isloggedin } = useContext(UserContext);

  // Editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [slug, setSlug] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [postId, setPostId] = useState(null);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        let data;
        // Try slug endpoint first; fall back to ID endpoint for numeric params
        try {
          const res = await axios.get(`http://localhost:3000/api/post/${urlSlug}`);
          data = res.data;
        } catch (slugErr) {
          if (/^\d+$/.test(urlSlug)) {
            const res = await axios.get(`http://localhost:3000/api/getblog/${urlSlug}`);
            data = res.data;
          } else {
            throw slugErr;
          }
        }
        if (data.post.userId != userid) {
          return navigate("/discover/all");
        }
        setPost(data.post);
        setPostId(data.post.id);
        setTitle(data.post.title);
        setContent(data.post.content);
        setSlug(data.post.slug || "");
        setTags(JSON.parse(data.post.categories).join(", "));
        setFeaturedImage(data.post.headimg || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (isloggedin) {
      fetchPost();
    } else {
      setError("Please log in to edit posts");
      setLoading(false);
    }
  }, [urlSlug, userid, isloggedin]);

  useEffect(() => {
    // Initialize Quill editor only once and when post is loaded
    if (window.Quill && editorRef.current && !quillRef.current && post) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your blog content here...",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
            handlers: {
              image: imageHandler,
            },
          },
        },
      });

      // Set initial content
      quillRef.current.root.innerHTML = content;

      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        setContent(html);
      });
    }
  }, [post]);

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
          const range = quillRef.current.getSelection();
          quillRef.current.insertEmbed(range.index, "image", imageUrl);
          quillRef.current.setSelection(range.index + 1);
        } catch (error) {
          toast.error("Image upload failed");
        }
      }
    };
  };

  const uploadImageToCloudinary = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        "http://localhost:3000/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsUploading(false);
      return response.data.filepath;
    } catch (error) {
      setIsUploading(false);
      toast.error("Error uploading image");
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const imageUrl = await uploadImageToCloudinary(file);
        setFeaturedImage(imageUrl);
      } catch (error) {
        console.error("Featured image upload failed:", error);
      }
    }
  };

  const handleUpdatePost = async () => {
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const updatedPost = {
        title,
        content,
        headimg: featuredImage,
        slug: slug || undefined,
        categories: JSON.stringify(
          tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        ),
      };

      const { data } = await axios.post(
        `http://localhost:3000/api/updateblog/${postId}`,
        updatedPost,
        { withCredentials: true }
      );

      toast.success("Post updated successfully!");
      // Navigate using the (possibly updated) slug
      const newSlug = data.blog?.slug || slug || urlSlug;
      navigate(`/detail/${newSlug}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (!post) {
    return <ErrorPage message="Post not found" />;
  }

  return (
    <div className="blog-editor-container">
      <h2 className="editor-title">Edit Blog Post</h2>

      {/* Featured Image Upload */}
      <div className="form-section">
        <label className="section-label">Featured Image</label>
        <div className="image-upload-container">
          <label className="file-upload-label">
            {isUploading ? "Uploading..." : "Change Image"}
            <input
              type="file"
              onChange={handleImageUpload}
              className="file-upload-input"
              accept="image/*"
              disabled={isUploading}
            />
          </label>
          {featuredImage && (
            <img src={featuredImage} alt="Preview" className="image-preview" />
          )}
        </div>
      </div>

      {/* Title */}
      <div className="form-section">
        <label className="section-label">Post Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
          placeholder="Enter your blog post title..."
        />
      </div>

      {/* Slug */}
      <div className="form-section">
        <label className="section-label">URL Slug</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#999", fontSize: "0.85rem", whiteSpace: "nowrap" }}>/detail/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"))}
            className="title-input"
            placeholder="auto-generated-from-title"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.95rem" }}
          />
        </div>
        <small style={{ color: "#999", fontSize: "0.75rem", marginTop: "6px", display: "block" }}>
          Leave empty to auto-generate from the title. Only lowercase letters, numbers, and hyphens allowed.
        </small>
      </div>

      {/* Tags Input */}
      <div className="form-section">
        <label className="section-label">Post Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="title-input"
          placeholder="Enter comma-separated tags"
        />
        <div className="tags-preview">
          {tags.split(",").map(
            (tag, index) =>
              tag.trim() && (
                <span key={index} className="tag-preview">
                  {tag.trim()}
                </span>
              )
          )}
        </div>
      </div>

      {/* Quill Editor */}
      <div className="form-section">
        <label className="section-label">Post Content</label>
        <div ref={editorRef} className="quill-editor-container" />
      </div>

      {/* Action Buttons */}
      <div className="sticky-footer">
      <button
          onClick={() => navigate(`/detail/${slug || urlSlug}`)}
          className="cancel-button"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdatePost}
          className="update-button"
          disabled={!title || !content || isUploading}
        >
          {isUploading ? "Uploading..." : "Update Post"}
        </button>
      </div>

      {/* Live Preview */}
      <div className="preview-section">
        <h3 className="preview-title">Live Preview</h3>
        <div className="preview-content">
          {featuredImage && (
            <img src={featuredImage} alt="Preview" className="preview-image" />
          )}
          <h1 className="preview-post-title">{title || "Your Post Title"}</h1>
          <div className="preview-tags">
            {tags.split(",").map(
              (tag, index) =>
                tag.trim() && (
                  <span key={index} className="tag-preview">
                    {tag.trim()}
                  </span>
                )
            )}
          </div>
          <div
            className="preview-post-content"
            dangerouslySetInnerHTML={{
              __html: content || "<p>Your content will appear here...</p>",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .blog-editor-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          font-family: 'Inter', sans-serif;
          color: var(--text-primary);
          background-color: transparent;
        }

        .editor-title {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          text-align: center;
          font-weight: 800;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 20px;
          text-shadow: none;
        }

        .form-section {
          margin-bottom: 25px;
          background: #ffffff;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .form-section:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .section-label {
          display: block;
          margin-bottom: 15px;
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .image-upload-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .file-upload-label {
          display: inline-block;
          padding: 12px 24px;
          background: var(--accent-primary);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .file-upload-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .file-upload-input {
          display: none;
        }

        .image-preview {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .title-input {
          width: 100%;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: #ffffff;
          color: var(--text-primary);
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .title-input:focus {
          border-color: var(--accent-primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
          background: #ffffff;
        }

        .quill-editor-container {
          height: 500px;
          margin-bottom: 40px;
          background-color: #ffffff;
          border-radius: 0 0 8px 8px;
          border: 1px solid var(--glass-border);
          border-top: none;
          color: var(--text-primary);
        }

        :global(.ql-toolbar.ql-snow) {
          background: #f8f9fa;
          border: 1px solid var(--glass-border);
          border-radius: 8px 8px 0 0;
        }

        :global(.ql-snow .ql-stroke) {
          stroke: var(--text-primary);
        }

        :global(.ql-snow .ql-fill), :global(.ql-snow .ql-stroke.ql-fill) {
          fill: var(--text-primary);
        }

        :global(.ql-snow .ql-picker) {
          color: #e2e8f0;
        }

        :global(.ql-snow .ql-picker-options) {
          background-color: #1e293b;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .sticky-footer {
          position: sticky;
          bottom: 20px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 100;
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .update-button {
          padding: 14px 40px;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .update-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        }

        .update-button:disabled {
          background: #475569;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .cancel-button {
          padding: 14px 32px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .cancel-button:hover {
          background: #f8f9fa;
          border-color: var(--glass-border);
          transform: translateY(-2px);
        }

        .preview-section {
          margin-top: 50px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 30px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .preview-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
        }

        .preview-content {
          padding: 25px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        .preview-image {
          max-width: 100%;
          max-height: 400px;
          margin-bottom: 25px;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .preview-post-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.8rem;
          margin-bottom: 1.5rem;
          color: white;
          line-height: 1.2;
        }

        .preview-tags,
        .tags-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag-preview {
          background: #f8f9fa;
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          display: inline-block;
        }

        .preview-post-content {
          line-height: 1.8;
          font-size: 1.1rem;
          color: #e2e8f0;
        }

        .preview-post-content blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 15px;
          margin-left: 0;
          color: #94a3b8;
          font-style: italic;
          background: rgba(255, 255, 255, 0.02);
          padding: 15px;
          border-radius: 0 8px 8px 0;
        }

        @media (max-width: 768px) {
          .blog-editor-container {
            padding: 15px;
          }

          .editor-title {
            font-size: 2rem;
          }

          .form-section {
            padding: 15px;
          }

          .quill-editor-container {
            height: 400px;
          }

          .preview-post-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogEditor;
