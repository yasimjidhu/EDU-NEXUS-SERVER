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
    user: process.env.POSTGRESS_DB_USER,
    host: 'localhost',
    database: process.env.PAYMENTS_DB_NAME,
    password: process.env.PAYMENTS_DB_PASSWORD,
    port: process.env.POSTGRESS_DB_PORT ? parseInt(process.env.POSTGRESS_DB_PORT, 10) : 5432,
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
