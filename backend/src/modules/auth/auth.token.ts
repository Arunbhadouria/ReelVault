import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(jwtSecret);

const ISSUER = "reelvault-api";
const AUDIENCE = "reelvault-app";

export async function generateAccessToken(userID: string): Promise<string> {
    return new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userID)
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secretKey);
}

export async function verifyAccessToken(token: string): Promise<string> {
    const { payload } = await jwtVerify(token, secretKey, {
        issuer: ISSUER,
        audience: AUDIENCE,
    });

    if (!payload.sub) {
        throw new Error("Invalid access token");
    }

    return payload.sub;
}

export function generateRefreshToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}