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