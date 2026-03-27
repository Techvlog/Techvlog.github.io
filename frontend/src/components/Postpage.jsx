import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "./Eror";
import Loading from "./Loading";
import { UserContext } from "../../context/usercontext";
import { useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/blogdetails.css";
import SignInModal from "./request";
import { Link } from "react-router-dom";
import { followUser, unfollowUser, checkFollow, fetchComments, saveBlogPost, unsaveBlogPost, checkSavedPost } from "../api/api";
import SubmitToPublicationModal from "./SubmitToPublicationModal";

// ── safe category parser (handles Postgres arrays + JSON strings + csv) ───────
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
// ─────────────────────────────────────────────────────────────────────────────

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [one, setone] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const { name, avatar, userid, isloggedin, loading: authLoading } = useContext(UserContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);


  useEffect(() => {
    if (!authLoading && post && isloggedin && userid && userid !== post.userId) {
      checkFollow(post.userId)
        .then(res => setIsFollowing(res.isFollowing))
        .catch(err => console.error("Follow check failed:", err));
    }
  }, [post, isloggedin, userid, authLoading]);

  // Check if post is already saved
  useEffect(() => {
    if (!authLoading && post && isloggedin) {
      checkSavedPost(post.id)
        .then(res => setBookmarked(res.saved))
        .catch(() => {});
    }
  }, [post, isloggedin, authLoading]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        let data;
        // Try slug endpoint first; fall back to ID endpoint for numeric params
        try {
          const res = await axios.get(`http://localhost:3000/api/post/${slug}`);
          data = res.data;
        } catch (slugErr) {
          if (/^\d+$/.test(slug)) {
            const res = await axios.get(`http://localhost:3000/api/getblog/${slug}`);
            data = res.data;
          } else {
            throw slugErr;
          }
        }
        setPost(data.post);
        setLikes(data.post.likes || 0);
        setTotalComments(data.post.totalComments || 0);
        let parsedComments = [];
        try {
          if (data.post.comments) {
            parsedComments = Array.isArray(data.post.comments)
              ? data.post.comments
              : JSON.parse(data.post.comments);
            if (!Array.isArray(parsedComments)) parsedComments = [];
          }
        } catch (parseError) {
          parsedComments = [];
        }
        const updatedComments = parsedComments.map((comment) =>
          comment.authorid === userid ? { ...comment, author: "You" } : comment
        );
        setComments(updatedComments);
        setError(null);

        // Increment views using the post's ID
        try { await axios.get(`http://localhost:3000/api/visit/${data.post.id}`); }
        catch (err) { console.error("View increment failed:", err); }
      } catch (err) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, userid]);

  const handleLike = async () => {
    if (!isloggedin) return setShowModal(true);
    try {
      setLikes((prev) => prev + 1);
      setone(true);
      await axios.get(`http://localhost:3000/api/likes/${post.id}`, { withCredentials: true });
    } catch (error) {
      setLikes((prev) => prev - 1);
      setone(false);
      toast.error("Failed to like the post");
    }
  };

  const handleBookmark = async () => {
    if (!isloggedin) return setShowModal(true);
    if (savingBookmark) return;
    setSavingBookmark(true);
    try {
      if (bookmarked) {
        await unsaveBlogPost(post.id);
        setBookmarked(false);
        toast.info("Removed from saved posts", { position: "top-right", autoClose: 3000, theme: "light" });
      } else {
        await saveBlogPost(post.id);
        setBookmarked(true);
        toast.success("Post saved!", { position: "top-right", autoClose: 3000, theme: "light" });
      }
    } catch {
      toast.error("Failed to update saved status");
    } finally {
      setSavingBookmark(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) { toast.warning("Please enter a comment"); return; }
    if (!isloggedin) { setShowModal(true); return; }
    const newComment = {
      author: name, authorid: userid,
      date: new Date().toLocaleString(), text: commentText,
      avatar: avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
    };
    try {
      const { data } = await axios.post(`http://localhost:3000/api/comments/${post.id}`, newComment, { withCredentials: true });
      setComments((prev) => [...prev, { ...newComment, author: "You" }]);
      setCommentText("");
      toast.success(data.message || "Comment posted successfully", { position: "top-right", autoClose: 5000, theme: "light" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment", { position: "top-right", autoClose: 5000, theme: "light" });
    }
  };

  const handleFollowAction = async () => {
    if (!isloggedin) return setShowModal(true);
    try {
      if (isFollowing) {
        await unfollowUser(post.userId);
        setIsFollowing(false);
        toast.info("Unfollowed author");
      } else {
        await followUser(post.userId);
        setIsFollowing(true);
        toast.success("Following author!");
      }
    } catch (err) { toast.error("Failed to update follow status"); }
  };

  const handleLoadMoreComments = async () => {
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = commentPage + 1;
      const { data } = await fetchComments(postid, nextPage, 4);
      const newComments = data.comments.map((comment) =>
        comment.authorid === userid ? { ...comment, author: "You" } : comment
      );
      setComments((prev) => [...prev, ...newComments]);
      setCommentPage(nextPage);
    } catch (err) {
      toast.error("Failed to load more comments");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorPage message={error} />;
  if (!post) return <ErrorPage message="Post not found" />;

  return (
    <div id="post-page" className="page active fade-in">
      {!authLoading && <SignInModal show={showModal} onClose={() => setShowModal(false)} />}

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* ── Category badges ── */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {parseCategories(post.categories).map((item, key) => (
                <span
                  key={key}
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    fontWeight: '500',
                    color: '#555',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    textTransform: 'uppercase',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* ── Title ── */}
            <h1
              className="text-dark mb-4"
              style={{ fontFamily: '"Outfit", sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              {post.title}
            </h1>

            {/* ── Author row ── */}
            <div
              className="d-flex align-items-center mb-5 pb-4"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
            >
              <Link to={`/other/${post.userId}`}>
                <img
                  src={post.User?.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                  className="rounded-circle me-3"
                  width="48" height="48"
                  alt="Author"
                  style={{ objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
                />
              </Link>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Link to={`/other/${post.userId}`} className="text-decoration-none text-dark fw-bold" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.95rem' }}>
                    {post.User?.firstName || "Unknown Author"}
                  </Link>
                  {userid !== post.userId && (
                    <button
                      onClick={handleFollowAction}
                      style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '0.78rem', fontWeight: '600',
                        padding: '3px 14px', borderRadius: '4px',
                        border: isFollowing ? '1px solid rgba(0,0,0,0.15)' : '1px solid #0a0a0a',
                        background: isFollowing ? 'transparent' : '#0a0a0a',
                        color: isFollowing ? '#555' : '#fff',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: '0.82rem' }}>
                  <span className="me-3">
                    {new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span><i className="far fa-clock me-1"></i> 5 min read</span>
                </div>
              </div>
            </div>

            {/* ── Hero image ── */}
            {post.headimg && (
              <img
                src={post.headimg}
                alt="Post header"
                className="img-fluid mb-5"
                style={{ borderRadius: '6px', width: '100%', maxHeight: '480px', objectFit: 'cover' }}
              />
            )}

            {/* ── Post body ── */}
            <div
              className="post-body mb-5 text-dark"
              style={{ lineHeight: 1.9, fontFamily: '"Inter", sans-serif', fontSize: '1.05rem', opacity: 0.88 }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* ── Post actions ── */}
            <div
              className="d-flex justify-content-between align-items-center py-4 mb-5"
              style={{ borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
            >
              <div className="d-flex gap-3 align-items-center">
                <button
                  onClick={handleLike}
                  disabled={one}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: '"Outfit", sans-serif', fontSize: '0.88rem', fontWeight: '500',
                    padding: '7px 16px', borderRadius: '4px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: one ? 'rgba(0,0,0,0.04)' : 'transparent',
                    color: one ? '#c0392b' : '#555',
                    cursor: one ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className={one ? "fas fa-heart" : "far fa-heart"} style={{ color: '#c0392b' }}></i>
                  {likes}
                </button>

                <button
                  onClick={handleBookmark}
                  disabled={savingBookmark}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: '"Outfit", sans-serif', fontSize: '0.88rem', fontWeight: '500',
                    padding: '7px 16px', borderRadius: '4px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: bookmarked ? 'rgba(0,0,0,0.06)' : 'transparent',
                    color: bookmarked ? '#0a0a0a' : '#555',
                    cursor: savingBookmark ? 'wait' : 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {savingBookmark
                    ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    : <i className={bookmarked ? "fas fa-bookmark" : "far fa-bookmark"} style={{ color: bookmarked ? '#0a0a0a' : '#888' }}></i>
                  }
                  {bookmarked ? 'Saved' : 'Save'}
                </button>

                {/* Submit to Publication — only for post author */}
                {isloggedin && post && userid === post.userId && (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontFamily: '"Outfit", sans-serif', fontSize: '0.88rem', fontWeight: '500',
                      padding: '7px 16px', borderRadius: '4px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      background: 'transparent', color: '#555',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    title="Submit this post to a Publication for review"
                  >
                    <i className="fas fa-paper-plane" style={{ color: '#3498db' }}></i>
                    Publish to…
                  </button>
                )}
              </div>

              <div className="d-flex gap-2">
                {[
                  { icon: 'fab fa-twitter', label: 'Twitter' },
                  { icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
                  { icon: 'fab fa-facebook-f', label: 'Facebook' },
                ].map((s, i) => (
                  <button
                    key={i}
                    title={s.label}
                    style={{
                      width: '34px', height: '34px', borderRadius: '4px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: 'transparent', color: '#666',
                      fontSize: '0.78rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0a0a0a'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
                  >
                    <i className={s.icon}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Author card ── */}
            <div className="glass-panel p-4 mb-5 rounded" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="d-flex align-items-start gap-4 flex-wrap">
                <Link to={`/other/${post.userId}`}>
                  <img
                    src={post.User?.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                    className="rounded-circle"
                    width="64" height="64"
                    alt="Author"
                    style={{ objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}
                  />
                </Link>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
                    <div>
                      <p className="text-secondary mb-0" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Written by</p>
                      <Link to={`/other/${post.userId}`} className="text-decoration-none">
                        <h5 className="text-dark fw-bold mb-0" style={{ fontFamily: '"Outfit", sans-serif' }}>
                          {post.User?.firstName || "Unknown Author"}
                        </h5>
                      </Link>
                    </div>
                    {userid !== post.userId && (
                      <button
                        onClick={handleFollowAction}
                        style={{
                          fontFamily: '"Outfit", sans-serif',
                          fontSize: '0.82rem', fontWeight: '600',
                          padding: '6px 20px', borderRadius: '4px',
                          border: isFollowing ? '1px solid rgba(0,0,0,0.15)' : '1px solid #0a0a0a',
                          background: isFollowing ? 'transparent' : '#0a0a0a',
                          color: isFollowing ? '#555' : '#fff',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  <p className="text-secondary mb-0 mt-2" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {post.User?.bio || "A dedicated BlogHub User"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Comments ── */}
            <div className="comments-section">
              <div className="d-flex align-items-center gap-3 mb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '1rem' }}>
                <h5 className="text-dark fw-bold mb-0" style={{ fontFamily: '"Outfit", sans-serif' }}>Discussion</h5>
                <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.78rem', fontWeight: '600', padding: '2px 10px', borderRadius: '20px', background: 'rgba(0,0,0,0.06)', color: '#555' }}>
                  {comments.length}
                </span>
              </div>

              {isloggedin && (
                <div className="glass-panel p-4 rounded mb-5" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="d-flex gap-3">
                    <img
                      src={avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                      className="rounded-circle flex-shrink-0"
                      width="38" height="38"
                      alt="You"
                      style={{ objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)', marginTop: '2px' }}
                    />
                    <div className="flex-grow-1">
                      <textarea
                        className="form-control mb-3"
                        placeholder="Share your thoughts..."
                        style={{
                          height: "100px", resize: 'none',
                          background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
                          color: "#333", borderRadius: '6px',
                          fontFamily: '"Inter", sans-serif', fontSize: '0.9rem',
                        }}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-dark"
                          onClick={handlePostComment}
                          disabled={!commentText.trim()}
                          style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.85rem', fontWeight: '600', borderRadius: '4px', padding: '7px 20px' }}
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {comments.length > 0 ? (
                <div className="comments-list d-flex flex-column gap-3">
                  {comments.map((comment, index) => (
                    <div key={index} className="d-flex gap-3 p-4 glass-panel rounded" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                      <img
                        src={comment.avatar}
                        className="rounded-circle flex-shrink-0"
                        width="40" height="40"
                        alt="Commenter"
                        style={{ objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)', marginTop: '2px' }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                          <span className="fw-bold text-dark" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.9rem' }}>
                            {comment.author}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '0.78rem' }}>{comment.date}</span>
                        </div>
                        <p className="text-dark mb-0" style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.92rem', lineHeight: '1.65', opacity: 0.85 }}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {comments.length < totalComments && (
                    <div className="text-center mt-3">
                      <button
                        onClick={handleLoadMoreComments}
                        disabled={loadingMore}
                        style={{
                          fontFamily: '"Outfit", sans-serif', fontSize: '0.85rem', fontWeight: '600',
                          padding: '8px 28px', borderRadius: '4px',
                          border: '1px solid rgba(0,0,0,0.15)',
                          background: 'transparent', color: '#444',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {loadingMore ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...</>
                        ) : 'Load More'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5 glass-panel rounded" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <i className="far fa-comment-dots fa-2x mb-3 d-block text-secondary" style={{ opacity: 0.4 }}></i>
                  <p className="text-secondary mb-0" style={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.95rem' }}>
                    No comments yet — be the first to start the discussion.
                  </p>
                </div>
              )}
            </div>



          </div>
        </div>
      </div>
      {showSubmitModal && post && (
        <SubmitToPublicationModal
          publicationId={null}
          publicationName={null}
          postIdOverride={post.id}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};

export default PostPage;
