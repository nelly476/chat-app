import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import axios from "axios";

type User = {
    _id: string;
    email: string;
    fullName: string;
    password: string;
    profilePic: string;
    createdAt: string;
};

interface AuthState {
    authUser: User | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: Socket | null;

    checkAuth: () => Promise<void>;
    signUp: (data: any) => Promise<void>;
    logOut: () => Promise<void>;
    logIn: (data: any) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:5001/api' : "/"

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get<User>("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            set({ authUser: null });
            console.error("Error in checkAuth store:", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async (data: any) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post<User>("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Error during sign up");
            } else {
                toast.error("Unknown error during sign up");
            }
            console.error(error);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logOut: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out");
            get().disconnectSocket();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Error during logout");
            } else {
                toast.error("Unknown error during logout");
            }
            console.error(error);
        }
    },

    logIn: async (data: any) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post<User>("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in!");
            get().connectSocket();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Error during login");
            } else {
                toast.error("Unknown error during login");
            }
            console.error(error);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data: any) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put<User>("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Error updating profile");
            } else {
                toast.error("Unknown error updating profile");
            }
            console.error(error);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket: Socket = io(BASE_URL, {
            query: { userId: authUser._id },
        });
        set({ socket });

        socket.on("getOnlineUsers", (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) socket.disconnect();
    },
}));
