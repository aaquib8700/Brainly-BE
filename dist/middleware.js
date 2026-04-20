import jwt from "jsonwebtoken";
export const userMiddlware = (req, res, next) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header, process.env.JWT_SECRET);
    if (decoded) {
        // @ts-ignore
        req.userId = decoded.id;
        next();
    }
    else {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
};
//# sourceMappingURL=middleware.js.map