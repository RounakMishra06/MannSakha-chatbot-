// import jwt from "jsonwebtoken"
// const isAuth = async (req,res,next) => {

//     try {
//         let {token} = req.cookies
//         if(!token){
//             res.status(400).json({message:"user doesn't have a token"})
//         }
//         let verifyToken = jwt.verify(token,process.env.JWT_SECRET)
//         if(!verifyToken){
//             res.status(400).json({message:"user doesn't have a Validtoken"})
//         }
//         req.userId = verifyToken.userId
//         next()

//     } catch (error) {
//         res.status(500).json({message:`isAuth error ${error}`})
        
//     }
    
// }
// export default isAuth


import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let { token } = req.cookies;

    if (!token) {
      return res.status(400).json({ message: "User doesn't have a token" });
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "User doesn't have a valid token" });
    }

    req.userId = verifyToken.userId;
    next();

  } catch (error) {
    return res.status(500).json({ message: `isAuth error: ${error.message}` });
  }
};

export default isAuth;
