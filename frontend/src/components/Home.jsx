import Hero from "./Hero";
import ErrorPage from "./Eror";
import { useState, useContext } from "react";
import Loading from "./Loading";
import { useHomeapi } from "../../hooks/hooks";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/usercontext";

/* ─── Minimal CSS injected once ─────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink: #111111;
    --ink-60: rgba(17,17,17,0.6);
    --ink-20: rgba(17,17,17,0.08);
    --paper: #fafaf8;
    --accent: #111111;
    --radius: 4px;
  }

  #home-page { background: var(--paper); font-family: 'DM Sans', sans-serif; }

  .section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-60);
  }

  /* ─ featured cards ─ */
  .feat-card {
    border: 1px solid var(--ink-20);
    border-radius: var(--radius);
    overflow: hidden;
    background: #fff;
    transition: border-color 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .feat-card:hover { border-color: rgba(17,17,17,0.25); }
  .feat-card img { transition: transform 0.5s ease; }
  .feat-card:hover img { transform: scale(1.03); }

  /* ─ story list ─ */
  .story-row {
    border-top: 1px solid var(--ink-20);
    padding: 1.75rem 0;
    display: flex;
    gap: 1.75rem;
    transition: background 0.2s;
  }
  .story-row:hover { background: rgba(17,17,17,0.015); }



  /* ─ sidebar ─ */
  .sidebar-block {
    border: 1px solid var(--ink-20);
    border-radius: var(--radius);
    background: #fff;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .sidebar-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--ink-60); margin-bottom: 1.1rem;
  }
  .tag-pill {
    border: 1px solid var(--ink-20);
    border-radius: 2px;
    padding: 4px 12px;
    font-size: 0.62rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink); background: transparent;
    transition: all 0.18s;
    text-decoration: none; display: inline-block;
  }
  .tag-pill:hover { background: var(--ink); color: #fff; border-color: var(--ink); }

  .popular-item { display: flex; gap: 1rem; padding: 0.9rem 0; border-bottom: 1px solid var(--ink-20); }
  .popular-item:last-child { border-bottom: none; padding-bottom: 0; }
  .popular-item img { width: 64px; height: 64px; object-fit: cover; border-radius: 2px; flex-shrink: 0; }

  /* ─ pagination ─ */
  .pg-btn {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid var(--ink-20);
    background: transparent; font-size: 0.8rem;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.18s; color: var(--ink);
  }
  .pg-btn:hover:not(:disabled) { border-color: var(--ink); }
  .pg-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ─ newsletter ─ */
  .nl-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--ink-20); border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    background: var(--paper); outline: none;
    transition: border-color 0.2s;
  }
  .nl-input:focus { border-color: rgba(17,17,17,0.4); }
  .nl-btn {
    width: 100%; padding: 10px;
    background: var(--ink); color: #fff;
    border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
    font-weight: 500; letter-spacing: 0.04em;
    cursor: pointer; transition: opacity 0.18s; margin-top: 0.5rem;
  }
  .nl-btn:hover { opacity: 0.8; }
  .un-rem { text-decoration: none; }

  /* ── Responsive: Home Page ─────────────────────────── */
  @media (max-width: 768px) {
    .story-row {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    .story-row > div:first-child img {
      width: 100% !important;
      height: 180px !important;
    }
    .sidebar-block {
      margin-bottom: 1rem;
    }
  }

  @media (max-width: 576px) {
    .feat-card img {
      height: 180px !important;
    }

    .popular-item img {
      width: 48px !important;
      height: 48px !important;
    }
  }
`;

/* ─── Helpers ────────────────────────────────────────────────────────── */
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

const excerpt = (html, n = 24) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>?/gm, "");
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, n).join(" ") + (words.length > n ? "…" : "");
};

const fmtDate = (d, opts) => new Date(d).toLocaleDateString(undefined, opts);

/* ─── Component ──────────────────────────────────────────────────────── */
function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const { loading, features, cat, posts, popular, error } = useHomeapi(currentPage);
  const { isloggedin, loading: authLoading } = useContext(UserContext);

  return (
    <>
      <style>{styles}</style>
      {loading && <Loading />}
      {error && <ErrorPage />}
      {!loading && !error && (
        <div id="home-page" className="page active">
          <Hero />

          <div className="container py-5">
            <div className="row g-5">

              {/* ── Main Column ── */}
              <div className="col-lg-8">

                {/* Featured Posts */}
                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <div>
                    <p className="section-label mb-1">Curated</p>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                      Featured Posts
                    </h2>
                  </div>
                  <div className="d-flex gap-2">
                    {["Latest", "Popular"].map(l => (
                      <button key={l} style={{ border: "1px solid var(--ink-20)", background: "transparent", borderRadius: "2px", padding: "4px 14px", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.05em", cursor: "pointer", color: "var(--ink)", transition: "all 0.18s" }}
                        onMouseOver={e => { e.target.style.background = "var(--ink)"; e.target.style.color = "#fff"; }}
                        onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = "var(--ink)"; }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured grid — g-4 for more breathing room between cards */}
                <div className="row g-4 mb-5">
                  {features?.data?.postsToFeature?.map((item) => (
                    <div className="col-md-6" key={item.id}>
                      <Link to={`/detail/${item.slug || item.id}`} className="un-rem d-block h-100">
                        <div className="feat-card">
                          <div style={{ overflow: "hidden" }}>
                            <img
                              src={item.headimg || "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg"}
                              style={{ width: "100%", height: "260px", objectFit: "cover", display: "block" }}
                              alt={item.title}
                            />
                          </div>
                          <div style={{ padding: "1.5rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                            <div className="d-flex gap-2 flex-wrap mb-2">
                              {parseCategories(item.categories).slice(0, 2).map(c => (
                                <span key={c} className="section-label" style={{ letterSpacing: "0.1em" }}>{c}</span>
                              ))}
                            </div>
                            {/* Larger title */}
                            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.35, marginBottom: "0.75rem" }}>
                              {item.title}
                            </h4>
                            {/* Longer, more readable excerpt */}
                            <p style={{ fontSize: "0.88rem", color: "var(--ink-60)", lineHeight: 1.7, flexGrow: 1, margin: 0 }}>
                              {excerpt(item.content)}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid var(--ink-20)" }}>
                              <img
                                src={item.User?.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                                alt=""
                              />
                              <span style={{ fontSize: "0.8rem", color: "var(--ink-60)", fontWeight: 500 }}>{item.User?.firstName || "Unknown"}</span>
                              <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--ink-60)" }}>
                                {fmtDate(item.updatedAt, { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>



                {/* ── Latest Stories ─── */}
                <div className="mb-3 mt-2">
                  <p className="section-label mb-1">Ongoing</p>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.35rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                    Latest Stories
                  </h4>
                </div>

                <div>
                  {posts?.data?.stories?.map((item) => (
                    <Link key={item.id} to={`/detail/${item.slug || item.id}`} className="un-rem d-block">
                      <div className="story-row">
                        {/* Bigger thumbnail */}
                        <div style={{ flexShrink: 0, overflow: "hidden", borderRadius: 2 }}>
                          <img
                            src={item.headimg || "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg"}
                            style={{ width: 160, height: 110, objectFit: "cover", display: "block", transition: "transform 0.4s" }}
                            alt={item.title}
                            onMouseOver={e => e.target.style.transform = "scale(1.04)"}
                            onMouseOut={e => e.target.style.transform = "scale(1)"}
                          />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div className="d-flex gap-3 mb-1 align-items-center">
                            {parseCategories(item.categories).slice(0, 2).map(c => (
                              <span key={c} className="section-label">{c}</span>
                            ))}
                            <span style={{ fontSize: "0.6rem", color: "var(--ink-60)" }}>7 min read</span>
                          </div>
                          {/* Larger title */}
                          <h5 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: "0.4rem" }}>
                            {item.title}
                          </h5>
                          {/* Longer excerpt */}
                          <p style={{ fontSize: "0.85rem", color: "var(--ink-60)", lineHeight: 1.65, margin: 0 }}>
                            {excerpt(item.content, 22)}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.7rem" }}>
                            <img
                              src={item.User?.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                              style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                              alt=""
                            />
                            <span style={{ fontSize: "0.75rem", color: "var(--ink-60)", fontWeight: 500 }}>{item.User?.firstName || "Unknown"}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--ink-60)" }}>
                              · {fmtDate(item.updatedAt, { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center gap-2 mt-5">
                  <button className="pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                  {[...Array(posts?.data?.totalPages || 1)].map((_, i) => (
                    <button key={i} className={`pg-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button className="pg-btn" onClick={() => setCurrentPage(p => Math.min(posts?.data?.totalPages || 1, p + 1))} disabled={currentPage === posts?.data?.totalPages}>›</button>
                </div>
              </div>

              {/* ── Sidebar ── */}
              <div className="col-lg-4">
                <div style={{ position: "sticky", top: 100 }}>

                  <div className="sidebar-block">
                    <p className="sidebar-title">About BlogHub</p>
                    <p style={{ fontSize: "0.83rem", color: "var(--ink-60)", lineHeight: 1.65, marginBottom: "1rem" }}>
                      A space for writers and readers to connect, share ideas, and discover new perspectives.
                    </p>
                    <button style={{ border: "1px solid var(--ink-20)", background: "transparent", padding: "8px 16px", width: "100%", borderRadius: 2, fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer", color: "var(--ink)", transition: "all 0.18s" }}
                      onMouseOver={e => { e.target.style.background = "var(--ink)"; e.target.style.color = "#fff"; }}
                      onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = "var(--ink)"; }}>
                      Our Story
                    </button>
                  </div>

                  <div className="sidebar-block">
                    <p className="sidebar-title">Popular Tags</p>
                    <div className="d-flex flex-wrap gap-2">
                      {cat?.data?.cata?.slice(0, 5).map(tag => (
                        <Link key={tag} to={`/discover/${tag}`} className="tag-pill">{tag}</Link>
                      ))}
                    </div>
                  </div>

                  <div className="sidebar-block">
                    <p className="sidebar-title">Popular Posts</p>
                    {popular?.data?.posts?.map((post, i) => (
                      <Link key={i} to={`/detail/${post.slug || post.id}`} className="un-rem popular-item d-flex">
                        <img src={post.headimg || "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg"} alt={post.title} />
                        <div>
                          <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)", margin: "0 0 4px", lineHeight: 1.35 }}>{post.title}</p>
                          <span style={{ fontSize: "0.68rem", color: "var(--ink-60)" }}>{fmtDate(post.updatedAt, { month: "short", day: "numeric" })}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="sidebar-block">
                    <p className="sidebar-title">Newsletter</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--ink-60)", lineHeight: 1.6, marginBottom: "1rem" }}>
                      Latest posts, weekly. No spam.
                    </p>
                    <input type="email" className="nl-input" placeholder="your@email.com" />
                    <button className="nl-btn">Subscribe</button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;