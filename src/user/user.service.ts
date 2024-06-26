import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { generateAlphanumeric } from 'src/utils/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Register user to the database
   **/
  async register(createUserDto: CreateUserDto) {
    // Generate verificationToken
    const verificationToken = generateAlphanumeric(6);
    const newUser = {
      ...createUserDto,
      verificationToken: verificationToken,
      isVerified: false,
    };

    // Create user in database
    await this.databaseService.user.create({ data: newUser });
    // Send verification mail to user's email
    await this.mailService.sendVerification(
      newUser.username,
      newUser.email,
      newUser.verificationToken,
    );

    return 'User successfully registered';
  }

  /**
   * Verify user email using given verificationToken
   **/
  async verifyEmail(username: string, verificationToken: string) {
    // Get user from database
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: { username },
    });

    if (user.isVerified === true)
      throw new BadRequestException('User already verified');
    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('Invalid verification token');

    // User is verified, update isVerified in database
    await this.databaseService.user.update({
      where: { username },
      data: { isVerified: true },
    });

    return 'User successfully verified';
  }

  /**
   * Check if the user is verified
   **/
  async checkVerification(username: string) {
    // Get user from database
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: { username },
    });

    return user.isVerified ? 'User is verified' : 'User is not verified';
  }
}
