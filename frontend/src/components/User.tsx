import profileImg from "../assets/react.svg"
import { useChatStore } from "../store/useChatStore"

type User = {
    email: string,
    fullName: string,
    password: string,
    profilePic: string,
    createdAt: string,
}

export const User:React.FC<User> = ({user}) => {
   
  const { selectedUser, setSelectedUser, users } = useChatStore();



    return (
       <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {users.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {users.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
    )
}
