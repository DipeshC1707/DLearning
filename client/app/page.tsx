'use client'
import React,{FC,useState} from "react"
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/route/Hero";

interface Props{};

const Page :FC<Props> = (props)=>{
  const [open,setOpen] = useState(false);
  const [activeItem,setActiveItem] = useState(0);
  const [route,setRoute] = useState("Login");
  return (
      <div>
        <Heading title="DLearning" description="DLearning is a Platform" keywords="Programming,MERN,Redux,Machine Learning"/>
        <Header open={open} activeItem={activeItem} setOpen={setOpen} route={route} setRoute={setRoute}/>
        <Hero/>
      </div>
  );
}

export default Page;