const asyncHandler = require("express-async-handler");
const { BlogPost, User, Follow, SavedPost } = require("../models/authmodel");
const { catagories } = require("../models/functions");
const { Op } = require("sequelize");
const { cacheOrFetch, invalidateCache } = require("../service/redisclient");

// ─── Create Blog ─────────────────────────────────────────────────────────────
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, tags, featuredImage, slug: customSlug } = req.body;
  const userId = req.user.id;

  if (!title || !content || !userId) {
    throw new Error("Give title and content");
  }

  const createData = {
    title,
    content,
    userId,
    categories: Array.isArray(tags) ? tags : [],
    headimg: featuredImage || null,
    comments: [],
  };

  // If user provided a custom slug, use it (the model hook will still validate/dedup)
  if (customSlug && customSlug.trim()) {
    createData.slug = customSlug.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  const post = await BlogPost.create(createData);

  // Invalidate relevant caches
  await invalidateCache("featured", "popular", "categories", "latest:*", "cat:*", `profile:${userId}:*`);

  res.send({ post });
});

// ─── Get Blog By ID ───────────────────────────────────────────────────────────
const getBlogbyId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await cacheOrFetch(`post:${id}`, 600, async () => {
    const post = await BlogPost.findByPk(id, {
      include: {
        model: User,
        attributes: ["avatar", "firstName", "bio"],
      },
    });

    if (!post) return null;

    const allComments = Array.isArray(post.comments) ? post.comments : [];
    const initialComments = allComments.slice(0, 4);

    return {
      post: {
        ...post.toJSON(),
        comments: initialComments,
        totalComments: allComments.length,
      },
    };
  });

  if (!result) throw new Error("No blog found with that id");
  res.send(result);
});

// ─── Get Blog By Slug ─────────────────────────────────────────────────────────
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await cacheOrFetch(`post:slug:${slug}`, 600, async () => {
    const post = await BlogPost.findOne({
      where: { slug },
      include: {
        model: User,
        attributes: ["avatar", "firstName", "bio"],
      },
    });

    if (!post) return null;

    const allComments = Array.isArray(post.comments) ? post.comments : [];
    const initialComments = allComments.slice(0, 4);

    return {
      post: {
        ...post.toJSON(),
        comments: initialComments,
        totalComments: allComments.length,
      },
    };
  });

  if (!result) throw new Error("No blog found with that slug");
  res.send(result);
});

// ─── Get Comments (paginated ) ─────────────────────────────────────────────────
const getComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;

  const post = await BlogPost.findByPk(id);
  if (!post) return res.status(404).json({ message: "Post not found" });


  const allComments = Array.isArray(post.comments) ? post.comments : [];

  res.json({
    comments: allComments.slice(offset, offset + limit),
    totalComments: allComments.length,
    currentPage: page,
    totalPages: Math.ceil(allComments.length / limit),
  });
});

// ─── Get Categories (Redis cached 1 hour) ────────────────────────────────────
const getCatagories = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const allCats = await cacheOrFetch("categories", 3600, async () => {
    return await catagories();
  });

  res.send({ cata: allCats.slice(0, limit) });
});

// ─── Delete Post (legacy) ─────────────────────────────────────────────────────
const deletePost = asyncHandler(async (req, res) => {
  const postid = req.params.id;
  const post = await BlogPost.findByPk(postid);
  if (!post) return res.status(404).send({ error: "No post found" });
  const uid = post.userId;
  await post.destroy();
  await invalidateCache(`post:${postid}`, "featured", "popular", "categories", "latest:*", "cat:*", `profile:${uid}:*`);
  res.send({ message: "Post is deleted" });
});

// ─── Update Post (legacy) ─────────────────────────────────────────────────────
const updatePost = asyncHandler(async (req, res) => {
  const { title, content, catagories: cats } = req.body;
  const id = req.params.id;
  const updatedData = {};
  if (title) updatedData.title = title;
  if (content) updatedData.content = content;
  if (cats) updatedData.categories = Array.isArray(cats) ? cats : [cats]; // ✅ always array

  const [isUpdated] = await BlogPost.update(updatedData, { where: { id } });
  if (!isUpdated) return res.status(404).send({ message: "Blog does not exist" });
  await invalidateCache(`post:${id}`, "featured", "popular", "categories", "latest:*", "cat:*");
  res.send({ message: "Your blog is updated" });
});

