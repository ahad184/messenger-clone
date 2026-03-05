import { useNavigate } from "react-router-dom";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";

const ChatHeader = () => {
    const navigate = useNavigate();
    const { activeConversation, onlineUsers, typingUsers } = useChatStore();
    const { user: currentUser } = useAuthStore();

    if (!activeConversation) return null;

    const recipient = activeConversation.participants.find(
        (p) => p._id !== currentUser._id
    );

    const isOnline = onlineUsers.includes(recipient._id);
    const isTyping = typingUsers[activeConversation._id]?.length > 0;

    return (
        <div className="flex items-center justify-between px-4 py-3 glass-header">
            <div className="flex items-center gap-3">
                {/* Back Button (Mobile Only) */}
                <button
                    onClick={() => navigate("/")}
                    className="md:hidden p-2 -ml-2 text-messenger-blue hover:bg-messenger-card rounded-full transition-all"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                {/* Recipient Info */}
                <div className="relative">
                    <img
                        src={recipient.profilePicture || `https://ui-avatars.com/api/?name=${recipient.username}&background=random&color=fff`}
                        alt={recipient.username}
                        className="w-10 h-10 rounded-full object-cover border border-messenger-border"
                    />
                    {isOnline && (
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-messenger-bg status-glow"></div>
                    )}
                </div>

                <div>
                    <h2 className="font-bold text-white text-[15px] leading-tight cursor-pointer hover:underline">
                        {recipient.username}
                    </h2>
                    <p className="text-[11px] font-medium text-messenger-muted">
                        {isTyping ? (
                            <span className="text-messenger-blue flex items-center gap-1 animate-pulse">
                                typing...
                            </span>
                        ) : isOnline ? "Active now" : "Offline"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button className="p-2 text-messenger-blue hover:bg-messenger-card rounded-full transition-all">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
