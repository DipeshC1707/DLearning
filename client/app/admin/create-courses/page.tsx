'use client'
import React from 'react'
import AdminSidebar from '@/app/components/Admin/AdminSidebar'
import Heading from '../../../app/utils/Heading'
import CreateCourse from "../../components/Admin/CreateCourse"
import DashboardHeader from '../../../app/components/Admin/DashboardHeader'
type Props = {}
const Page = (props: Props) => {
  return (
    <div>
      <Heading title="DLearning" description="DLearning is a Platform" keywords="Programming,MERN,Redux,Machine Learning"/>
      <div className='flex'>
        <div className='1500px:w-[16%] w-1/5'>
          <AdminSidebar/>
        </div>
        <div className='w-[85%]'>
          <DashboardHeader/>
          <CreateCourse/>
        </div>
      </div>
    </div>
  )
}
export default Page