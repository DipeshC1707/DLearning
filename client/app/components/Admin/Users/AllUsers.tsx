
import React, { FC, useEffect, useState } from 'react';
import { DataGrid } from "@mui/x-data-grid"
import { Box, Button, Modal } from '@mui/material';
import { AiOutlineDelete, AiOutlineMail } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { format } from 'timeago.js';
import { useDeleteUserMutation, useGetAllUsersQuery, useUpdateUserRoleMutation } from '../../../../redux/features/user/userApi';
import Loader from '../../Loader/Loader';
import { styles } from '../../../../app/styles/styles';
import toast from 'react-hot-toast';

type Props = {
    isTeam: boolean;
};

const AllUsers: FC<Props> = ({ isTeam }) => {
    const { theme, setTheme } = useTheme();
    const [active, setActive] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("admin");
    const [open, setOpen] = useState(false);
    const [userID, setUserID] = useState("");
    const [updateUserRole, { error: updateError, isSuccess }] = useUpdateUserRoleMutation({});
    const { isLoading, data, refetch } = useGetAllUsersQuery({}, { refetchOnMountOrArgChange: true });
    const [deleteUser, { isSuccess: deleteSuccess, error: deleteError }] = useDeleteUserMutation({})
    const rows: any = [];

    useEffect(() => {
        if (updateError) {
            if ("data" in updateError) {
                const errorMsg = updateError as any;
                toast.error(errorMsg.data.message);
            }
        }

        if (isSuccess) {
            refetch();
            toast.success("User Role Updated Successfully");
            setActive(false);
        }
        if (deleteSuccess) {
            refetch();
            toast.success("Delete User Successfully");
            setOpen(false);
        }
        if (deleteError) {
            if ("data" in deleteError) {
                const errorMsg = deleteError as any;
                toast.error(errorMsg.data.message);
            }
        }
    }, [deleteError, deleteSuccess, isSuccess, refetch, updateError])
    if (isTeam) {
        const newData = data && data.users.filter((item: any) => item.role === 'admin')
        newData && newData.forEach((item: any) => {
            rows.push(
                {
                    id: item._id,
                    name: item.name,
                    email: item.email,
                    role: item.role,
                    courses: item.courses.length,
                    created_at: format(item.createdAt)
                }
            )
        })
    }
    else {
        data && data.users.forEach((item: any) => {
            rows.push(
                {
                    id: item._id,
                    name: item.name,
                    email: item.email,
                    role: item.role,
                    courses: item.courses.length,
                    created_at: format(item.createdAt)
                }
            )
        });
    }

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "name", headerName: "Name", flex: .5 },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "role", headerName: "Role", flex: 0.5 },
        { field: "created_at", headerName: "Joined At", flex: 0.5 },
        { field: "courses", headerName: "Purchased Courses", flex: 0.5 },
        {
            field: " ",
            headerName: "Delete",
            flex: 0.2,
            renderCell: (params: any) => {
                return (
                    <>
                        <Button
                            onClick={() => {
                                setOpen(!open);
                                setUserID(params.row.id);
                            }}
                        >
                            <AiOutlineDelete
                                className="dark:text-white text-black"
                                size={20}
                            />
                        </Button>
                    </>
                );
            },
        },
        {
            field: "  ",
            headerName: "Email",
            flex: 0.2,
            renderCell: (params: any) => {
                return (
                    <>
                        <a href={`mailto:${params.row.email}`}>
                            <AiOutlineMail className="dark:text-white text-black" size={20} />
                        </a>
                    </>
                );
            },
        },
    ];

    const handleSubmit = async () => {
        console.log({email,role});
        await updateUserRole({ email, role });
    };

    const handleDelete = async () => {
        const id = userID;
        await deleteUser(id);
    };

    return (
        <div className='mt-[120px]'>
            {isLoading ? (<Loader />) :
                (<Box m="20px">
                    <div className="w-full flex justify-end">
                        <div className={`${styles.button} !w-[200px] dark:bg-[#57c7a3] dark:border dark:border-[#ffffff6c]`} onClick={() => {
                            setActive(!active);
                        }}>
                            Add New Member
                        </div>
                    </div>
                    <Box m="40px 0 0 0"
                        height="80vh"
                        sx={{
                            "& .MuiDataGrid-root": {
                                border: "none",
                                outline: "none"
                            },
                            "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {
                                color: theme === "dark" ? "#fff" : "#000"
                            },
                            "& .MuiDatagrid-sortIcon": {
                                color: theme === "dark" ? "#fff" : "#000"
                            },
                            "& .MuiDataGrid-row": {
                                color: theme === "dark" ? "#fff" : "#000",
                                borderBottom:
                                    theme === "dark" ? "1px solid #fffffff30 !important" : "1px solid #ccc !important"
                            },
                            "& .MuiTablePagination-root": {
                                color: theme === "dark" ? "#fff" : "#000"
                            },
                            "& .MuiDataGrid-cell": {
                                borderBottom: "none"
                            },
                            "& .name-columns--cell": {
                                color: theme === "dark" ? "#fff" : "#000"
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
                                borderBottom: "none",
                                color: theme === "dark" ? "#fff" : "#000"
                            },
                            "& .MuiDataGrid-virtualScroller": {
                                backgroundColor: theme === "dark" ? "#1F2A40" : "F2F0F0"
                            },
                            "& .MuiDataGrid-footerContainer": {
                                color: theme === "dark" ? "#fff" : "#000",
                                borderTop: "none",
                                backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC"
                            },
                            "& .MuiCheckBox-root": {
                                color: theme === "dark" ? `#b7ebde !important` : `#000 !important`
                            },
                            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                                color: `#fff !important`
                            }
                        }}
                    >
                        <DataGrid
                            checkboxSelection
                            rows={rows}
                            columns={columns} />
                    </Box>
                    {active && (
                        <Modal
                            open={active}
                            onClose={() => setActive(!active)}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                                <h1 className={`${styles.title}`}>Add New Member</h1>
                                <div className="mt-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email..."
                                        className={`${styles.input}`}
                                    />
                                    <select
                                        name=""
                                        id=""
                                        className={`${styles.input} !mt-6`}
                                        onChange={(e: any) => setRole(e.target.value)}
                                    >
                                        <option
                                            className="dark:bg-[#000] text-[#fff]"
                                            value="admin"
                                        >
                                            Admin
                                        </option>
                                        <option className="dark:bg-[#000] text-[#fff]" value="user">
                                            User
                                        </option>
                                    </select>
                                    <br />
                                    <div
                                        className={`${styles.button} my-6 !h-[30px]`}
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </div>
                                </div>
                            </Box>
                        </Modal>
                    )}
                    {
                        open && (
                            <Modal
                                open={open}
                                onClose={() => setOpen(!open)}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                                    <h1 className={`${styles.title}`}>
                                        Are you sure you want to delete this user?
                                    </h1>
                                    <div className="flex w-full items-center justify-between mb-6 mt-4">
                                        <div
                                            className={`${styles.button} !w-[120px] h-[30px] bg-[#57c7a3]`}
                                            onClick={() => setOpen(!open)}
                                        >
                                            Cancel
                                        </div>
                                        <div
                                            className={`${styles.button} !w-[120px] h-[30px] bg-[#d63f3f]`}
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </div>
                                    </div>
                                </Box>
                            </Modal>
                        )
                    }
                </Box>)}
        </div>
    )
}
export default AllUsers;