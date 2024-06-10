"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (roles) => {
    return (req, res, next) => {
        var _a;
        if (((_a = req.userData) === null || _a === void 0 ? void 0 : _a.role) && roles.includes(req.userData.role)) {
            next();
        }
        else {
            return res.status(403).json({ message: 'Authorization failed' });
        }
    };
};
exports.authorize = authorize;
