import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcrypt";
import { User } from 'src/user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) { }

    login(user: User): UserToken {
        const { id, email, name } = user;

        const payload: UserPayload = {
            sub: id,
            name,
            email
        };

        const jwtToken = this.jwtService.sign(payload);

        return {
            access_token: jwtToken
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);

        if (user) {

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) return { ...user, password: undefined };
        }

        throw new UnauthorizedException('Email address or password provided is incorrect.');
    }
}
