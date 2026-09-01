import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: { email: string; password?: string }) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: { email: string; password?: string }) {
    return this.authService.register(registerDto);
  }

  @Post('google')
  googleLogin(@Body() body: { credential: string }) {
    return this.authService.googleLogin(body.credential);
  }
}
