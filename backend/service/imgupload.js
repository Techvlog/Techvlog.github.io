const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const express = require("express");
const router = express.Router();
const { Photo } = require("../models/authmodel");
const streamifier = require("streamifier");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });
router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("No image uploaded.");
  const { title } = req.body;
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer into readable stream and pipe to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.json({
      message: "Image uploaded successfully!",
      filepath: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed.");
  }
});
router.get("/getimg/:id", async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ message: "Not found" });

    res.send({
      photo,
    });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving photo" });
  }
});
module.exports = router;
