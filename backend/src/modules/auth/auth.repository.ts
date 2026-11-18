import { prisma } from "../../database/prisma.js";

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
}

export async function createUser(
    email: string,
    passwordHash: string,
) {
    return prisma.user.create({
        data: {
            email,
            passwordHash,
        },
    });
}

export async function findUserForLogin(email: string) {
    return prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            passwordHash: true,
        },
    });
}

export async function createAuthSession(
    userId: string,
    refreshTokenHash: string,
    expiresAt: Date
) {
    return prisma.authSession.create({
        data: {
            userId,
            refreshTokenHash,
            expiresAt,
        },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
            createdAt: true,
        },
    });
}

export async function findAuthSessionByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.authSession.findUnique({
        where: {
            refreshTokenHash,
        },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
            revokedAt: true,
        },
    });
}

export async function rotateAuthSession(
    id: string,
    oldRefreshTokenHash: string,
    newRefreshTokenHash: string,
    expiresAt: Date
) {
    return prisma.authSession.updateMany({
        where: {
            id,
            refreshTokenHash: oldRefreshTokenHash,
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        data: {
            refreshTokenHash: newRefreshTokenHash,
            expiresAt,
            lastUsedAt: new Date(),
        },
    });
}

export async function revokeAuthSession(refreshTokenHash: string) {
    return prisma.authSession.updateMany({
        where: {
            refreshTokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });

}