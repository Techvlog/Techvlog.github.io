import React, { useState, useEffect } from "react";
import {
  useLatestpost,
  useFetchbycatagories,
  useCatagories,
} from "../../hooks/hooks";
import Loading from "./Loading";
import ErrorPage from "./Eror";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

/* ─── Styles ─────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink: #111111;
    --ink-60: rgba(17,17,17,0.58);
    --ink-20: rgba(17,17,17,0.08);
    --paper: #fafaf8;
    --radius: 4px;
  }

  #discover-page {
    background: var(--paper);
    font-family: 'DM Sans', sans-serif;
  }

  /* ─ section label ─ */
  .disc-label {
    font-size: 0.58rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-60);
  }

  /* ─ hero strip ─ */
  .disc-hero {
    border-bottom: 1px solid var(--ink-20);
    padding: 4rem 0 2.5rem;
  }

  /* ─ category sidebar ─ */
  .cat-nav {
    position: sticky;
    top: 100px;
    border: 1px solid var(--ink-20);
    border-radius: var(--radius);
    background: #fff;
    padding: 1.4rem;
  }
  .cat-nav-title {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-60);
    margin-bottom: 1rem;
  }
  .cat-link {
    display: block;
    padding: 6px 10px;
    border-radius: 2px;
    font-size: 0.82rem;
    font-weight: 400;
    color: var(--ink-60);
    text-decoration: none;
    transition: all 0.16s;
    border-left: 2px solid transparent;
    margin-bottom: 2px;
  }
  .cat-link:hover {
    color: var(--ink);
    background: rgba(17,17,17,0.03);
    border-left-color: var(--ink-20);
  }
  .cat-link.active {
    color: var(--ink);
    font-weight: 600;
    border-left-color: var(--ink);
    background: rgba(17,17,17,0.03);
  }

  /* ─ post card ─ */
  .disc-card {
    border: 1px solid var(--ink-20);
    border-radius: var(--radius);
    background: #fff;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .disc-card:hover {
    border-color: rgba(17,17,17,0.22);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }
  .disc-card-img {
    width: 100%; height: 190px; object-fit: cover;
    display: block;
    transition: transform 0.45s ease;
  }
  .disc-card:hover .disc-card-img { transform: scale(1.03); }

  /* ─ pagination ─ */
  .pg-btn {
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid var(--ink-20);
    background: transparent;
    font-size: 0.78rem;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.18s; color: var(--ink);
    font-family: 'DM Sans', sans-serif;
  }
  .pg-btn:hover:not(:disabled) { border-color: var(--ink); }
  .pg-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .pg-btn:disabled { opacity: 0.28; cursor: not-allowed; }

  .un-rem { text-decoration: none; }

  /* ── Responsive: Discover Page ────────────────────────── */
  @media (max-width: 768px) {
    .disc-hero {
      padding: 2.5rem 0 1.5rem !important;
    }
    .cat-nav {
      position: static !important;
      margin-bottom: 1.5rem;
      padding: 1rem !important;
    }
    .cat-nav nav {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 0.25rem;
    }
    .cat-link {
      display: inline-block !important;
      border: 1px solid rgba(17,17,17,0.08) !important;
      border-left: none !important;
      border-radius: 4px !important;
      padding: 4px 12px !important;
      font-size: 0.72rem !important;
      margin-bottom: 0 !important;
    }
    .cat-link.active {
      background: var(--ink) !important;
      color: #fff !important;
      border-color: var(--ink) !important;
    }
    .disc-card-img {
      height: 160px !important;
    }
  }

  @media (max-width: 480px) {
    .disc-card-img {
      height: 140px !important;
    }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
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

const excerpt = (html, n = 16) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>?/gm, "");
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, n).join(" ") + (words.length > n ? "…" : "");
};

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/* ─── Component ──────────────────────────────────────────────────────── */
function Discover() {
  const { catagory } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { loadingPosts, posts, postsError } = useFetchbycatagories(catagory, currentPage);
  const { cat, loadingCat, catError } = useCatagories();

  useEffect(() => { setCurrentPage(1); }, [catagory]);

  return (
    <>
      <style>{styles}</style>

      {(loadingPosts || loadingCat) && <Loading />}
      {(postsError || catError) && <ErrorPage />}

      {!loadingPosts && !loadingCat && !postsError && !catError && posts?.data && cat?.data && (
        <div id="discover-page" className="page active">

          {/* ── Hero ── */}
          <div className="disc-hero">
            <div className="container">
              <p className="disc-label mb-2">Explore</p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 600,
                color: "var(--ink)",
                lineHeight: 1.15,
                marginBottom: "0.6rem",
              }}>
                {catagory ? catagory : "All Stories"}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-60)", margin: 0 }}>
                {posts?.data?.totalPosts
                  ? `${posts.data.totalPosts} articles`
                  : "Browse articles across every topic"}
              </p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="container py-5">
            <div className="row g-5">

              {/* Sidebar */}
              <div className="col-lg-3">
                <div className="cat-nav">
                  <p className="cat-nav-title">Categories</p>
                  <nav>
                    <Link
                      to="/discover"
                      className={`cat-link ${!catagory ? "active" : ""}`}
                    >
                      All Topics
                    </Link>
                    {cat?.data?.cata?.map((category, i) => (
                      <Link
                        key={i}
                        to={`/discover/${category}`}
                        className={`cat-link ${catagory === category ? "active" : ""}`}
                      >
                        {category}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Grid */}
              <div className="col-lg-9">

                {/* Empty state */}
                {posts?.data?.stories?.length === 0 && (
                  <div style={{ textAlign: "center", padding: "5rem 0" }}>
                    <p className="disc-label mb-3">No results</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--ink-60)" }}>
                      No articles found in this category yet.
                    </p>
                    <Link to="/discover" style={{ fontSize: "0.82rem", color: "var(--ink)", fontWeight: 500 }}>
                      ← View all stories
                    </Link>
                  </div>
                )}

                <div className="row g-3">
                  {posts?.data?.stories?.map((post, index) => (
                    <div key={index} className="col-md-6">
                      <Link to={`/detail/${post.slug || post.id}`} className="un-rem d-block h-100">
                        <div className="disc-card">
                          <div style={{ overflow: "hidden" }}>
                            <img
                              className="disc-card-img"
                              src={post.headimg || "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg"}
                              alt={post.title}
                            />
                          </div>
                          <div style={{ padding: "1.1rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                            {/* Category labels */}
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {parseCategories(post.categories).slice(0, 2).map((c, i) => (
                                <span key={i} className="disc-label">{c}</span>
                              ))}
                            </div>

                            {/* Title */}
                            <h5 style={{
                              fontFamily: "'Playfair Display', serif",
                              fontSize: "1.05rem", fontWeight: 600,
                              color: "var(--ink)", lineHeight: 1.35,
                              marginBottom: "0.5rem",
                            }}>
                              {post.title}
                            </h5>

                            {/* Excerpt */}
                            <p style={{
                              fontSize: "0.8rem", color: "var(--ink-60)",
                              lineHeight: 1.6, flexGrow: 1, margin: 0,
                            }}>
                              {excerpt(post.content)}
                            </p>

                            {/* Author row */}
                            <div style={{
                              display: "flex", alignItems: "center", gap: "0.6rem",
                              marginTop: "1rem", paddingTop: "0.9rem",
                              borderTop: "1px solid var(--ink-20)",
                            }}>
                              <img
                                src={post.User?.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                                style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                alt=""
                              />
                              <span style={{ fontSize: "0.75rem", color: "var(--ink-60)", fontWeight: 500 }}>
                                {post.User?.firstName || "Unknown"}
                              </span>
                              <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--ink-60)" }}>
                                {fmtDate(post.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {(posts?.data?.totalPages || 1) > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-5">
                    <button
                      className="pg-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >‹</button>
                    {[...Array(posts?.data?.totalPages || 1)].map((_, i) => (
                      <button
                        key={i}
                        className={`pg-btn ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pg-btn"
                      onClick={() => setCurrentPage(p => Math.min(posts?.data?.totalPages || 1, p + 1))}
                      disabled={currentPage === posts?.data?.totalPages}
                    >›</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Discover;