import "../styles/Hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="hero-section">
      <div className="hero-noise"></div>

      <div className="container hero-container">

        {/* Left — Text */}
        <div className="hero-text">
          <span className="hero-eyebrow">A space to think &amp; write</span>

          <h1 className="hero-title">
            Your words<br />
            <em>deserve</em> an<br />
            audience.
          </h1>

          <p className="hero-subtitle">
            Publish your ideas, stories, and expertise — beautifully,
            effortlessly, and entirely on your terms.
          </p>

          <div className="hero-buttons">
            <Link to="/newpost" className="btn-hero-primary">
              Start Writing <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/discover/all" className="btn-hero-ghost">
              Explore Blogs
            </Link>
          </div>
        </div>

        {/* Right — Image */}
        <div className="hero-image-wrap">
          <div className="hero-image-frame">
            <img
              src="/hero.png"
              alt="Blogging illustration"
              loading="lazy"
              className="hero-img"
            />
          </div>
          <div className="hero-image-shadow"></div>
        </div>

      </div>

      {/* Bottom rule */}
      <div className="hero-bottom-line"></div>
    </div>
  );
}

export default Hero;