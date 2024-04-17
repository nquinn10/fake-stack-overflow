// middleware to ensure user has admin status for post moderation
const adminRequired = (req, res, next) => {
    if (!req.user || !req.user.is_moderator) {
        // note: use 403 error, user authenticates but doesn't have required privileges
        return res.status(403).json({ message: "Access denied. Administrators only." });
    }
    next();
};

module.exports = { adminRequired };