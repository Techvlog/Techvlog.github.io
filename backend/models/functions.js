const { BlogPost } = require("./authmodel");
const catagories = async () => {
  const posts = await BlogPost.findAll({
    attributes: ["categories"],
  });

  const allCategories = [];

  for (const post of posts) {
    const raw = post.categories;

    if (!raw) continue;

   
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
       
          allCategories.push(...parsed);
        } else if (typeof parsed === "string") {
      
          allCategories.push(...parsed.split(",").map((c) => c.trim()));
        }
      } catch (e) {
        // Fallback: maybe just a plain comma-separated string
        allCategories.push(...raw.split(",").map((c) => c.trim()));
      }
    }

    // Case 3: already an array (ideal case)
    else if (Array.isArray(raw)) {
      allCategories.push(...raw);
    }
  }

  // Now count frequencies
  const frequencyMap = {};
  for (const cat of allCategories) {
    const cleaned = cat.trim().toLowerCase();
    if (!cleaned) continue;
    frequencyMap[cleaned] = (frequencyMap[cleaned] || 0) + 1;
  }

  // Convert to sorted array
  const sortedCategories = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
    .map(([name]) => name); // Get only category names
  return sortedCategories;
};
module.exports = {
    catagories,
};
