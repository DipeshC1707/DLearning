'use client'
import React from 'react'
import AdminSidebar from '@/app/components/Admin/AdminSidebar'
import Heading from '../../../../app/utils/Heading'
import CreateCourse from "../../../components/Admin/CreateCourse"
import DashboardHeader from '../../../../app/components/Admin/DashboardHeader'
import EditCourse from '../../../../app/components/Admin/Course/EditCourse'

type Props = {}

const Page = ({params}:any) => {
  const id = params?.id;
  return (
    <div>
      <Heading title="DLearning" description="DLearning is a Platform" keywords="Programming,MERN,Redux,Machine Learning"/>
      <div className='flex'>
        <div className='1500px:w-[16%] w-1/5'>
          <AdminSidebar/>
        </div>
        <div className='w-[85%]'>
          <DashboardHeader/>
          <EditCourse id={id}/>
        </div>
      </div>
    </div>
  )
}
export default Page