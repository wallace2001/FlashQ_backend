import { UserPayload } from "./UserPayload";

export type JwtPayloadWithRt = UserPayload & { refreshToken: string };