import express from 'express';
import { Router } from "express";
import paymentRouter from './paymentRoute'
import PayoutRouter from './payoutRoutes'
import bodyParser from 'body-parser';

const router = Router();

// Apply raw body parser only to the Stripe webhook route
router.use('/payouts/webhook', bodyParser.raw({ type: 'application/json' }));

// Use regular JSON and URL-encoded parsers for other routes
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Apply other routers
router.use('/payouts', PayoutRouter);
router.use('/', paymentRouter);

export default router;
