import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, "", "User logged out."));
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log(decodeToken);

    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken1"
    );

    if (!user) throw new ApiError(401, "Invalid access token2");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

export const isLoggedIn = (req, res, next) => {
    // Check if user is authenticated (e.g., by checking if access token exists in cookies or headers)
    if (req.cookies.accessToken) {
      // User is logged in
      console.log("You are loggedIn.");
      next(); // Proceed to the next middleware or route handler
    } else {
      // User is not logged in
      res.status(401).json({ message: "You have to login first" }); // Respond with unauthorized status
    }
};

export const isAdmin = asyncHandler(async(req, res, next)=>{
    if (req.user && req.user.role === 'admin') {
      console.log("You are admin");
      next();
    } else {
      console.log(req.user.role);
      return res.status(403).json({ success: false, error: 'Unauthorized request!!, you are not admin' });
    }
})


//   export { verifyJwt, isLoggedIn };
