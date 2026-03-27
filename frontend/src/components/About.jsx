import React from 'react';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: 'fas fa-code',
    title: 'Built from Scratch',
    description: 'Every line of code written by hand — no templates, no shortcuts. Just genuine learning and building.',
  },
  {
    icon: 'fas fa-pen',
    title: 'For Writers',
    description: 'A clean space for anyone to publish their thoughts, ideas, and stories without distraction.',
  },
  {
    icon: 'fas fa-users',
    title: 'Community First',
    description: 'Readers can follow writers, like posts, and discover new voices across dozens of categories.',
  },
  {
    icon: 'fas fa-graduation-cap',
    title: 'A Learning Journey',
    description: 'This project represents months of learning React, Node.js, and full-stack development as a college student.',
  },
];

const AboutPage = () => {
  return (
    <div id="about-page" className="page active fade-in" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Header */}
            <div className="mb-5 mt-4">
              <h1
                className="mb-2 text-dark fw-bold"
                style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem' }}
              >
                About BlogHub
              </h1>
              <p className="text-secondary lead mb-0">
                A full-stack blogging platform built by a college student
              </p>
            </div>

            {/* About the Project */}
            <div className="glass-panel p-5 mb-4 rounded">
              <h5
                className="text-secondary text-uppercase fw-bold mb-4"
                style={{ letterSpacing: '1px', fontSize: '0.8rem' }}
              >
                The Project
              </h5>
              <div className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: '1.9' }}>
                <p>
                  BlogHub is a full-stack web application built as a personal project by
                  <span className="text-dark fw-bold"> Asish Kumar Dalal</span>, a college student
                  passionate about web development. What started as an idea to learn modern web
                  technologies turned into a fully functional blogging platform — complete with
                  authentication, post management, user profiles, and more.
                </p>
                <p className="mb-0">
                  The goal was simple: build something real, an original platform designed, developed, and
                  deployed end-to-end from scratch.
                </p>
              </div>
            </div>

            {/* About the Developer */}
            <div className="glass-panel p-5 mb-4 rounded">
              <h5
                className="text-secondary text-uppercase fw-bold mb-4"
                style={{ letterSpacing: '1px', fontSize: '0.8rem' }}
              >
                The Developer
              </h5>
              <div className="d-flex align-items-center gap-4 flex-wrap">
                <div
                  className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                  style={{
                    width: '72px',
                    height: '72px',
                    background: 'rgba(0,0,0,0.06)',
                    fontSize: '1.8rem',
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: '700',
                    color: '#111'
                  }}
                >
                  A
                </div>
                <div>
                  <h4 className="text-dark fw-bold mb-1" style={{ fontFamily: '"Outfit", sans-serif' }}>
                    Asish Kumar Dalal
                  </h4>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                    College Student &nbsp;·&nbsp; Full-Stack Developer &nbsp;·&nbsp; React &amp; Node.js
                  </p>
                </div>
              </div>
            </div>

            {/* What's Inside */}
            <div className="mb-4">
              <h5
                className="text-secondary text-uppercase fw-bold mb-4"
                style={{ letterSpacing: '1px', fontSize: '0.8rem' }}
              >
                What's Inside
              </h5>
              <div className="row g-3">
                {values.map((value, index) => (
                  <div className="col-md-6" key={index}>
                    <div
                      className="glass-panel p-4 h-100 rounded"
                      style={{ transition: 'all 0.25s ease' }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = '';
                      }}
                    >
                      <i className={`${value.icon} text-dark mb-3 d-block`} style={{ fontSize: '1.2rem' }}></i>
                      <h6 className="text-dark fw-bold mb-2" style={{ fontFamily: '"Outfit", sans-serif' }}>
                        {value.title}
                      </h6>
                      <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="glass-panel p-5 mb-4 rounded">
              <h5
                className="text-secondary text-uppercase fw-bold mb-4"
                style={{ letterSpacing: '1px', fontSize: '0.8rem' }}
              >
                Tech Stack
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT Auth', 'Bootstrap', 'Axios', 'React Router'].map((tech, i) => (
                  <span
                    key={i}
                    className="badge"
                    style={{
                      background: 'rgba(0,0,0,0.06)',
                      color: '#333',
                      fontWeight: '600',
                      fontSize: '0.82rem',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0,0,0,0.08)'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-panel p-5 text-center rounded">
              <h4 className="text-dark fw-bold mb-2" style={{ fontFamily: '"Outfit", sans-serif' }}>
                Try It Out
              </h4>
              <p className="text-secondary mb-4" style={{ fontSize: '1rem' }}>
                Create an account and start reading or writing today.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/signup" className="btn btn-dark px-4 py-2 fw-bold">
                  Get Started <i className="fas fa-arrow-right ms-2"></i>
                </Link>
                <Link
                  to="/discover/all"
                  className="btn px-4 py-2 fw-bold"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0,0,0,0.15)',
                    color: '#555'
                  }}
                >
                  Browse Articles
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;