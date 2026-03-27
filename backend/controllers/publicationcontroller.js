const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { Publication, PublicationFollower, PublicationSubmission, BlogPost, User } = require("../models/authmodel");

// ── Slug generator ─────────────────────────────────────────────────────────────
const makeSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── Create Publication ─────────────────────────────────────────────────────────
const createPublication = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { name, description, coverImage, logo } = req.body;

  if (!name) return res.status(400).json({ message: "Publication name is required" });

  // ensure unique slug
  let slug = makeSlug(name);
  const existing = await Publication.findOne({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const pub = await Publication.create({ name, slug, description, coverImage, logo, ownerId });
  res.status(201).json({ publication: pub });
});

// ── Update Publication ─────────────────────────────────────────────────────────
const updatePublication = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, description, coverImage, logo } = req.body;

  const pub = await Publication.findByPk(id);
  if (!pub) return res.status(404).json({ message: "Publication not found" });
  if (pub.ownerId !== userId) return res.status(403).json({ message: "Not the owner" });

  if (name) pub.name = name;
  if (description !== undefined) pub.description = description;
  if (coverImage !== undefined) pub.coverImage = coverImage;
  if (logo !== undefined) pub.logo = logo;
  await pub.save();

  res.json({ publication: pub });
});

// ── Delete Publication ─────────────────────────────────────────────────────────
const deletePublication = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const pub = await Publication.findByPk(id);
  if (!pub) return res.status(404).json({ message: "Publication not found" });
  if (pub.ownerId !== userId) return res.status(403).json({ message: "Not the owner" });

  await pub.destroy();
  res.json({ message: "Publication deleted" });
});

// ── List All Publications (paginated) ─────────────────────────────────────────
const listPublications = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  const { count, rows } = await Publication.findAndCountAll({
    include: [{ model: User, as: "Owner", attributes: ["firstName", "avatar"] }],
    order: [["followersCount", "DESC"], ["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    publications: rows,
    totalPages: Math.ceil(count / limit) || 1,
    totalCount: count,
    currentPage: page,
  });
});

// ── Get Single Publication + Approved Posts ────────────────────────────────────
const getPublication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 9;
  const offset = (page - 1) * limit;

  const pub = await Publication.findByPk(id, {
    include: [{ model: User, as: "Owner", attributes: ["id", "firstName", "avatar", "bio"] }],
  });
  if (!pub) return res.status(404).json({ message: "Publication not found" });

  // fetch approved submissions -> posts
  const { count, rows } = await PublicationSubmission.findAndCountAll({
    where: { publicationId: id, status: "approved" },
    include: [{
      model: BlogPost, as: "Post",
      include: [{ model: User, attributes: ["firstName", "avatar"] }],
    }],
    order: [["updatedAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    publication: pub,
    posts: rows.map(s => s.Post).filter(Boolean),
    totalPages: Math.ceil(count / limit) || 1,
    totalPosts: count,
    currentPage: page,
  });
});

// ── Follow Publication ─────────────────────────────────────────────────────────
const followPublication = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const publicationId = parseInt(req.params.id);

  const pub = await Publication.findByPk(publicationId);
  if (!pub) return res.status(404).json({ message: "Publication not found" });

  const [, created] = await PublicationFollower.findOrCreate({ where: { userId, publicationId } });
  if (created) {
    pub.followersCount += 1;
    await pub.save();
  }

  res.json({ following: true, message: created ? "Now following" : "Already following" });
});

// ── Unfollow Publication ───────────────────────────────────────────────────────
const unfollowPublication = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const publicationId = parseInt(req.params.id);

  const record = await PublicationFollower.findOne({ where: { userId, publicationId } });
  if (record) {
    await record.destroy();
    const pub = await Publication.findByPk(publicationId);
    if (pub && pub.followersCount > 0) {
      pub.followersCount -= 1;
      await pub.save();
    }
  }

  res.json({ following: false, message: "Unfollowed" });
});

// ── Check Follow Status ────────────────────────────────────────────────────────
const checkFollowPublication = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const publicationId = parseInt(req.params.id);

  const record = await PublicationFollower.findOne({ where: { userId, publicationId } });
  res.json({ following: !!record });
});

