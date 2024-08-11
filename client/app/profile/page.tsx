'use client'
import React, { FC, useState } from "react"
import Protected from "../hooks/useProtected"
import Heading from "../utils/Heading"
import Header from "../components/Header"
import Profile from "../components/Profile/Profile"
import { useSelector } from "react-redux"

type Props = {}
const Page: FC<Props> = (props: Props) => {
    const [open, setOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(5);
    const [route, setRoute] = useState("Login");
    const { user } = useSelector((state: any) => state.auth)


    return (
        <div>
            <Protected>
                <Heading title={`${user?.name}'s Profile`} description="DLearning is a Platform" keywords="Programming,MERN,Redux,Machine Learning" />
                <Header open={open} activeItem={activeItem} setOpen={setOpen} route={route} setRoute={setRoute} />
                <Profile user={user} />
            </Protected>
        </div>
    )
}
export default Page;