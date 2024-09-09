import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { RegisterUserUseCase } from '../../../application/use-case/RegisterUser';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/UserImpl';
import { AuthorizeUserUseCase } from '../../../application/use-case/AuthorizeUser';
import { ProfileUseCase } from '../../../application/use-case/ProfileUseCase';
import { AuthService } from '../../../adapters/services/verfiyAccessToken';
import authMiddleware from '../middlewares/authenticationMiddleware';
import { adminMiddleware } from '../middlewares/authorizationMiddleware';



const router = Router();


const userRepository: UserRepositoryImpl = new UserRepositoryImpl();

const authService = new AuthService()

const registerUserUseCase = new RegisterUserUseCase(userRepository);
const authorizeUserUsecase = new AuthorizeUserUseCase(userRepository)
const profileUseCase = new ProfileUseCase(userRepository)

const userController = new UserController(registerUserUseCase, authorizeUserUsecase, profileUseCase, authService);

router.post('/register', userController.registerUserHandler.bind(userController));
router.put('/update/:email',authMiddleware, userController.updateUserDetails.bind(userController));
router.post('/save-stripe-id/:userId',userController.saveStripeId.bind(userController))

router.post('/approve',authMiddleware,adminMiddleware,userController.approveInstructorHandler.bind(userController))
router.post('/reject',authMiddleware,adminMiddleware, userController.rejectInstructorHandler.bind(userController))

router.post('/block',authMiddleware,adminMiddleware, userController.blockUser.bind(userController))
router.post('/unblock',authMiddleware,adminMiddleware, userController.unBlockUser.bind(userController))

router.get('/getUser', userController.getUserHandler.bind(userController))
router.get('/getAllUsers', userController.getAllUsers.bind(userController))
router.get('/getInstructors', userController.getAllInstructors.bind(userController))
router.get('/verifiedInstructors', userController.getVerifiedInstructors.bind(userController))
router.get('/unVerifiedInstructors', userController.getUnVerifiedInstructors.bind(userController))

router.post('/feedback',authMiddleware, userController.submitFeedback.bind(userController))
router.get('/feedbacks', userController.getFeedbacks.bind(userController))

export default router;
