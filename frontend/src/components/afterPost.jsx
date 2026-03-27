import React from "react";
import { Link } from "react-router-dom";
const AfterPost = () => {
  // Array of motivational quotes
  const quotes = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Your limitation—it's only your imagination. — Unknown",
    "Push yourself, because no one else is going to do it for you. — Unknown",
  ];

  // Get Link random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          {/* Logo/Icon */}
          <div className="mb-4">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="#00ab6b"
              />
              <path
                d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                fill="#50e3c2"
              />
              <path
                d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"
                fill="#00ab6b"
              />
            </svg>
          </div>

          {/* Action buttons */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            <Link
              to="/newpost"
              className="btn btn-primary rounded-pill px-4 py-2"
            >
              <i className="fas fa-pen me-2"></i> Make New Post
            </Link>
            <Link
              to="/discover/all"
              className="btn btn-outline-primary rounded-pill px-4 py-2"
            >
              <i className="fas fa-book-open me-2"></i> Read Posts
            </Link>
          </div>

          {/* Motivational quote */}
          <div className="bg-light p-4 rounded-3 shadow-sm">
            <i className="fas fa-quote-left text-muted me-2"></i>
            <span className="fst-italic">{randomQuote}</span>
          </div>

          {/* Decorative elements */}
          <div className="mt-5">
            <div className="d-flex justify-content-center gap-4">
              <div className="text-primary">
                <i className="fas fa-heart fa-2x"></i>
              </div>
              <div className="text-secondary">
                <i className="fas fa-share-alt fa-2x"></i>
              </div>
              <div className="text-success">
                <i className="fas fa-comment fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfterPost;
