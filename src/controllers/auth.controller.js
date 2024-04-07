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

    // console.log("Access Token: ", accessToken);
    // console.log("Refresh Token: ", refreshToken);

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

// for automatically generate unique username with the help of email
const generateUniqueUsername = async (email) => {
  const username = email.split("@")[0];
  let uniqueUsername = "";
  let unique = true;

  do {
    const randomString = Math.random().toString(36).substring(2, 6);
    uniqueUsername = `${username}_${randomString}`;
    unique = await User.findOne({ username: uniqueUsername });
  } while (unique);

  if(uniqueUsername === ""){
    console.log('Username is null');
  }

  return uniqueUsername;
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  console.log("Body: ", req.body);

  // Generate a unique username from the email
  const username = await generateUniqueUsername(email);
  console.log(username);

  // Check if any of the required fields are empty
  if ([username, fullName, email, password].some((field) => typeof field === 'string' && field.trim() === "")) {
    console.log("error error error");
    throw new ApiError(400, "All fields are required");
  }

  try {

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ApiResponse(409, existingUser, "User alerady existed!");
    }

    // Create a new user
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

    // Retrieve the newly created user from the database
    const newuser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!newuser) {
      throw new ApiError(500, "Something went wrong while creating new user");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, newuser, "User registered successfully"));
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user:", Error: error });
  }
});


const loginUser = asyncHandler(async (req, res) => {
  // const currentUser = await User.findById(req.user._id);
  // if(currentUser) throw new ApiError(400, "User already loggedIn!");

  const { email, username, password } = req.query;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(404, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, { user }, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used");

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.messae);
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
