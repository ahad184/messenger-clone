import { useNavigate } from "react-router-dom";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ConversationItem = ({ conversation }) => {
    const navigate = useNavigate();
    const { activeConversation, onlineUsers } = useChatStore();
    const { user: currentUser } = useAuthStore();

    // Find the recipient (the other participant)
    const recipient = conversation.participants.find(
        (p) => p._id !== currentUser._id
    );

    const isActive = activeConversation?._id === conversation._id;
    const isOnline = onlineUsers.includes(recipient._id);
    const lastMsg = conversation.lastMessage;
    const unreadCount = conversation.unreadCount?.[currentUser._id] || 0;

    return (
        <div
            onClick={() => navigate(`/chat/${conversation._id}`)}
            className={`conv-item ${isActive ? "active" : ""} ${unreadCount > 0 ? "font-bold" : ""}`}
        >
            <div className="relative flex-shrink-0">
                <img
                    src={recipient.profilePicture || `https://ui-avatars.com/api/?name=${recipient.username}&background=random&color=fff`}
                    alt={recipient.username}
                    className="w-14 h-14 rounded-full object-cover border border-messenger-border"
                />
                {isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-[13px] h-[13px] bg-green-500 rounded-full border-2 border-messenger-sidebar status-glow"></div>
                )}
            </div>

            <div className="flex-grow min-w-0 pr-2">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-[15px] text-white truncate font-semibold">
                        {recipient.username}
                    </h3>
                    {lastMsg && (
                        <span className={`text-[11px] ${unreadCount > 0 ? "text-messenger-blue" : "text-messenger-muted"}`}>
                            {dayjs(lastMsg.createdAt).fromNow(true)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unreadCount > 0 ? "text-white" : "text-messenger-muted"}`}>
                        {lastMsg
                            ? lastMsg.sender === currentUser._id || lastMsg.sender?._id === currentUser._id
                                ? `You: ${lastMsg.text || "Sent an image"}`
                                : lastMsg.text || "Sent an image"
                            : "Start a conversation"}
                    </p>
                    {unreadCount > 0 && (
                        <div className="bg-messenger-blue text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,132,255,0.4)]">
                            {unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationItem;
