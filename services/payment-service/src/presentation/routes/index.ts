import { Router } from "express";
import paymentRouter from './paymentRoute'
import PayoutRouter from './payoutRoutes'

const router = Router();

router.use('/', paymentRouter); 
router.use('/payouts', PayoutRouter); 

export default router;
