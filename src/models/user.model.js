import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url storing
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    role: { 
        type: String, 
        enum: ["admin", "reader"], 
        default: "reader" 
    }, // Role field
    posts: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Post" 
        }
    ],
    comments: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment"
        }
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
