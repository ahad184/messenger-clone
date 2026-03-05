import { useEffect, useRef } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
    const {
        activeConversation,
        fetchMessages,
        markSeen,
        addMessage,
        updateSeenStatus
    } = useChatStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (activeConversation?._id) {
            fetchMessages(activeConversation._id);
            markSeen(activeConversation._id);
        }
    }, [activeConversation?._id]); // Only re-run when ID changes

    if (!activeConversation) {
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-messenger-bg text-center p-12">
                <div className="w-24 h-24 bg-messenger-card rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-messenger-blue fill-current">
                        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.915 1.455 5.513 3.734 7.237V22l3.29-1.802c.94.26 1.936.402 2.976.402 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Select a chat to start messaging</h2>
                <p className="text-messenger-muted max-w-sm">
                    Stay connected with your friends and family with real-time messaging, image sharing, and more.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-messenger-bg fade-in">
            {/* Header */}
            <ChatHeader />

            {/* Messages */}
            <div className="flex-grow overflow-hidden relative">
                <MessageList />
            </div>

            {/* Input */}
            <MessageInput />
        </div>
    );
};

export default ChatWindow;
