/**
 * Sukuriamas JWT naudojant vartotojo vardą ir ID. Taip pat tokenas yra užšifruoajmas
 */
const { sign, verify } = require("jsonwebtoken");
const createTokens = (user) => {
    const accessToken = sign(
        { username: user.username, id: user.id },
        "lukaskaralis"
    );

    return accessToken;
};

/**
 * Paimamas JWT iš slapukų, pavadinimu "access-token". Tada tikrinama ar yra gautas JWT
 * jei nebuvo gautas, rodoma klaida, kad naudotojas yra neautentifikuotas. Toliau vykdomas
 * tokeno patvirtinimas ir dekodavimas ir vykdymas tęsiamas į kita maršrutą "next();".
 */
const validateToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"];

    if (!accessToken) {
        return res.status(400).json({ error: "Naudotojas neautentifikuotas" });
    }

    try {
        const decodedToken = verify(accessToken, "lukaskaralis");
        req.user = decodedToken;
        return next();
    } catch (err) {
        return res.status(400).json({ error: 'Blogas tokenas' });
    }
};

module.exports = { createTokens, validateToken };