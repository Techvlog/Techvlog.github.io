import React, { useEffect, useState, useContext } from "react";
import "../styles/Otherprofile.css";
import { useOtherProfile } from "../../hooks/hooks";
import { useParams } from "react-router-dom";
import { followUser, unfollowUser, checkFollow } from "../api/api";
import Loading from "./Loading";
import ErrorPage from "./Eror";
import { UserContext } from "../../context/usercontext";

const OthersProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(0);
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useOtherProfile(id);
  const { isloggedin, userid, loading: authLoading } = useContext(UserContext);

  useEffect(() => {
    if (!authLoading && data && isloggedin && userid && userid != id) {
      setLocalFollowers(data.followers || 0);
      checkFollow(id)
        .then(res => setIsFollowing(res.isFollowing))
        .catch(err => console.error("Follow check failed:", err));
    } else if (data) {
      setLocalFollowers(data.followers || 0);
    }
  }, [data, isloggedin, userid, id, authLoading]);

  // Refetch data when the ID changes, ensuring useOtherProfile is re-evaluated
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setLocalFollowers(prev => Math.max(0, prev - 1));
        setIsFollowing(false);
      } else {
        await followUser(id);
        setLocalFollowers(prev => prev + 1);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Failed to update follow status", err);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && !error && (
        <div className="profile-page">
          {/* Profile Header */}
          <div className="profile-header animate-fade-in">
            <div className="profile-avatar-container">
              <img
                src={data.avatar}
                alt={data.name}
                className="profile-avatar"
              />
              <button
                onClick={handleFollow}
                className={`follow-btn ${isFollowing ? "following" : ""}`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
            <div className="profile-info">
              <h1 className="profile-name-1">
                {data.firstName} {data.lastName}
              </h1>
              <p className="profile-username">@{data.firstName}</p>
              <p className="profile-bio">{data.bio || "A dedicated  User"}</p>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">
                    {data.totalViews || 0}
                  </span>
                  <span className="stat-label">Total Views</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {localFollowers}
                  </span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {data.totalLikes || 0}
                  </span>
                  <span className="stat-label">Total Likes</span>
                </div>
              </div>

              <div className="profile-social">
                {
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                }
                {
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <i className="fab fa-github"></i>
                  </a>
                }
                {
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <i className="fas fa-globe"></i>
                  </a>
                }
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="recent-posts-section">
            <h2 className="section-title animate-slide-up">Recent Posts</h2>
            <div className="posts-grid">
              {data.posts?.map((post) => (
                <div key={post.id} className="post-card animate-fade-in">
                  <img
                    src={post.headimg || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3"}
                    alt={post.title}
                    className="post-image"
                  />
                  <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>

                    <div className="post-meta">
                      <span className="post-date">{new Date(post.createdAt || post.updatedAt).toLocaleDateString()}</span>
                      <span className="post-likes">
                        <i className="fas fa-heart"></i> {post.likes}
                      </span>
                      <span className="post-likes ps-3">
                        <i className="fas fa-eye"></i> {post.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {error && <ErrorPage />}
    </>
  );
};

export default OthersProfile;
