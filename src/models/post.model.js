import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      default: "all",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you reference the User model for the userId field
      required: true,  // but only admin role user can create the post
    },
    images: {
      type: [String], // Array of cloudinary image URLs
      required: true,
      maxlength: 3,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",  // this user can be the both like admin or reader
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);
export const Post = mongoose.model("Post", postSchema);
