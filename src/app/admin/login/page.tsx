"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardBody, Input, CardFooter, Button } from '@heroui/react';
import { Architects_Daughter } from "next/font/google";
import { apiClient } from '@/lib';
import { ADMIN_API_ROUTES } from '@/utils';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation'; 
import axios from 'axios';

const ArchitectsDaughter = Architects_Daughter({
    weight: "400",
    style: "normal",
    subsets: ["latin"],
});

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {setUserInfo} = useAppStore();
    const router = useRouter();


    

    const handleLogin = async () => {
        const response = await axios.post(ADMIN_API_ROUTES.LOGIN, {
            email,
            password,
        });
        if(response.data.userInfo) {
            setUserInfo(response.data.userInfo);
            router.push("/admin");
            console.log('Logged in!', response.data.userInfo);
        }
    };

    return (
        <div className="h-screen w-full relative">
            <Image 
                src="/home/home-bg.png" 
                alt="Background"
                fill
                className="object-cover z-0"
                priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md z-10"></div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <Card className="shadow-2xl bg-white bg-opacity-90 w-[400px]">
                    <CardHeader className="flex flex-col gap-2 items-center text-2xl text-black">
                        <Image
                            src="/logo.png"
                            alt="logo"
                            height={80}
                            width={80}
                            className="cursor-pointer"
                        />
                        <span className={`${ArchitectsDaughter.className} italic`}>
                            SmartScrape Admin Login
                        </span>
                    </CardHeader>
                    <CardBody className="flex flex-col items-center gap-4">
                        <Input
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            color="danger"
                        />
                        <Input
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            color="danger"
                        />
                    </CardBody>
                    <CardFooter className="flex-col gap-2 items-center justify-center">
                        <Button color="danger" variant="shadow" className="w-full capitalize" size="lg" onClick={handleLogin}>Login </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
