import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import { io } from "socket.io-client"

type User = {
    email: string,
    fullName: string,
    password: string,
    profilePic: string,
    createdAt: string,
}

interface AuthState {
    authUser: null | User, 
    isSigningUp: boolean,
    isLoggingIn: boolean,
    isUpdatingProfile: boolean,

    isCheckingAuth: boolean,
    checkAuth: () => Promise<void>,
    signUp: () => Promise<void>,
    logOut: () => Promise<void>,
    logIn: () => Promise<void>,
    getUsers: () => Promise<void>,


}

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null, 
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check")

            set({authUser: res.data})
            get().connectSocket()


        } catch (error) {
            set({authUser: null})
            console.log("Error in checkAuth store:", error)

        } finally {
            set({isCheckingAuth: false})
        }
    },

    signUp: async(data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({authUser: res.data})
            toast.success("Account created successfully")
            get().connectSocket()

        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        } finally {
            set({isSigningUp: false})
        }
    },

    logOut: async() => {
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser: null})
            toast.success("Logged out")
            get().disconnectSocket()

        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        }
    },

    logIn: async(data) => {
        set({isLoggingIn: true})
        try {
           const res = await axiosInstance.post("/auth/login", data)
           set({authUser: res.data})
           toast.success("Logged in!")
           get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        } finally {
            set({isLoggingIn: false})
        }
    },

    updateProfile: async(data) => {
        set({isUpdatingProfile: true})
        try {
           const res = await axiosInstance.put("/auth/update-profile", data)
           set({authUser: res.data})
           toast.success("Profile updated")
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        } finally {
            set({isUpdatingProfile: false})
        }
    },

    connectSocket: () => {
        const {authUser} = get()
        if (!authUser || get().socket?.connected) return
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        });
        set({socket: socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds})
        })
        // socket.connect()
    },

    disconnectSocket: () => {
       if (get().socket?.connected) get().socket.disconnect()
    }
}))