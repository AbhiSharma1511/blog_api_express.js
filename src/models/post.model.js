import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
        type: String, 
        required: true 
    },
    description: {
        type: String, 
        required: true 
        },
    genre: {
        type: String,
        required: true,
        default: "all"
        },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images:{
        type: String, // cloudinary url are store
        required: true, 
        maxlength: 3 
    }, 
    likes: { 
        type: Number, 
        default: 0 
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        description: { 
            type: String, 
            required: true 
        },
      },
    ],
  },
  { timestamps: true }
);


export const Post = mongoose.model("Post", postSchema);