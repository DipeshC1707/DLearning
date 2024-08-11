'use client'
import Link from "next/link";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import Navitems from "../utils/Navitems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi"
import CustomModel from "../utils/CustomModel"
import Login from "../components/auth/Login"
import Signup from "../components/auth/Signup"
import Verification from "../components/auth/Verification"
import { useSelector } from "react-redux";
import avatar from "../../public/assets/user-1.jpg"
import { useSession } from "next-auth/react";
import { useLogoutQuery, useSocialAuthMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number
    route: string,
    setRoute: (route: string) => void
}

const Header: FC<Props> = ({ activeItem, setOpen, route, open, setRoute }) => {
    const [active, setActive] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);
    const { user } = useSelector((state: any) => state.auth);
    const { data } = useSession();
    const [socialAuth, { isSuccess, error }] = useSocialAuthMutation();
    // const [logout,setLogout] = useState(false);
    // const {} = useLogoutQuery(undefined,{
    //     skip: !logout ?true :false
    // });

    useEffect(() => {
        if (!user) {
            if (data) {
                socialAuth({ email: data?.user?.email, name: data?.user?.name, avatar: data?.user?.image })
            }
        } if (data===null && isSuccess) {
            toast.success(
                "Login Successfully"
            )
        }
        // if(data===null){
        //     setLogout(true);
        // }
    }, [data, isSuccess, socialAuth, user])

    if (typeof window !== "undefined") {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 85) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    }

    const handleClose = (e: any) => {
        if (e.target.id === "screen") {
            setOpenSidebar(false);
        }
    }
    return (
        <div className='w-full relative'>
            <div className={`${active ? "dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500" : "w-full border-b dark:border-[#ffffff1c] h-[80px] z-[80] dark:shadow"}`}>
                <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
                    <div className="w full h-[80px] flex item-center justify-between p-3">
                        <div>
                            <Link href={"/"} className={`text-[25px] font-Poppins font-[500] text-black dark:text-white`}>
                                DLearning
                            </Link>
                        </div>

                        <div className="flex items-center">
                            <Navitems
                                activeItem={activeItem}
                                isMobile={false}
                            />
                            <ThemeSwitcher />
                            <div className="800px:hidden"
                            >
                                <HiOutlineMenuAlt3 size={25} className="cursor-pointer dark:text-white text-black"
                                    onClick={() => setOpenSidebar(true)} />
                            </div>
                            {
                                user ? (
                                    <Link href={"/profile"}>
                                        <Image
                                            src={user.avatar ? user.avatar.url : avatar}
                                            alt=""
                                            width={30}
                                            height={30}
                                            className="hidden 800px:block w-[30px] h-[30px] rounded-full curson-pointer"
                                            style={{border:activeItem===5 ? "2px solid #37a39a":"none"}}
                                        />
                                    </Link>
                                ) : (
                                    <HiOutlineUserCircle size={25} className="hidden 800px:block cursor-pointer dark:text-white text-black" onClick={() => setOpen(true)} />
                                )
                            }
                        </div>
                    </div>
                </div>
                {/* mobile sidebar */}
                {
                    openSidebar && (
                        <div className="fixed w-full h-screen top-0 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]" onClick={handleClose} id="screen">
                            <div className="w-[70%] fixed z-[99999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
                                <Navitems activeItem={activeItem} isMobile={true} />
                                {
                                    user ? (
                                        <Link href={"/profile"}>
                                            <Image
                                                src={user.avatar ? user.avatar.url : avatar}
                                                alt=""
                                                width={30}
                                                height={30}
                                                className="ml-5 my-2 w-[30px] h-[30px] rounded-full curson-pointer"
                                                style={{border:activeItem===5 ? "2px solid #37a39a":"none"}}
                                            />
                                        </Link>
                                    ) : (
                                        <HiOutlineUserCircle size={25} className="ml-5 my-2 cursor-pointer dark:text-white text-black" onClick={() => {setOpen(true);setOpenSidebar(false);}} />
                                    )
                                }
                                <br />
                                <br />
                                <p className="text-[16px] px-2 pl-5 text-black dark:text-white">
                                    Copyright @ 2023 DLearning
                                </p>
                            </div>

                        </div>
                    )
                }
            </div>
            {
                route === "Login" && (
                    <>
                        {
                            open && (
                                <CustomModel open={open} setOpen={setOpen} activeItem={activeItem} component={Login} setRoute={setRoute} />
                            )
                        }
                    </>
                )
            }
            {
                route === "Sign-Up" && (
                    <>
                        {
                            open && (
                                <CustomModel open={open} setOpen={setOpen} activeItem={activeItem} component={Signup} setRoute={setRoute} />
                            )
                        }
                    </>
                )
            }
            {
                route === "Verification" && (
                    <>
                        {
                            open && (
                                <CustomModel open={open} setOpen={setOpen} activeItem={activeItem} component={Verification} setRoute={setRoute} />
                            )
                        }
                    </>
                )
            }
        </div>
    );
}
export default Header;