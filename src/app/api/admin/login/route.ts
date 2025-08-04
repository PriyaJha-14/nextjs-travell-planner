// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Make sure the path is correct
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_KEY as string);
const alg = "HS256";
const createToken = async (email: string, userId: number) => {
    return await new SignJWT({ email, userId, isAdmin: true })
    .setProtectedHeader({ alg })
    .setExpirationTime("48h")
    .sign(secret);
};

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt with email:', email, 'and password:', password);

        if ( !email || !password) {
            return NextResponse.json (
                { message: "Email and password is required."},
                { status: 400 }
            );
        }

        // MODIFIED LOGIC: Find user by email first, then manually check the password
        const user = await prisma.admin.findFirst({where: {email} });

        if(!user) {
            console.log('User not found in database:', email);
            return NextResponse.json(
                { message: "Invalid email or password." },
                { status: 404}
            );
        }

        // Manually compare the password
        if (user.password !== password) {
             console.log('Password mismatch for user:', email);
             return NextResponse.json(
                { message: "Invalid email or password." },
                { status: 404}
            );
        }

        // If we reach here, the login is successful
        console.log('Login successful for user:', user.email);
        const token = await createToken(user.email, user.id);
        (await cookies()).set("access_token", token);
        return NextResponse.json({
            userInfo: {
                id: user.id,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('An unexpected error occurred in login API:', error);
        return NextResponse.json(
            { message: "An unexpected error occured." },
            { status: 500 }
        );
    }
}