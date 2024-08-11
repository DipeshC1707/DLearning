'use client';
import Heading from "../../../app/utils/Heading";
import AdminProtected from "../../../app/hooks/adminProtected";
import React from "react";
import DashboardHero from "../../../app/components/Admin/DashboardHero";
import AdminSidebar from "../../../app/components/Admin/AdminSidebar";
import AllUsers from "../../components/Admin/Users/AllUsers";
type Props = {};

const page = (props: Props) => {
    return (
        <div>
            <AdminProtected>
                <Heading
                    title="DLearning - Admin"
                    description="DLearning is a platform for students to learn get help from teachers"
                    keywords="Programming,MERN,Redux,Machine Learning"
                />
                <div className="flex h-screen">
                    <div className="1500px:w-[16%] w-1/5">
                        <AdminSidebar />
                    </div>
                    <div className="w-[85%]">
                        <DashboardHero />
                        <AllUsers isTeam={true}/>
                    </div>
                </div>
            </AdminProtected>
        </div>
    )
}

export default page;