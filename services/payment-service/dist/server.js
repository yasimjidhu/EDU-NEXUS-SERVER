"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const paymentRoute_1 = require("./presentation/routes/paymentRoute");
const paymentDb_1 = require("./infrastructure/database/paymentDb");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};
app.use((0, cors_1.default)(corsOptions));
app.use('/payment', paymentRoute_1.router);
(0, paymentDb_1.StartPaymentDb)();
app.listen(3005, () => {
    console.log('payment service running on port 3005 ');
});
