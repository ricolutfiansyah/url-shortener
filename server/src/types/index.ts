export interface CustomPayload {
    sub: string;
    role: 'admin' | 'user';
    exp: number;
}

export type AppVariables = {
    jwtPayload: CustomPayload;
}
