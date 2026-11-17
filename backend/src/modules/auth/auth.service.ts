import argon2 from "@node-rs/argon2";
import { findUserByEmail, createUser } from "./auth.repository.js";
import type { RegisterInput } from "./auth.types.js";
import { email } from "zod";

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