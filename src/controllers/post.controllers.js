import { Post } from "../models/post.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js"; // Import the function to upload images to Cloudinary

const createPost = asyncHandler(async (req, res) => {
  try {
    const { title, description, genre } = req.body;
    const userId = req.user._id;

    const cloudinaryUrls = [];

    // check where the post is already exist or not

    const existingPost = await Post.findOne({ title, userId });
    if (existingPost) {
      return res.status(400).json({ error: "Duplicate post" });
    }

    // for (const image of req.files?.images) {
    //   console.log(image);
    //   console.log(image?.path);
    // }

    for (const image of req.files?.images) {
      // console.log(image);
      var imagePath = image?.path;
      var cloudinaryResponse = await uploadOnCloudinary(imagePath);
      cloudinaryUrls.push(cloudinaryResponse.url);
    }

    console.log("Cloudinary URLs:", cloudinaryUrls);

    // Create a new post instance
    const newPost = new Post({
      title,
      description,
      genre,
      userId,
      images: cloudinaryUrls,
    });

    // Save the new post to the database
    const post = await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { createPost };
