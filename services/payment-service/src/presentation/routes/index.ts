import express from 'express';
import { Router } from "express";
import paymentRouter from './paymentRoute'
import PayoutRouter from './payoutRoutes'
import bodyParser from 'body-parser';

const router = Router();

// Use regular JSON and URL-encoded parsers for other routes
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Apply other routers
router.use('/', paymentRouter);
router.use('/payouts', PayoutRouter);

export default router;
