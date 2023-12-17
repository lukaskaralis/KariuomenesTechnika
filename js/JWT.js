const { sign, verify } = require("jsonwebtoken");

const createTokens = (user) => {
    const accessToken = sign(
        { username: user.username, id: user.id },
        "lukaskaralis"
    );

    return accessToken;
};


const validateToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"];

    if (!accessToken) {
        return res.status(400).json({ error: "User not Authenticated!" });
    }

    try {
        const decodedToken = verify(accessToken, "lukaskaralis");
        req.user = decodedToken;  // Set req.user with the decoded token payload
        return next();
    } catch (err) {
        return res.status(400).json({ error: 'Invalid token' });
    }
};

module.exports = { createTokens, validateToken };