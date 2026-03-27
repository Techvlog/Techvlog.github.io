const sequelize = require("./root");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,  // TEXT is more appropriate for bios in Postgres
    },
    followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const BlogPost = sequelize.define("BlogPost", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true, // null until hook runs
  },
  headimg: {
    type: DataTypes.TEXT,
  },
  firstimg: {
    type: DataTypes.TEXT,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  comments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    get() {
      const raw = this.getDataValue("comments");
      return Array.isArray(raw) ? raw : [];
    },
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  hooks: {
    beforeValidate: async (post) => {
      // Only auto-generate slug if not explicitly set or if title changed
      if (!post.slug || post.changed("title")) {
        const baseSlug = (post.title || "untitled")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
          .replace(/\s+/g, "-")           // spaces to hyphens
          .replace(/-+/g, "-")            // collapse multiple hyphens
          .replace(/^-|-$/g, "")          // trim leading/trailing hyphens
          .slice(0, 80);                   // max 80 chars

        // Check for existing slugs and append suffix if needed
        const existing = await BlogPost.findOne({ where: { slug: baseSlug } });
        if (existing && existing.id !== post.id) {
          const suffix = Math.random().toString(36).substring(2, 7);
          post.slug = `${baseSlug}-${suffix}`;
        } else {
          post.slug = baseSlug;
        }
      }
    },
  },
});

User.hasMany(BlogPost, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
BlogPost.belongsTo(User, {
  foreignKey: "userId",
});

const Photo = sequelize.define("Photo", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Follow = sequelize.define("Follow", {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,   // ✅ Explicit FK references for Postgres integrity
      key: "id",
    },
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.belongsToMany(User, {
  as: "Followers",
  through: Follow,
  foreignKey: "followingId",
  otherKey: "followerId",
});
User.belongsToMany(User, {
  as: "Following",
  through: Follow,
  foreignKey: "followerId",
  otherKey: "followingId",
});


// ─── SavedPost junction table ────────────────────────────────────────────────
const SavedPost = sequelize.define("SavedPost", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: BlogPost, key: "id" },
  },
}, {
  indexes: [{ unique: true, fields: ["userId", "postId"] }],
});

// Associations
SavedPost.belongsTo(BlogPost, { foreignKey: "postId", as: "Post" });
BlogPost.hasMany(SavedPost, { foreignKey: "postId" });
SavedPost.belongsTo(User, { foreignKey: "userId" });
User.hasMany(SavedPost, { foreignKey: "userId" });

// Auto-create/alter tables for new columns
sequelize.sync({ alter: true }).catch(() => {});
SavedPost.sync({ force: false }).catch(console.error);

// ─── Publication ─────────────────────────────────────────────────────────────
const Publication = sequelize.define("Publication", {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.TEXT },
  coverImage: { type: DataTypes.TEXT },
  logo: { type: DataTypes.TEXT },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  followersCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// ─── Publication Follower ─────────────────────────────────────────────────────
const PublicationFollower = sequelize.define("PublicationFollower", {
  userId:        { type: DataTypes.INTEGER, allowNull: false },
  publicationId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [{ unique: true, fields: ["userId", "publicationId"] }],
});

// ─── Publication Submission ───────────────────────────────────────────────────
const PublicationSubmission = sequelize.define("PublicationSubmission", {
  publicationId: { type: DataTypes.INTEGER, allowNull: false },
  postId:        { type: DataTypes.INTEGER, allowNull: false },
  submittedBy:   { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  reviewNote: { type: DataTypes.TEXT },
}, {
  indexes: [{ unique: true, fields: ["publicationId", "postId"] }],
});

// Publication associations
Publication.belongsTo(User, { foreignKey: "ownerId", as: "Owner" });
User.hasMany(Publication, { foreignKey: "ownerId", as: "OwnedPublications" });

PublicationFollower.belongsTo(Publication, { foreignKey: "publicationId" });
PublicationFollower.belongsTo(User, { foreignKey: "userId" });
Publication.hasMany(PublicationFollower, { foreignKey: "publicationId" });

PublicationSubmission.belongsTo(Publication, { foreignKey: "publicationId" });
PublicationSubmission.belongsTo(BlogPost, { foreignKey: "postId", as: "Post" });
PublicationSubmission.belongsTo(User, { foreignKey: "submittedBy", as: "Submitter" });
Publication.hasMany(PublicationSubmission, { foreignKey: "publicationId" });
BlogPost.hasOne(PublicationSubmission, { foreignKey: "postId" });

// Sync new tables
Publication.sync({ force: false }).catch(console.error);
PublicationFollower.sync({ force: false }).catch(console.error);
PublicationSubmission.sync({ force: false }).catch(console.error);

module.exports = {
  User,
  BlogPost,
  Photo,
  Follow,
  SavedPost,
  Publication,
  PublicationFollower,
  PublicationSubmission,
};