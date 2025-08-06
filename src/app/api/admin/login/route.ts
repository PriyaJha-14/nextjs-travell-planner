// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { SHA256 as sha256} from "crypto-js"
const secret = new TextEncoder().encode(process.env.JWT_KEY as string);
const alg = "HS256";
const createToken = async (email: string, userId: number) => {
    return await new SignJWT({ email, userId, isAdmin: true })
    .setProtectedHeader({ alg })
    .setExpirationTime("48h")
    .sign(secret);
};




export async function POST(request: Request) {
    console.log('--- API Route /api/admin/login POST hit ---'); // ADD THIS LINE
    try {
        const { email, password } = await request.json();
        console.log('Received login attempt for email:', email); // ADD THIS LINE

        if ( !email || !password) {
            console.log('Missing email or password.'); // ADD THIS LINE
            return NextResponse.json (
                { message: "Email and password is required."},
                { status: 400 }
            );
        }
        const user = await prisma.admin.findUnique({where: {email, password: sha256(password).toString()} });
       

        if(!user) {
            console.log('User not found or invalid credentials for email:', email); // ADD THIS LINE
            return NextResponse.json(
                { message: "Invalid email or password." },
                { status: 404}
            );
        }else {
            console.log('User found! Logging in:', user.email); // ADD THIS LINE
            const token = await createToken(user.email, user.id);
            (await cookies()).set("access_token", token);
            return NextResponse.json({
                userInfo: {
                    id: user.id,
                    email: user.email,
                },
            });
        }

    } catch (error) {
        console.error('An unexpected error occurred in login API:', error); // ADD THIS LINE
        return NextResponse.json(
            { message: "An unexpected error occured." },
            { status: 500 }
        );
    }
}









