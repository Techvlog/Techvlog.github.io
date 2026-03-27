const express = require("express");
const {
  createBlog,
  getBlogbyId,
  getBlogBySlug,
  getCatagories,
  deletePost,
  updatePost,
  getFeaturedPosts,
  latestStories,
  getbyCatagory,
  Profile,
  addcomment,
  Likeincrease,
  UpdateBlog,
  OtherProfile,
  followUser,
  unfollowUser,
  checkFollow,
  getPopularPosts,
  incrementViews,
  getComments,
  savePost,
  unsavePost,
  checkSavedPost,
  getSavedPosts,
} = require("../controllers/normalcontroller");
const { authenticateToken } = require("../service/jwtservice");

const router = express.Router();
router.post("/createblog/:id", authenticateToken, createBlog);
router.get("/getblog/:id", getBlogbyId);
router.get("/post/:slug", getBlogBySlug);
router.get("/catagories", getCatagories);
router.get("/deletepost/:id", deletePost);
router.get("/updatePost/:id", updatePost);
router.get("/feature", getFeaturedPosts);
router.get("/latest", latestStories);
router.get("/cat/:cat", getbyCatagory);
router.get("/profile", authenticateToken, Profile);
router.post("/comments/:id", authenticateToken, addcomment);
router.get("/likes/:id", authenticateToken, Likeincrease);
router.post("/updateblog/:postid", authenticateToken, UpdateBlog);
router.get("/otherprofile/:id", OtherProfile);
router.post("/follow/:id", authenticateToken, followUser);
router.post("/unfollow/:id", authenticateToken, unfollowUser);
router.get("/check-follow/:id", authenticateToken, checkFollow);
router.get("/popular", getPopularPosts);
router.get("/visit/:id", incrementViews);
router.get("/comments/:id", getComments);
router.post("/save-post/:id", authenticateToken, savePost);
router.post("/unsave-post/:id", authenticateToken, unsavePost);
router.get("/check-saved/:id", authenticateToken, checkSavedPost);
router.get("/saved-posts", authenticateToken, getSavedPosts);

module.exports = router;
