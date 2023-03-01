import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcrypt";
import { User } from 'src/user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async login(user: User): Promise<UserToken> {
        const { id, email, name } = user;

        const payload: UserPayload = {
            sub: id,
            name,
            email
        };

        const jwtToken = await this.getTokens(payload);
        await this.updateRtHash(user.id, jwtToken.refresh_token);

        return jwtToken;
    }

    async logout(userId: number): Promise<boolean> {
        await this.prisma.user.updateMany({
          where: {
            id: userId,
            hashedRt: {
              not: null,
            },
          },
          data: {
            hashedRt: null,
          },
        });
        return true;
      }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);

        if (user) {

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) return { ...user, password: undefined };
        }

        throw new UnauthorizedException('Email address or password provided is incorrect.');
    }

    async refreshTokens(userId: number, rt: string): Promise<UserToken> {
        const user = await this.prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        console.log(user);

        const { email, id, name, hashedRt } = user;

        if (!user || !hashedRt) throw new ForbiddenException('Access Denied');
    
        const rtMatches = await bcrypt.compare(rt, hashedRt);
        if (!rtMatches) throw new ForbiddenException('Access Denied');

        const payload: UserPayload = {
            sub: id,
            name,
            email
        };
    
        const tokens = await this.getTokens(payload);
        await this.updateRtHash(user.id, tokens.refresh_token);
    
        return tokens;
    }

    async updateRtHash(userId: number, rt: string): Promise<void> {
        const hash = await bcrypt.hash(rt, 10);
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRt: hash,
            },
        });
    }

    private async getTokens(userPayload: UserPayload): Promise<UserToken> {

        const [at, rt] = await Promise.all([
            this.jwtService.sign(userPayload, {
                secret: process.env.JWT_TOKEN,
                expiresIn: '15m',
            }),
            this.jwtService.sign(userPayload, {
                secret: process.env.JWT_TOKEN,
                expiresIn: '7d',
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}
