"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const paymentRoute_1 = require("./presentation/routes/paymentRoute");
const paymentDb_1 = require("./infrastructure/database/paymentDb");
const createTable_1 = __importDefault(require("./infrastructure/database/createTable"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/payment', paymentRoute_1.router);
(0, paymentDb_1.StartPaymentDb)();
(0, createTable_1.default)();
app.listen(3005, () => {
    console.log('payment service running on port 3005 ');
});
