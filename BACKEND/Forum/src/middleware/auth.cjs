const jwt = require("jsonwebtoken");
const { TOKEN_KEY } = process.env;

const verifyToken = async (req, res, next) => {
    //const token = req?.body?.token || req?.query?.token || req?.headers?.["x-access-token"];

    const token = req.cookies.token
    console.log('Auth middleware - Token present:', !!token);
    console.log('Auth middleware - Request URL:', req.originalUrl);
    console.log('Auth middleware - All cookies:', Object.keys(req.cookies));
    
    if (!token) {
        console.log('Auth middleware - No token found, returning 403');
        return res.status(403).send("An authentication token is required!");
    }

    //verify token
    try {
        const decodedToken = jwt.verify(token, TOKEN_KEY);
        req.currentUser = decodedToken;
        console.log('Auth middleware - Token valid for user:', decodedToken.username);
        next();
    } catch (error) {
        console.log('Auth middleware - Invalid token, returning 401:', error.message);
        return res.status(401).send("Invalid Token provided!");
    }

    //proceed with request
    
};

module.exports = verifyToken;