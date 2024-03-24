import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        postId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        description: { 
            type: String, 
            required: true 
        },
               
    },
    {timestamps: true}
  );

  export  const Comments = mongoose.model("Comments", commentSchema);