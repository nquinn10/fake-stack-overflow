const authRequired = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }
    next();
};

module.exports = { authRequired };