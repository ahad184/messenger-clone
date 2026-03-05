import { useState, useEffect } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";

const Sidebar = () => {
    const { conversations, loading, fetchConversations, onlineUsers } = useChatStore();
    const { user, logout } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="flex flex-col h-full bg-messenger-sidebar border-r border-messenger-border">
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between glass-header">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=0084ff&color=fff`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-messenger-blue/30 p-0.5"
                        />
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-messenger-sidebar status-glow"></div>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-white leading-tight">Chats</h1>
                        <p className="text-xs text-messenger-muted">@{user.username}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="p-2 text-messenger-muted hover:text-white hover:bg-messenger-card rounded-full transition-all"
                    title="Logout"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
                    </svg>
                </button>
            </div>

            {/* Search Bar - Custom Component */}
            <div className="p-4">
                <UserSearch />
            </div>

            {/* Conversations List */}
            <div className="flex-grow overflow-y-auto px-2 space-y-1">
                {loading ? (
                    <div className="flex flex-col space-y-4 p-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-messenger-card rounded-full"></div>
                                <div className="flex-grow space-y-2">
                                    <div className="h-3 bg-messenger-card rounded w-24"></div>
                                    <div className="h-2 bg-messenger-card rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <div className="bg-messenger-card p-4 rounded-full">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-messenger-muted fill-current">
                                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.915 1.455 5.513 3.734 7.237V22l3.29-1.802c.94.26 1.936.402 2.976.402 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2z" />
                            </svg>
                        </div>
                        <p className="text-messenger-muted text-sm font-medium">No conversations yet.<br />Search for a friend to start chatting!</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <ConversationItem key={conv._id} conversation={conv} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