// ── Submit Post to Publication ─────────────────────────────────────────────────
const submitPost = asyncHandler(async (req, res) => {
  const submittedBy = req.user.id;
  const publicationId = parseInt(req.params.id);
  const { postId } = req.body;

  if (!postId) return res.status(400).json({ message: "postId is required" });

  const pub  = await Publication.findByPk(publicationId);
  if (!pub) return res.status(404).json({ message: "Publication not found" });

  const post = await BlogPost.findByPk(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.userId !== submittedBy) return res.status(403).json({ message: "Can only submit your own posts" });

  const [sub, created] = await PublicationSubmission.findOrCreate({
    where: { publicationId, postId },
    defaults: { submittedBy, status: "pending" },
  });

  if (!created) return res.status(409).json({ message: "Already submitted to this publication", submission: sub });

  res.status(201).json({ message: "Submission sent for review", submission: sub });
});

// ── Get Pending Submissions (owner only) ──────────────────────────────────────
const getSubmissions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id }  = req.params;
  const status  = req.query.status || "pending";

  const pub = await Publication.findByPk(id);
  if (!pub) return res.status(404).json({ message: "Publication not found" });
  if (pub.ownerId !== userId) return res.status(403).json({ message: "Not the owner" });

  const submissions = await PublicationSubmission.findAll({
    where: { publicationId: id, status },
    include: [
      { model: BlogPost, as: "Post", include: [{ model: User, attributes: ["firstName", "avatar"] }] },
      { model: User, as: "Submitter", attributes: ["id", "firstName", "avatar"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({ submissions });
});

// ── Approve Submission ─────────────────────────────────────────────────────────
const approveSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id, submissionId } = req.params;

  const pub = await Publication.findByPk(id);
  if (!pub) return res.status(404).json({ message: "Publication not found" });
  if (pub.ownerId !== userId) return res.status(403).json({ message: "Not the owner" });

  const sub = await PublicationSubmission.findByPk(submissionId);
  if (!sub || sub.publicationId !== parseInt(id)) return res.status(404).json({ message: "Submission not found" });

  sub.status = "approved";
  sub.reviewNote = req.body.note || null;
  await sub.save();

  res.json({ message: "Submission approved", submission: sub });
});

// ── Reject Submission ──────────────────────────────────────────────────────────
const rejectSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id, submissionId } = req.params;

  const pub = await Publication.findByPk(id);
  if (!pub) return res.status(404).json({ message: "Publication not found" });
  if (pub.ownerId !== userId) return res.status(403).json({ message: "Not the owner" });

  const sub = await PublicationSubmission.findByPk(submissionId);
  if (!sub || sub.publicationId !== parseInt(id)) return res.status(404).json({ message: "Submission not found" });

  sub.status = "rejected";
  sub.reviewNote = req.body.note || null;
  await sub.save();

  res.json({ message: "Submission rejected", submission: sub });
});

// ── My Publications (owned) ────────────────────────────────────────────────────
const myPublications = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const pubs = await Publication.findAll({
    where: { ownerId },
    order: [["createdAt", "DESC"]],
  });

  res.json({ publications: pubs });
});

// ─── My Submission Status ──────────────────────────────────────────────────
const mySubmissions = asyncHandler(async (req, res) => {
  const submittedBy = req.user.id;

  const subs = await PublicationSubmission.findAll({
    where: { submittedBy },
    include: [
      {
        model: Publication,
        as: "Publication",
        attributes: ["id", "name", "slug", "logo"],
        required: false,
      },
      {
        model: BlogPost,
        as: "Post",
        attributes: ["id", "title", "headimg"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({ submissions: subs });
});

// ─── Publications I Follow ────────────────────────────────────────────────
const myFollowing = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const follows = await PublicationFollower.findAll({
    where: { userId },
    include: [{
      model: Publication,
      include: [{ model: User, as: "Owner", attributes: ["firstName", "avatar"] }],
    }],
    order: [["createdAt", "DESC"]],
  });

  res.json({ publications: follows.map(f => f.Publication).filter(Boolean) });
});

// ─── All Pending Submissions across my owned publications ───────────────────────
const allPendingSubmissions = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const ownedPubs = await Publication.findAll({ where: { ownerId }, attributes: ["id"] });
  const pubIds = ownedPubs.map(p => p.id);

  if (pubIds.length === 0) return res.json({ submissions: [] });

  const submissions = await PublicationSubmission.findAll({
    where: { publicationId: { [Op.in]: pubIds }, status: "pending" },
    include: [
      { model: Publication, as: "Publication", attributes: ["id", "name", "logo"] },
      { model: BlogPost, as: "Post", include: [{ model: User, attributes: ["firstName", "avatar"] }] },
      { model: User, as: "Submitter", attributes: ["id", "firstName", "avatar"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({ submissions });
});

module.exports = {
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
};
