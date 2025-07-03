import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

      getUsers: async() => {
        try {
            set({isUsersLoading: true})
            const res = await axiosInstance.get("/message/users")
            set({users: res.data})
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            set({isUsersLoading: false})
        }
    },

    getMessages: async(userId) => {
        set({isMessagesLoading: true})
        try {
            const res = await axiosInstance.get(`/message/${userId}`)
            set({messages: res.data})
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            set({isMessagesLoading: false})
        }
    },

    sendMessage: async(data) => {
        const {messages, selectedUser} = get()
        // console.log(messages, data)
        // console.log(selectedUser)
        try {
            const res = await axiosInstance.post(`message/send/${selectedUser._id}`, data)
            set({messages: [...messages, res.data]})
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    },

    setSelectedUser: (selectedUser) => set({selectedUser}),

}))

