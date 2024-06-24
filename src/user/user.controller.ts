import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register') // POST /user/register
  register(@Body(ValidationPipe) createUserDto: Prisma.UserCreateInput) {
    return this.userService.register(createUserDto);
  }

  @Get('/verify-email/:username/:verificationToken') // GET /user/verify-email/{username}/{verificationToken}
  verifyEmail(
    @Param('username') username: string,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.userService.verifyEmail(username, verificationToken);
  }

  @Get('/check-verification/:username') // GET /user/check-verification/{username}
  checkVerification(@Param('username') username: string) {
    return this.userService.checkVerification(username);
  }
}
