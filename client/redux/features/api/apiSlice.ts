import { createApi,fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";

export const 

apiSlice = createApi({
    reducerPath: 'api',
    baseQuery:fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
    }),
    endpoints:(builder)=>({
        refreshToken:builder.query({
            query:()=>({
                url:"refresh",
                method:"GET",
                credentials:"include" as const
            })
        }),
        loadUser: builder.query({
            query:(data)=>({
                url:"me",
                method:"GET",
                credentials:"include" as const
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                try{
                    const result = await queryFulfilled;
                    dispatch(
                        userLoggedIn({
                            accessToken:result.data.activationToken,
                            user:result.data.user
                        })
                    );
                }
                catch(e:any){
                    console.log(e.message);
                }
            } 
        })
    })
})

export const {useRefreshTokenQuery , useLoadUserQuery} = apiSlice;