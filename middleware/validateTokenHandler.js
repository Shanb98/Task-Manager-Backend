const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if(authHeader && authHeader.startsWith("Bearer")){
    //splitting the token in to two parts with the space and taking the second part which includes the token
    token = authHeader.split(" ")[1];
    
    //verifying the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            res.status(401);
            throw new Error("User is not autherized");
        }

        //if the user is autherized
        //take the info of the user and storing it in req.user
        req.user = decoded.user;
        console.log(req.user);
        //append in the request body
        next();
    });

    if (!token) {
        res.status(401);
        throw new Error("User is not authorized or token is missing");
      }   
}
});

module.exports = validateToken;