import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { Socket } from "socket.io-client";

// Типы сообщений и пользователей
export interface User {
    _id: string;
    fullName: string;
    email: string;
    profilePic: string;
    key?: string;
}

export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: string;
    image: string;
}

// Тип для чата Zustand store
interface ChatState {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;

    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (data: object) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    setSelectedUser: (user: User | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        try {
            set({ isUsersLoading: true });
            const res = await axiosInstance.get<User[]>("/message/users");
            set({ users: res.data });
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Ошибка загрузки пользователей");
            }
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get<Message[]>(`/message/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Ошибка загрузки сообщений");
            }
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (data: object) => {
        const { messages, selectedUser } = get();
        if (!selectedUser) return;

        try {
            const res = await axiosInstance.post<Message>(
                `/message/send/${selectedUser._id}`,
                data
            );
            set({ messages: [...messages, res.data] });
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || "Ошибка отправки сообщения");
            }
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket as Socket | null;
        if (!socket) return;

        socket.on("newMessage", (msg: Message) => {
            if (msg.senderId !== selectedUser._id) return;
            set({ messages: [...get().messages, msg] });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket as Socket | null;
        if (!socket) return;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),
}));
