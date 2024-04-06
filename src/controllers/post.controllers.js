import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
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
      console.log(image);
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

    // now update the admin data in user database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { posts: post._id } }, // Add the postId to the user's posts array
      { new: true } // Return the updated user data
    );

    if (!updatedUser) {
      // Handle the case where the user is not found
      return res.status(404).json({ error: "User not found" });
    } else {
      console.log("admin data is updated");
    }

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const getAllPost = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in fetching post: ", error.message);
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const getGenrePost = asyncHandler(async (req, res) => {
  try {
    const  genre  = req.query.genre;  // ?genre=science
    // Fetch posts of the specified genre from the database
    const posts = await Post.find({ genre: genre });
    // Check if no posts of the specified genre are found
    if (!posts || posts.length === 0) {
      return res
        .status(404)
        .json({ message: `No posts found for genre ${genre}` });
    }

    // Return the genre-specific posts as JSON data in the response
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in fetching genre post: ", error.message);
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const getAllPostsOfLoggedAdmin = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ userId: userId });
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    console.log(`Total posts are: ${posts.length} posted by you`);
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in fetching post: ", error.message);
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const getMostLikedPost = asyncHandler(async (req, res) => {
  try {
    // Fetch most liked posts from the database and sort them by the 'likes' field in descending order
    const mostLikedPosts = await Post.find().sort({ likes: -1 }).limit(10); // Adjust the limit as needed

    if (!mostLikedPosts || mostLikedPosts.length === 0) {
      return res.status(404).json({ message: "No most liked posts found" });
    }

    return res.status(200).json(mostLikedPosts);
  } catch (error) {
    console.log("Error in fetching most liked posts: ", error.message);
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const getLatestPost = asyncHandler(async (req, res) => {
  try {
    // Get the number of posts to fetch from the query parameter
    const { limit = 10 } = req.query;

    // Parse the limit value to an integer
    const limitNumber = parseInt(limit, 10);

    // Query the database for the latest posts, limiting the results
    const latestPosts = await Post.find()
      .sort({ createdAt: -1 }) // Sort posts by creation date in descending order
      .limit(limitNumber); // Limit the number of results

    // Send the latest posts as a JSON response
    res.status(200).json(latestPosts);
  } catch (error) {
    // Handle errors
    console.error('Error fetching latest posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const deletePost = asyncHandler(async(req, res)=>{});

const getSpecificPost = asyncHandler(async(req, res)=>{

  const postId = req.query._id;  // post?_id=66071108827c002924ac7ec9
    try {
      const post = await Post.findById(postId);
      if (!post || post.length === 0) {
        return res.status(404).json({ message: "No posts found" });
      }
      return res.status(200).json(post);
    } catch (error) {
      console.log("Error in fetching post: ", error.message);
      return res.status(500).json(new ApiResponse(500, {}, error.message));
    }
})


export { createPost, getAllPost, getGenrePost, getAllPostsOfLoggedAdmin, getMostLikedPost, getLatestPost, deletePost, getSpecificPost };
