// middleware to ensure user has admin status for post moderation
const adminRequired = (req, res, next) => {
    if (!req.user.is_moderator) {
        return res.status(401).json({ message: "Access denied. Administrators only." });
    }
    next();
};

module.exports = { adminRequired };