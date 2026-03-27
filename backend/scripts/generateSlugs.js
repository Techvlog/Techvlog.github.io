/**
 * One-time migration script to generate slugs for existing blog posts.
 * Run with: node scripts/generateSlugs.js
 */
require("dotenv").config();
const sequelize = require("../models/root");
const { BlogPost } = require("../models/authmodel");

const generateSlug = (title) => {
  return (title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
};

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    const posts = await BlogPost.findAll({ where: { slug: null } });
    console.log(`Found ${posts.length} posts without slugs`);

    const usedSlugs = new Set();
    // Pre-load existing slugs
    const existing = await BlogPost.findAll({
      where: { slug: { [require("sequelize").Op.ne]: null } },
      attributes: ["slug"],
    });
    existing.forEach((p) => usedSlugs.add(p.slug));

    for (const post of posts) {
      let slug = generateSlug(post.title);
      
      // Ensure uniqueness
      if (usedSlugs.has(slug)) {
        const suffix = Math.random().toString(36).substring(2, 7);
        slug = `${slug}-${suffix}`;
      }

      usedSlugs.add(slug);
      post.slug = slug;
      await post.save({ hooks: false }); // skip hooks since we're setting slug manually
      console.log(`  ✔ Post #${post.id}: "${post.title}" → ${slug}`);
    }

    console.log(`\n✅ Done! Generated slugs for ${posts.length} posts.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
