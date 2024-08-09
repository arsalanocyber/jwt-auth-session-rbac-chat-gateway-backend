import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST SIGNUP
  @Post('signup') // auth/signup
  async signup(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  // POST LOGIN
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  // POST REFRESH TOKEN
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenData: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenData.refreshToken);
  }

  @Get('users')
  async getUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id') // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.authService.getUser(id);
  }
}
