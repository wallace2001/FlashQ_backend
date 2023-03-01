import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AuthRequest } from '../models/AuthRequest';
import { JwtPayloadWithRt } from '../models/JwtPayloadWithRt';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    if (!data) return request.user;
    return request.user[data];
  },
);