// ─── Get Featured Posts ───────────────────────────────────────────────────────
const getFeaturedPosts = asyncHandler(async (req, res) => {
  const result = await cacheOrFetch("featured", 300, async () => {
    const postsToFeature = await BlogPost.findAll({
      where: { is_featured: false },
      include: [{ model: User, attributes: ["firstName", "avatar"] }],
      order: [
        ["likes", "DESC"],
        ["views", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: 2,
    });
    return { postsToFeature };
  });

  res.send(result);
});

// ─── Latest Stories ───────────────────────────────────────────────────────────
const latestStories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const result = await cacheOrFetch(`latest:p${page}:l${limit}`, 120, async () => {
    const { count, rows } = await BlogPost.findAndCountAll({
      where: { is_featured: false },
      include: [{ model: User, attributes: ["firstName", "avatar"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      stories: rows,
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  });

  res.send(result);
});

// ─── Get By Category ──────────────────────────────────────────────────────────
const getbyCatagory = asyncHandler(async (req, res) => {
  const { cat } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const result = await cacheOrFetch(`cat:${cat}:p${page}:l${limit}`, 180, async () => {
    const { count, rows } = await BlogPost.findAndCountAll({
      where: {
        categories: {
          [Op.contains]: [cat],
        },
      },
      include: [{ model: User, attributes: ["firstName", "avatar"] }],
      limit,
      offset,
    });

    return {
      stories: rows,
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  });

  res.send(result);
});

// ─── Profile (Redis cached 1 min) ───────────────────────────────────────────
const Profile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const result = await cacheOrFetch(`profile:${userId}:p${page}:l${limit}`, 60, async () => {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "Following",
          attributes: ["id", "firstName", "lastName", "avatar", "bio"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id", "firstName", "lastName", "avatar", "bio"],
          through: { attributes: [] },
        },
      ],
    });

    const { count, rows } = await BlogPost.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const allPostsForStats = await BlogPost.findAll({
      where: { userId },
      attributes: ["views", "likes"],
    });

    const totalViews = allPostsForStats.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = allPostsForStats.reduce((sum, p) => sum + (p.likes || 0), 0);

    return {
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      posts: rows,
      followersCount: user.followers,
      followersList: user.Followers || [],
      following: user.Following || [],
      totalViews,
      totalLikes,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
      },
    };
  });

  res.json(result);
});

// ─── Add Comment ──────────────────────────────────────────────────────────────
const addcomment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const authorid = req.user.id;
  const { author, text, avatar } = req.body;

  if (!author || !text || !avatar || !authorid) {
    return res.status(400).json({ message: "Missing required comment fields" });
  }

  const post = await BlogPost.findByPk(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

 
  const existingComments = Array.isArray(post.comments) ? post.comments : [];

  const newComment = {
    author,
    text,
    avatar,
    authorid,
    date: new Date().toISOString(),
  };

  const updatedComments = [...existingComments, newComment];

 
  post.comments = updatedComments;
  post.changed("comments", true); 
  await post.save();

  await invalidateCache(`post:${postId}`);

  res.json({ message: "Comment added", comments: updatedComments });
});

// ─── Follow User ──────────────────────────────────────────────────────────────
const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id);

  if (followerId === followingId) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  const existingFollow = await Follow.findOne({ where: { followerId, followingId } });
  if (existingFollow) {
    return res.status(400).json({ message: "Already following this user" });
  }

  await Follow.create({ followerId, followingId });

  const user = await User.findByPk(followingId);
  if (user) {
    user.followers += 1;
    await user.save();
  }

  res.json({ message: "Successfully followed user" });
});

// ─── Unfollow User ────────────────────────────────────────────────────────────
const unfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id);

  const follow = await Follow.findOne({ where: { followerId, followingId } });
  if (!follow) {
    return res.status(400).json({ message: "Not following this user" });
  }

  await follow.destroy();

  const user = await User.findByPk(followingId);
  if (user && user.followers > 0) {
    user.followers -= 1;
    await user.save();
  }

  res.json({ message: "Successfully unfollowed user" });
});

// ─── Check Follow ─────────────────────────────────────────────────────────────
const checkFollow = asyncHandler(async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id);

  const follow = await Follow.findOne({ where: { followerId, followingId } });
  res.json({ isFollowing: !!follow });
});

