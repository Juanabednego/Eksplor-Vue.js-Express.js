import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Tetap mengacu ke userModel.js
import asyncHandler from "express-async-handler";

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id);

            if (!req.user) {
                res.status(401);
                throw new Error('Pengguna tidak ditemukan, token tidak valid.');
            }
            next();
        } catch (e) {
            console.error('Auth Error (Token Invalid/Expired):', e.message);
            res.status(401);
            throw new Error('Tidak Diotorisasi, token tidak valid atau kedaluwarsa.');
        }
    } else {
        res.status(401);
        throw new Error('Tidak Diotorisasi, tidak ada token.');
    }
});

// Middleware untuk otorisasi berdasarkan role (tetap saya sediakan, tapi tidak akan digunakan di route order/pipa/lapangan jika Anda pakai adminMiddleware)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error('Anda tidak memiliki izin untuk mengakses rute ini.');
    }
    next();
  };
};

// ***ADMIN MIDDLEWARE DIKEMBALIKAN***
export const adminMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403); // Forbidden
        throw new Error('Tidak diotorisasi: Anda tidak memiliki izin Admin.');
    }
});