const jwt = require("jsonwebtoken");
const { Users } = require("../models/Users")
const verifyTokenAndUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token is missing or malformed." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await Users.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }
        console.log(decoded.isAdmin)
        req.user = user;
        req.isAdmin = decoded.isAdmin
        req.token = token
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports =  verifyTokenAndUser ;
