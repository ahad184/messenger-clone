import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import useChatStore from "../store/useChatStore";

const HomePage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { conversations, activeConversation, fetchConversations, setActiveConversation } = useChatStore();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Sync URL param with activeConversation store
    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            const found = conversations.find(c => c._id === conversationId);
            if (found) {
                setActiveConversation(found);
            } else {
                // If not found in current list, maybe it's a new conversation or invalid
                // We'll let createOrGetConversation handle it if needed elsewhere,
                // but for now we just try to set it from what we have.
            }
        } else if (!conversationId) {
            setActiveConversation(null);
        }
    }, [conversationId, conversations, setActiveConversation]);

    return (
        <div className="flex w-full h-full bg-messenger-bg overflow-hidden relative">
            {/* Sidebar - HIDDEN on mobile if chat is open, VISIBLE on desktop */}
            <div
                className={`w-full md:w-[360px] lg:w-[400px] flex-shrink-0 h-full border-r border-messenger-border transition-all duration-300 md:block ${activeConversation ? "hidden" : "block"
                    }`}
            >
                <Sidebar />
            </div>

            {/* Chat Window - VISIBLE on mobile if chat is open, HIDDEN if no chat open */}
            <div
                className={`flex-grow h-full overflow-hidden transition-all duration-300 md:block ${!activeConversation ? "hidden" : "block"
                    }`}
            >
                <ChatWindow />
            </div>
        </div>
    );
};

export default HomePage;
