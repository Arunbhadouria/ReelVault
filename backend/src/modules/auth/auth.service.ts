import argon2 from "@node-rs/argon2";
import { findUserByEmail, createUser, findUserForLogin, createAuthSession, findAuthSessionByRefreshTokenHash, rotateAuthSession } from "./auth.repository.js";
import type { RegisterInput } from "./auth.types.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "./auth.token.js";
import type { LoginInput } from "./auth.validation.js";

export async function registerUser(data: RegisterInput) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
        throw new Error("Email is already registered");
    }

    const passwordHash = await argon2.hash(data.password);

    try {
        const user = await createUser(data.email, passwordHash);

        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    } catch (error: unknown) {
        // Handle simultaneous registration attempts
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            throw new Error("Email is already registered");
        }

        throw error;
    }
}

export async function loginUser(data: LoginInput) {
    const user = await findUserForLogin(data.email);

    if (!user) {
        throw new Error("Invalid Email or Password");
    }

    const isPasswordValid = await argon2.verify(
        user.passwordHash,
        data.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid Email or Password");
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await createAuthSession(user.id, refreshTokenHash, expiresAt);

    return {
        user: {
            id: user.id,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
}

export async function refreshUserSession(refreshToken: string) {
    const oldRefreshTokenHash = hashRefreshToken(refreshToken);

    const session = await findAuthSessionByRefreshTokenHash(
        oldRefreshTokenHash
    );

    if (!session) {
        throw new Error("Invalid refresh token");
    }

    if (session.revokedAt || session.expiresAt <= new Date()) {
        throw new Error("Refresh session expired or revoked");
    }

    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await rotateAuthSession(
        session.id,
        oldRefreshTokenHash,
        newRefreshTokenHash,
        expiresAt
    );

    if (result.count !== 1) {
        throw new Error("Refresh token is no longer valid");
    }

    const accessToken = await generateAccessToken(session.userId);

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}