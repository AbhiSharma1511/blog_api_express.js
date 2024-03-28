import { jwt } from "jsonwebtoken";

const generateAccessToken = function(_id, email, username, fullName){
    try {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName,
            }, 
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
    } catch (error) {
        console.log("Error in access token:", error);
        return;
    }
};

const generateRefreshToken = function (_id, emial, username, fullName) {
    try {
      return jwt.sign(
        {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullName: this.fullName,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
      );
    } catch (error) {
      console.log("Error in Access Token: ", error.message);
      return;
    }
  };

  export {generateAccessToken, generateRefreshToken}