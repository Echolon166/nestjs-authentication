import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const verificationToken = 'TEST'; // TODO: should be a random alphanumeric value
    const newUser = {
      ...createUserDto,
      verificationToken: verificationToken,
      isVerified: false,
    };

    await this.databaseService.user.create({ data: newUser });
    await this.mailService.sendVerification(
      newUser.username,
      newUser.email,
      newUser.verificationToken,
    );

    return 'User successfully registered';
  }

  async verifyEmail(username: string, verificationToken: string) {
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: { username },
    });

    if (user.isVerified === true)
      throw new BadRequestException('User already verified');
    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('Invalid verification token');

    await this.databaseService.user.update({
      where: { username },
      data: { isVerified: true },
    });

    return 'User successfully verified';
  }

  async checkVerification(username: string) {
    const user = await this.databaseService.user.findUniqueOrThrow({
      where: { username },
    });

    return user.isVerified ? 'User is verified' : 'User is not verified';
  }
}
