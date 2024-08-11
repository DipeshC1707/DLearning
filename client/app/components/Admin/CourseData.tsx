import { styles } from "../../../app/styles/styles";
import { FC } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import toast from "react-hot-toast";

type Props = {
  benifits: { title: string }[];
  setBenifits: (benifits: { title: string }[]) => void;
  prerequisites: { title: string }[];
  setPrerequisites: (prerequisites: { title: string }[]) => void;
  active: number;
  setActive: (active: number) => void
}

const CourseData: FC<Props> = ({ benifits, setBenifits, prerequisites, setPrerequisites, active, setActive }) => {
  const handleBenifitChange = (index: number, value: any) => {
    const updatedBenifits = [...benifits];

    updatedBenifits[index].title = value;

    setBenifits(updatedBenifits);

    // console.log(benifits);
  }

  const handleAddBenifits = () => {
    setBenifits([...benifits, { title: "" }]);
  };

  const handlePrerequisiteChange = (index: number, value: any) => {
    const updatedPrerequisite = [...prerequisites];

    updatedPrerequisite[index].title = value;

    setPrerequisites(updatedPrerequisite);
  }

  const handleAddPrerequisite = () => {
    setPrerequisites([...prerequisites, { title: "" }]);
  };

  const prevButton = () => {
    setActive(active - 1);
  }

  const handleOptions = () => {
    if (benifits[benifits.length - 1]?.title !== "" && prerequisites[prerequisites.length - 1]?.title !== "") {
      setActive(active + 1);
    }
    else {
      toast.error("Please fill the fields for go to next")
    }
  }

  return (
    <div className="w-[80%] m-auto mt-24 block">
      <div>
        <label className={`${styles.label} text-[20px]`} htmlFor="email">
          What are the benefits for students in this course?
        </label>
        <br />
        {
          benifits.map((benifits: any, index: number) => (
            <input
              type="text"
              key={index}
              name="Benifit"
              required
              placeholder="You will be able to build a full stack LMS Platform..."
              className={`${styles.input} my-2`}
              value={benifits.title}
              onChange={(e: any) => handleBenifitChange(index, e.target.value)}
            />
          ))
        }
        <AddCircleIcon
          style={{ margin: "10px 0px", cursor: "pointer", width: "30px" }}
          onClick={handleAddBenifits} />
      </div>
      <div>
        <label className={`${styles.label} text-[20px]`} htmlFor="email">
          What are the prerequisites for starting this course?
        </label>
        <br />
        {
          prerequisites.map((prerequisites: any, index: number) => (
            <input
              type="text"
              key={index}
              name="Prerequisites"
              required
              placeholder="You will be able to build a full stack LMS Platform..."
              className={`${styles.input} my-2`}
              value={prerequisites.title}
              onChange={(e: any) => handlePrerequisiteChange(index, e.target.value)}
            />
          ))
        }
        <AddCircleIcon
          style={{ margin: "10px 0px", cursor: "pointer", width: "30px" }}
          onClick={handleAddPrerequisite} />
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-[#fff] rounded mt-8 cursor-pointer" onClick={() => prevButton()}>
          Prev
        </div>
        <div className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-[#fff] rounded mt-8 mx-3 cursor-pointer" onClick={() => handleOptions()}>
          Next
        </div>
      </div>
    </div>
  )
}
export default CourseData