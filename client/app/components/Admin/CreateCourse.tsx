'use-client'

import { FC, useEffect, useState } from "react"
import CourseInformation from "./CourseInformation"
import CourseOptions from "./CourseOptions"
import CourseData from "./CourseData"
import CourseContent from "./CourseContet"
import CoursePreview from "./CoursePreview"
import { useCreateCourseMutation } from "@/redux/features/courses/coursesApi"
import toast from "react-hot-toast"
import { redirect } from "next/navigation"
type Props = {}
const CreateCourse: FC<Props> = (props: Props) => {
    const [createCourse,{isLoading,isSuccess,error}] = useCreateCourseMutation();

    useEffect(() =>{
        if(isSuccess) {
            toast.success("Course created successfully");
            redirect("/admin/all-courses")
        }
        if(error)
        {
            if("data" in error)
            {
                const errorMessage = error as any;
                toast.error(errorMessage.data.message);
            }
        }
    },[isLoading,isSuccess,error]);

    const [active, setActive] = useState(0);
    const [courseInfo, setCourseInfo] = useState({
        name: "",
        description: "",
        price: "",
        estimatedPrice: "",
        tags: "",
        level: "",
        demoUrl: "",
        thumbnail: ""
    })
    const [benifits, setBenifits] = useState([{ title: "" }]);
    const [prerequisites, setPrerequesites] = useState([{ title: "" }]); 4
    const [courseContentData, setCourseContentData] = useState([{
        videoUrl: "",
        title: "",
        description: "",
        videoSection: "Untitled Section",
        links: [
            {
                title: "",
                url: ""
            },
        ],
        suggestion: ""
    }]);

    const [courseData, setCourseData] = useState({});

    const handleSubmit = async () => {
        const formattedBenifits = benifits.map((benifit) => ({ title: benifit.title }));

        const formattedPrerequisites = prerequisites.map((prerequisite) => ({ title: prerequisite.title }));

        const formattedCourseContentData = courseContentData.map((courseContent) => ({
            videoUrl: courseContent.videoUrl,
            title: courseContent.title,
            description: courseContent.description,
            links: courseContent.links.map((link) => ({
                title: link.title,
                url: link.url
            })),
            suggestion: courseContent.suggestion
        }));

        const data =
        {
            name: courseInfo.name,
            description: courseInfo.description,
            price: courseInfo.price,
            estimatedPrice: courseInfo.estimatedPrice,
            tags: courseInfo.tags,
            thumbnai: courseInfo.thumbnail,
            level: courseInfo.level,
            demoUrl: courseInfo.demoUrl,
            totalVideos: courseContentData.length,
            benefits: formattedBenifits,
            prerequisites: formattedPrerequisites,
            courseContent: formattedCourseContentData
        }
        setCourseData(data);

    };
    // console.log(courseData);

    const handleCourseCreate = async (e: any) => {
        const data = courseData;

        if(!isLoading)
        {
            await createCourse(data);
        }
       
    }
    return (
        <div className="w-full flex min-h-screen">
            <div className="w-[80%]">
                {active == 0 && (
                    <CourseInformation courseInfo={courseInfo} setCourseInfo={setCourseInfo} active={active} setActive={setActive} />
                )}
                {active == 1 && (
                    <CourseData
                        benifits={benifits}
                        setBenifits={setBenifits}
                        prerequisites={prerequisites}
                        setPrerequisites={setPrerequesites}
                        active={active}
                        setActive={setActive}
                    />

                )}
                {
                    active == 2 && (
                        <CourseContent
                            active={active}
                            setActive={setActive}
                            courseContentData={courseContentData}
                            setCourseContentData={setCourseContentData}
                            handleSubmit={handleSubmit} />
                    )}
                {
                    active == 3 && (
                        <CoursePreview
                            active={active}
                            setActive={setActive}
                            courseData={courseData}
                            handleCourseCreate={handleCourseCreate}
                        />
                    )}
            </div>
            <div className="w-[20%] mt-[100px] h-screen fixed z-[-1] top-18 right-0">
                <CourseOptions active={active} setActive={setActive} />
            </div>
        </div>
    )
}
export default CreateCourse