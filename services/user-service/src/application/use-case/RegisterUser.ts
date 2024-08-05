import { UserEntity } from '../../domain/entities/user';
import { UserRepository } from '../../infrastructure/repositories/user';

interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  dob: Date;
  address: string;
  phone: string;
  gender: string;
  qualification: string;
  profileImage: string;
  cv?: string;
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: RegisterUserRequest,email:string): Promise<UserEntity> {
    const date = new Date(request.dob);

    const user = new UserEntity(
      request.firstName,
      request.lastName,
      email,
      '',
      request.role,
      {
        avatar: request.profileImage,
        dateOfBirth: date,
        gender: request.gender
      },
      request.gender,
      {
        address: request.address,
        phone: request.phone,
        social: '',
      },
      request.qualification,
      request.cv 
    );
    user.profit = 0;
    user.isBlocked = false;
    if (request.role === 'student') {
      user.isVerified = true;
    } else {
      user.isVerified = false;
    }
    
    user.isGAuth = false;
    user.isRejected = false;
    
    return await this.userRepository.save(user);
  }
}
