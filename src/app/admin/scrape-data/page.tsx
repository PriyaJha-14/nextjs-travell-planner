"use client";
import React from "react";
import { Card, CardFooter } from "@heroui/react";
import { CardBody } from "@heroui/react";
import {Tabs, Tab} from "@heroui/react";


const ScrapeData = () => {
    return (
        <section className="m-10 grid grid-cols-3 gap-5">
            <Card className="col-span-2">
                <CardBody>
                    <Tabs>
                        <Tab key="location" title="Location">
                            
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
        </section>
    );
};




export default ScrapeData;

