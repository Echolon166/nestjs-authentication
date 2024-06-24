import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private dummyUsers = [
    {
      username: 'Erdem',
      email: 'erdem@test',
      verificationToken: 'ASD',
      isVerified: false,
    },
    {
      username: 'Erdem2',
      email: 'erdem2@test',
      verificationToken: 'ASD2',
      isVerified: false,
    },
    {
      username: 'Erdem3',
      email: 'erdem3@test',
      verificationToken: 'ASD3',
      isVerified: true,
    },
  ]; // TODO: Connect to database

  verifyEmail(username: string, verificationToken: string) {
    const user = this.dummyUsers.find((user) => user.username === username);

    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified === true)
      throw new BadRequestException('User already verified');
    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('Invalid verification token');

    user.isVerified = true;
    return 'User successfully verified';
  }

  checkVerification(username: string) {
    const user = this.dummyUsers.find((user) => user.username === username);

    if (!user) throw new NotFoundException('User not found');

    return user.isVerified ? 'User is verified' : 'User is not verified';
  }

  register(createUserDto: CreateUserDto) {
    const verificationToken = 'TEST'; // TODO: should be a random alphanumeric value
    const newUser = {
      ...createUserDto,
      verificationToken: verificationToken,
      isVerified: false,
    };

    // TODO: Send verification e-mail

    this.dummyUsers.push(newUser);
    return newUser;
  }
}
