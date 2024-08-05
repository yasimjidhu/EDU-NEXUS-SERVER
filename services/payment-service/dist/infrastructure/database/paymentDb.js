"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartPaymentDb = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const dbConfig = {
    user: 'psql',
    host: 'localhost',
    database: 'payments',
    password: process.env.PAYMENTS_DB_PASSWORD,
    port: 5432,
};
const pool = new pg_1.Pool(dbConfig);
const StartPaymentDb = async () => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL database');
    }
    catch (error) {
        console.error('Error connecting to PostgreSQL database:', error.message);
    }
};
exports.StartPaymentDb = StartPaymentDb;
exports.default = pool;
