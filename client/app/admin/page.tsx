'use client'
import Heading from "../utils/Heading"
import AdminSidebar from "../components/Admin/AdminSidebar"
import DashBoardHero from "../components/Admin/DashboardHero"
import AdminProtected from "../hooks/adminProtected"
type Props = {}

const Page = (props: Props) => {
  return (
    <div>
      <AdminProtected>
        <Heading title="DLearning" description="DLearning is a Platform" keywords="Programming,MERN,Redux,Machine Learning" />
        <div className="flex h-[200vh]">
          <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashBoardHero />
          </div>
        </div>
      </AdminProtected>
    </div>
  )
}
export default Page