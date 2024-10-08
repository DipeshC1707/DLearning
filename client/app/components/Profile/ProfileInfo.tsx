import { FC, useEffect, useState } from "react"
import Image from "next/image";
import avatarIcon from "../../../public/assets/user-1.jpg"
import { AiOutlineCamera } from "react-icons/ai";
import { styles } from "../../styles/styles";
import { useEditProfileMutation, useUpdateAvatarMutation } from "@/redux/features/user/userApi";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";

type Props = {
    avatar: string | null;
    user: any
}
const ProfileInfo: FC<Props> = ({ user, avatar }) => {
    const [name, setName] = useState(user && user.name);
    const [updateAvatar, { isSuccess, error }] = useUpdateAvatarMutation();
    const [editProfile, { isSuccess: pSuccess, error: pError }] = useEditProfileMutation();
    const [loadUser, setLoadUser] = useState(false);
    const { } = useLoadUserQuery(undefined, { skip: loadUser ? false : true });

    const imageHandler = async (e: any) => {

        const fileReader = new FileReader();

        fileReader.onload = () => {
            const avatar = fileReader.result
            if (fileReader.readyState === 2) {
                updateAvatar(avatar);
            }
        }
        fileReader.readAsDataURL(e.target.files[0]);
    }

    useEffect(() => {
        if (isSuccess || pSuccess) {
            setLoadUser(true);
        }

        if (error || pError) {
            console.log(error);
        }
    }, [isSuccess, error, pSuccess, pError]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (name !== "") {
            editProfile(
                { name: name }
            );
        }
    }

    return (
        <>
            <div className="w-full flex justify-center">
                <div className="relative">
                    <Image
                        src={user.avatar || avatar ? user.avatar.url || avatar : avatarIcon}
                        alt=""
                        width={120}
                        height={120}
                        className="w-[120px] h-[120px] cursor-pointer border-[3px] border-[#37a39a] rounded-full"
                    />
                    <input
                        type="file"
                        name=""
                        id="avatar"
                        className="hidden"
                        onChange={imageHandler}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                    />
                    <label htmlFor="avatar">
                        <div className="w-[30px] h-[30px] bg-slate-900 rounded-full absolute bottom-2 right-2 flex items-center justify-center cursor-pointer">
                            <AiOutlineCamera size={20} className="z-1" />
                        </div>
                    </label>
                </div>
            </div>
            <br />
            <br />
            <div className="w-full pl-6 800px:pl-10">
                <form onSubmit={handleSubmit}>
                    <div className="800px:w-[50%] m-auto block pb-4">
                        <div className="w-[100%]">
                            <label className="block pb-2 font-Poppins dark:text-white text-black">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                                required
                                value={name}
                                onChange={(e: any) => setName(e.target.value)}
                            />
                        </div>
                        <br />
                        <div className="w-[100%] pt-2">
                            <label className="block pb-2 font-Poppins dark:text-white text-black">Email Address</label>
                            <input
                                type="text"
                                readOnly
                                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                                required
                                value={user?.email}
                            />
                        </div>
                        <input
                            required
                            type="submit"
                            value="Update"
                            className={`w-full 800px:w-[250px] h-[40px] border border-[#37a39a] text-center dark:text-[#fff] text-black rounded-[3px] mt-8 font-Poppins cursor-pointer`}
                        />
                    </div>
                </form>
            </div>
        </>
    )
}
export default ProfileInfo