import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";

const updateLike = asyncHandler(async (req, res) => {
  //   const userId = req.query.userId;
  //   const postId = req.query.postId;
  const userId = req.body.userId;
  const postId = req.body.postId;

  try {
    if (!userId || !postId) {
      throw new ApiError(404, "Id not found");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const index = user.likeposts.indexOf(postId);

    if (index === -1) {
      // If postId is not in likePosts array, add it
      user.likeposts.push(postId);
    } else {
      // If postId is already in likePosts array, remove it
      user.likeposts.splice(index, 1);
    }

    // Save the updated user document
    const updatedUser = await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Post added successfully in LikePost")
      );
  } catch (error) {
    throw new ApiError(400, "Post is not addedd!!!", error);
  }
});
const updateSave = asyncHandler(async (req, res) => {
  //   const userId = req.query.userId;
  //   const postId = req.query.postId;
  const userId = req.body.userId;
  const postId = req.body.postId;

  try {
    if (!userId || !postId) {
      throw new ApiError(404, "Id not found");
    }
    // check postId and UserId exist in the database...
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      throw new ApiError(404, "Post/User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { saveposts: postId } }, // Using $addToSet to avoid duplicate postId
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Post added successfully in LikePost")
      );
  } catch (error) {
    throw new ApiError(400, "Post is not addedd!!!");
  }
});
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    if(!users){
      return new ApiResponse(400,null,"No User List found!");
    }
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new ApiError(400, "User List not fetch!", error.message);
  }
});

export { updateLike, updateSave, getAllUsers };
