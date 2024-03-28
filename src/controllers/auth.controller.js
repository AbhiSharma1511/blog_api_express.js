import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, role } = req.body;
  console.log("Body: ", req.body);

  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    console.log("error error error");
    throw new ApiError(400, "All feilds are required");
  }

  try {
    // Check if the username or email is already taken
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ApiResponse(409,existingUser,"User alerady existed!");
    }

    // checking the field for empty values

    let newUser;
    if (role === "admin") {
      newUser = new User({
        username,
        fullName,
        email,
        password,
        role: "admin",
        posts: [], // Admin users initially have an empty posts array
      });
    } else {
      // console.log("error1 error1 error1");
      newUser = new User({
        username,
        fullName,
        email,
        password,
        role: "reader",
      });
    }
    // Save the new user to the database

    await newUser.save();
    const newuser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!newuser) {
      throw new ApiError(500, "Somthing went wrong while creating new user");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, newuser, "User registered successfully"));
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user:", Error: error });
  }
});

export { registerUser };