// ─── Like Increase ────────────────────────────────────────────────────────────
const Likeincrease = asyncHandler(async (req, res) => {
  const blogId = req.params.id;

  const post = await BlogPost.findByPk(blogId);
  if (!post) return res.status(404).json({ error: "Blog post not found" });

  post.likes += 1;
  await post.save();

  await invalidateCache(`post:${blogId}`, "featured", "popular");

  res.status(200).json({ message: "Like added", likes: post.likes });
});

// ─── Update Blog ──────────────────────────────────────────────────────────────
const UpdateBlog = asyncHandler(async (req, res) => {
  const { postid } = req.params;
  const { title, content, headimg, categories, slug: customSlug } = req.body;

  const blog = await BlogPost.findByPk(postid);
  if (!blog) return res.status(404).json({ message: "Blog post not found" });

  const oldSlug = blog.slug;

  blog.title = title;
  blog.content = content;
  blog.headimg = headimg;
  blog.categories = Array.isArray(categories) ? categories : [];

  // If user provided a custom slug, sanitize and set it
  if (customSlug !== undefined && customSlug.trim()) {
    blog.slug = customSlug.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }
  // Otherwise the model hook will auto-update slug if title changed

  await blog.save();

  await invalidateCache(`post:${postid}`, `post:slug:${oldSlug}`, `post:slug:${blog.slug}`, "featured", "popular", "categories", "latest:*", "cat:*");

  res.json({ message: "Blog post updated successfully", blog });
});

// ─── Delete Blog ──────────────────────────────────────────────────────────────
const DeleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await BlogPost.destroy({ where: { id } });

  if (deleted) {
    await invalidateCache(`post:${id}`, "featured", "popular", "categories", "latest:*", "cat:*");
    return res.json({ message: "Blog post deleted successfully" });
  } else {
    return res.status(404).json({ message: "Blog post not found" });
  }
});

// ─── Other Profile ────────────────────────────────────────────────────────────
const OtherProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  if (!id) return res.status(400).json({ message: "Give id" });

  const result = await cacheOrFetch(`profile:${id}:p${page}:l${limit}`, 180, async () => {
    const user = await User.findByPk(id);
    if (!user) return null;

    const { firstName, lastName, avatar, bio, followers } = user;

    const { count, rows } = await BlogPost.findAndCountAll({
      where: { userId: id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const allPostsForStats = await BlogPost.findAll({
      where: { userId: id },
      attributes: ["views", "likes"],
    });

    const totalViews = allPostsForStats.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = allPostsForStats.reduce((sum, p) => sum + (p.likes || 0), 0);

    return {
      firstName, lastName, avatar, bio, followers,
      posts: rows,
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalViews, totalLikes,
    };
  });

  if (!result) return res.status(404).json({ message: "User not found" });
  res.send(result);
});

// ─── Get Popular Posts ────────────────────────────────────────────────────────
const getPopularPosts = asyncHandler(async (req, res) => {
  const result = await cacheOrFetch("popular", 300, async () => {
    const posts = await BlogPost.findAll({
      include: [{ model: User, attributes: ["firstName", "avatar"] }],
      order: [
        ["views", "DESC"],
        ["likes", "DESC"],
      ],
      limit: 4,
    });
    return { posts };
  });

  res.json(result);
});

// ─── Save Post ─────────────────────────────────────────────────────
const savePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  const [, created] = await SavedPost.findOrCreate({ where: { userId, postId } });
  res.json({ saved: true, message: created ? "Post saved" : "Already saved" });
});

// ─── Unsave Post ───────────────────────────────────────────────────
const unsavePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  await SavedPost.destroy({ where: { userId, postId } });
  res.json({ saved: false, message: "Post unsaved" });
});

// ─── Check If Post Is Saved ───────────────────────────────────────────
const checkSavedPost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  const existing = await SavedPost.findOne({ where: { userId, postId } });
  res.json({ saved: !!existing });
});

// ─── Get All Saved Posts (paginated) ─────────────────────────────────
const getSavedPosts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const total = await SavedPost.count({ where: { userId } });
  const saved = await SavedPost.findAll({
    where: { userId },
    include: [{
      model: BlogPost,
      as: "Post",
      include: [{ model: User, attributes: ["firstName", "avatar"] }],
    }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    posts: saved.map(s => s.Post).filter(Boolean),
    totalPosts: total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: page,
  });
});

// ─── Increment Views ──────────────────────────────────────────────────────────
const incrementViews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await BlogPost.findByPk(id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.views += 1;
  await post.save();

  res.json({ views: post.views });
});

module.exports = {
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
};