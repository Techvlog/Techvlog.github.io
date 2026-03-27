import React from "react";
import { useCatagories } from "../../hooks/hooks";
import ErrorPage from "./Eror";
import { Link } from "react-router-dom";

function Categories() {
  const { cat, loadingCat, catError } = useCatagories();

  return (
    <>
      {catError && <ErrorPage />}
      {!catError && (
        <div id="categories-page" className="page active fade-in" style={{ minHeight: '100vh', padding: '2rem 0' }}>
          <div className="container py-5">

            {/* Header */}
            <div className="row mb-5 mt-4">
              <div className="col-12">
                <h1
                  className="mb-2 text-dark fw-bold"
                  style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem' }}
                >
                  Browse Categories
                </h1>
                <p className="text-secondary mb-0">
                  Find content that matches your interests
                </p>
              </div>
            </div>

            {/* Category Grid */}
            <div className="row g-3">
              {cat?.data?.cata?.map((category, index) => (
                <div className="col-md-6 col-lg-4" key={index}>
                  <Link to={`/discover/${category}`} className="text-decoration-none">
                    <div
                      className="glass-panel p-4 h-100 d-flex flex-column justify-content-between"
                      style={{
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                        minHeight: '130px',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = '';
                      }}
                    >
                      {/* Top row: index badge */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span
                          className="text-secondary"
                          style={{ fontSize: '0.75rem', fontFamily: '"Outfit", sans-serif', letterSpacing: '1px' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <i className="fas fa-arrow-right text-secondary" style={{ fontSize: '0.8rem' }}></i>
                      </div>

                      {/* Category name */}
                      <div>
                        <h5
                          className="text-dark fw-bold mb-1"
                          style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.1rem' }}
                        >
                          {category}
                        </h5>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.83rem' }}>
                          Explore {category} articles
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Categories;