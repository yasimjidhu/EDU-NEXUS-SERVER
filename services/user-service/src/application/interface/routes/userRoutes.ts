import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { RegisterUserUseCase } from '../../use-case/RegisterUser';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/UserImpl';
import { AuthorizeUserUseCase } from '../../use-case/AuthorizeUser';
import { ProfileUseCase } from '../../use-case/ProfileUseCase';
import { AuthService } from '../../../adapters/services/verfiyAccessToken';



const router = Router();


const userRepository: UserRepositoryImpl = new UserRepositoryImpl();

const authService = new AuthService()

const registerUserUseCase = new RegisterUserUseCase(userRepository);
const authorizeUserUsecase = new AuthorizeUserUseCase(userRepository)
const profileUseCase = new ProfileUseCase(userRepository)

const userController = new UserController(registerUserUseCase,authorizeUserUsecase,profileUseCase,authService);

router.post('/register',userController.registerUserHandler.bind(userController));

router.post('/approve',userController.approveInstructorHandler.bind(userController))
router.post('/reject',userController.rejectInstructorHandler.bind(userController))

router.post('/block',userController.blockUser.bind(userController))
router.post('/unblock',userController.unBlockUser.bind(userController))

router.get('/getUser',userController.getUserHandler.bind(userController))
router.get('/getAllUsers',userController.getAllUsers.bind(userController))
router.get('/getInstructors',userController.getAllInstructors.bind(userController))
router.get('/verifiedInstructors',userController.getVerifiedInstructors.bind(userController))
router.get('/unVerifiedInstructors',userController.getUnVerifiedInstructors.bind(userController))

export default router;
