// middleware to ensure user has admin status for post moderation
const User = require("../models/users");

const adminRequired = async (req, res, next) => {
    const userId = req.session.userId;
   
    const user = await User.findById(userId);

    if (!user || !user.is_moderator) {
        // note: use 403 error, user authenticates but doesn't have required privileges
        return res.status(403).json({ message: "Access denied. Administrators only." });
    }

    next();

};

module.exports = { adminRequired };