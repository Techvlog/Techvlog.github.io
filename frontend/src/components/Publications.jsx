import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listPublications } from "../api/api";
import Loading from "./Loading";

const PLACEHOLDER_COVER =
  "https://gromornanodap.coromandel.biz/wp-content/themes/u-design/assets/images/placeholders/post-placeholder.jpg";
const PLACEHOLDER_AVATAR =
  "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

function Publications() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["publications", page],
    queryFn: () => listPublications(page),
    keepPreviousData: true,
  });

  const pubs = data?.publications ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div
      id="publications-page"
      className="page active fade-in"
      style={{ minHeight: "100vh", background: "#fafafa" }}
    >
      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          padding: "80px 0 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.015)", pointerEvents: "none" }} />

        <div className="container position-relative">
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#ccc",
              borderRadius: "99px",
              padding: "5px 18px",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: '"Outfit", sans-serif',
              marginBottom: "20px",
            }}
          >
            Community Spaces
          </span>
          <h1
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              color: "#fff",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            Publications
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.65 }}>
            Curated spaces built around topics you love. Follow publications to
            never miss a story.
          </p>
          
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="container py-5">
        {isLoading ? (
          <Loading />
        ) : pubs.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-book-open fa-3x mb-3 text-secondary" style={{ opacity: 0.3 }}></i>
            <h4 className="text-dark fw-bold">No publications yet</h4>
            <p className="text-secondary">Be the first to start one!</p>
            <Link to="/publications/create" className="btn btn-dark mt-2" style={{ borderRadius: "10px", fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
              Create Publication
            </Link>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {pubs.map((pub) => (
                <div className="col-md-6 col-lg-4" key={pub.id}>
                  <Link to={`/publication/${pub.id}`} className="text-decoration-none">
                    <div
                      className="h-100"
                      style={{
                        background: "#fff",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.06)",
                        transition: "all 0.3s cubic-bezier(0.165,0.84,0.44,1)",
                        cursor: "pointer",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
                      }}
                    >
                      {/* Cover */}
                      <div style={{ height: "140px", overflow: "hidden", position: "relative" }}>
                        <img
                          src={pub.coverImage || PLACEHOLDER_COVER}
                          alt={pub.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4))" }} />
                      </div>

                      {/* Logo + Info */}
                      <div style={{ padding: "0 20px 24px" }}>
                        {/* Logo */}
                        <div style={{ marginTop: "-24px", marginBottom: "14px" }}>
                          <img
                            src={pub.logo || PLACEHOLDER_AVATAR}
                            alt="logo"
                            style={{
                              width: "52px", height: "52px", borderRadius: "12px",
                              objectFit: "cover", border: "3px solid #fff",
                              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                            }}
                          />
                        </div>

                        <h5
                          style={{
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 700,
                            color: "#0a0a0a",
                            fontSize: "1.15rem",
                            marginBottom: "6px",
                            lineHeight: 1.25,
                          }}
                        >
                          {pub.name}
                        </h5>
                        <p
                          style={{
                            color: "#888",
                            fontSize: "0.85rem",
                            lineHeight: 1.55,
                            marginBottom: "16px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {pub.description || "A curated publication on Techvlog."}
                        </p>

                        {/* Footer row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img
                              src={pub.Owner?.avatar || PLACEHOLDER_AVATAR}
                              alt={pub.Owner?.firstName}
                              style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                            />
                            <span style={{ fontSize: "0.78rem", color: "#999", fontFamily: '"Outfit", sans-serif' }}>
                              {pub.Owner?.firstName}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#666",
                              background: "rgba(0,0,0,0.04)",
                              borderRadius: "99px",
                              padding: "4px 12px",
                              fontFamily: '"Outfit", sans-serif',
                            }}
                          >
                            <i className="fas fa-users me-1" style={{ fontSize: "0.65rem" }}></i>
                            {pub.followersCount ?? 0}
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
              <nav className="mt-5">
                <ul className="pagination justify-content-center" style={{ gap: "0.5rem" }}>
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link bg-transparent border-secondary border-opacity-25 text-dark rounded" onClick={() => setPage(p => p - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li className={`page-item ${page === i + 1 ? "active" : ""}`} key={i}>
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
    </div>
  );
}

export default Publications;
