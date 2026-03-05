import { useEffect, useRef } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import dayjs from "dayjs";

const MessageList = () => {
    const { messages, messagesLoading, activeConversation, typingUsers } = useChatStore();
    const { user: currentUser } = useAuthStore();
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, activeConversation?._id]);

    if (messagesLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-8 h-8 border-4 border-messenger-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-messenger-muted text-sm font-medium">Loading messages...</p>
            </div>
        );
    }

    const activeTyping = typingUsers[activeConversation?._id] || [];

    return (
        <div
            ref={scrollRef}
            className="h-full overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
        >
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-20 h-20 bg-messenger-card rounded-full flex items-center justify-center mb-4">
                        <img
                            src={activeConversation?.participants.find(p => p._id !== currentUser._id)?.profilePicture || `https://ui-avatars.com/api/?name=${activeConversation?.participants.find(p => p._id !== currentUser._id)?.username}&background=random&color=fff`}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full opacity-50"
                        />
                    </div>
                    <p className="text-sm font-medium text-white italic">Begin your journey. 🚀</p>
                </div>
            ) : (
                messages.map((msg, idx) => {
                    const isOwn = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                    const showAvatar = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;

                    return (
                        <div
                            key={msg._id}
                            className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                        >
                            <div className={`flex gap-2 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar for received messages */}
                                {!isOwn && (
                                    <div className="w-8 flex-shrink-0 flex items-end">
                                        {showAvatar ? (
                                            <img
                                                src={msg.sender.profilePicture || `https://ui-avatars.com/api/?name=${msg.sender.username}&background=random&color=fff`}
                                                className="w-8 h-8 rounded-full border border-messenger-border"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-8"></div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col space-y-1">
                                    {/* Image Content */}
                                    {msg.imageUrl && (
                                        <div className={`overflow-hidden rounded-2xl border border-messenger-border shadow-md transition-all hover:scale-[1.02] cursor-pointer ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                                            <img
                                                src={`${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${msg.imageUrl}`}
                                                alt="Shared image"
                                                className="max-h-80 w-auto object-contain bg-black"
                                            />
                                        </div>
                                    )}

                                    {/* Text Bubble */}
                                    {msg.text && (
                                        <div className={isOwn ? "bubble-sent" : "bubble-received shadow-sm"}>
                                            {msg.text}
                                        </div>
                                    )}

                                    {/* Timestamp & Seen Status */}
                                    <div className={`text-[10px] text-messenger-muted px-1 flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start ml-2"}`}>
                                        {dayjs(msg.createdAt).format("h:mm A")}
                                        {isOwn && idx === messages.length - 1 && (
                                            <span className="text-[9px] font-bold text-messenger-blue">
                                                ✓ {msg.seenBy?.length > 1 ? "Seen" : "Sent"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Typing Indicator */}
            {activeTyping.length > 0 && (
                <div className="flex items-start gap-2 animate-fade-in mb-4">
                    <div className="w-8 flex-shrink-0 flex items-end">
                        <img
                            src={activeTyping[0].profilePicture || `https://ui-avatars.com/api/?name=${activeTyping[0].username}&background=random&color=fff`}
                            className="w-8 h-8 rounded-full border border-messenger-border"
                            alt=""
                        />
                    </div>
                    <div className="bubble-received flex items-center h-9 px-4">
                        <div className="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageList;
