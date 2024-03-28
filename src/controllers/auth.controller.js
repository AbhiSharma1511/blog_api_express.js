import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user)
      throw new ApiError(
        500,
        "In generateAccessAndRefreshToken: user does not find"
      );

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    console.log("Access Token: ",accessToken);
    console.log("Refresh Token: ",refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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

const loginUser = asyncHandler(async(req, res)=>{

  // const currentUser = await User.findById(req.user._id);
  // if(currentUser) throw new ApiError(400, "User already loggedIn!");

  const {email, username, password} = req.body;

  if(!username && !email){
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne(
    {
      $or:[{username},{email}]
    }
  );

  if(!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) throw new ApiError(404, "Invalid user credentials");

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(" -password -refreshToken");

  const option={
    httpOnly: true,
    secure: true
  };

  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", refreshToken, option)
  .json(
    new ApiResponse(
      200,
      {
        user : loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  );
});

export { registerUser, loginUser };
