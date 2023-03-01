import { Controller, HttpCode, HttpStatus, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import { AuthService } from './auth.service';
import { GetCurrentUserId } from './decorators/current-user-id.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { IsPublic } from './decorators/is-public.decorator';
import { RtGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { UserToken } from './models/UserToken';

@ApiTags("AuthUser")
@Controller()
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @IsPublic()
    @Post("login")
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    login(@Request() req: AuthRequest) {
        return this.authService.login(req.user);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetCurrentUserId() userId: number): Promise<boolean> {
      return this.authService.logout(userId);
    }

    @IsPublic()
    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    @UseGuards(RtGuard)
    refreshTokens(
        @GetCurrentUserId() userId: number,
        @CurrentUser('refreshToken') refreshToken: string) : Promise<UserToken> {
            return this.authService.refreshTokens(userId, refreshToken);
    }

}
