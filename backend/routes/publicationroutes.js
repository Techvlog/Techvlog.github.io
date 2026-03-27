const express = require("express");
const {
  createPublication,
  updatePublication,
  deletePublication,
  listPublications,
  getPublication,
  followPublication,
  unfollowPublication,
  checkFollowPublication,
  submitPost,
  getSubmissions,
  approveSubmission,
  rejectSubmission,
  myPublications,
  mySubmissions,
  myFollowing,
  allPendingSubmissions,
} = require("../controllers/publicationcontroller");
const { authenticateToken } = require("../service/jwtservice");

const router = express.Router();

// ── /me/* routes MUST come before /:id so Express does not swallow "me" as an id
router.get("/me/owned",       authenticateToken, myPublications);
router.get("/me/submissions", authenticateToken, mySubmissions);
router.get("/me/following",   authenticateToken, myFollowing);
router.get("/me/pending",     authenticateToken, allPendingSubmissions);

// ── Public
router.get("/",    listPublications);
router.get("/:id", getPublication);

// ── Auth required – CRUD
router.post("/",      authenticateToken, createPublication);
router.put("/:id",    authenticateToken, updatePublication);
router.delete("/:id", authenticateToken, deletePublication);

// ── Follow / Unfollow
router.post("/:id/follow",       authenticateToken, followPublication);
router.post("/:id/unfollow",     authenticateToken, unfollowPublication);
router.get("/:id/check-follow",  authenticateToken, checkFollowPublication);

// ── Submissions
router.post("/:id/submit",                               authenticateToken, submitPost);
router.get("/:id/submissions",                           authenticateToken, getSubmissions);
router.post("/:id/submissions/:submissionId/approve",    authenticateToken, approveSubmission);
router.post("/:id/submissions/:submissionId/reject",     authenticateToken, rejectSubmission);

module.exports = router;
