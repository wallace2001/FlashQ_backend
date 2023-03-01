
export interface UserPayload {
    sub: number;
    email: string;
    name: string;
    hashedRt?: string;
    iat?: number;
    exp?: number;
}