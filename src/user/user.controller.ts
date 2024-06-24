import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Post('/register') // POST /user/register
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }
}