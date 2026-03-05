import { useState, useRef, useEffect } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import { getSocket } from "../hooks/useSocket";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { activeConversation, sendMessage } = useChatStore();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imageFile) return;

        const convId = activeConversation._id;
        const currentText = text;
        const currentImage = imageFile;

        // Reset state early for better UX
        setText("");
        removeImage();

        // Emit stop typing immediately
        const socket = getSocket();
        if (socket) {
            socket.emit("stop_typing", { conversationId: convId, userId: user._id });
        }

        await sendMessage(convId, currentText, currentImage);
    };

    const handleTyping = (e) => {
        setText(e.target.value);

        const socket = getSocket();
        if (!socket || !activeConversation) return;

        // Emit typing event
        socket.emit("typing", {
            conversationId: activeConversation._id,
            userId: user._id,
            username: user.username
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set timeout to emit stop_typing
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", {
                conversationId: activeConversation._id,
                userId: user._id
            });
        }, 2000);
    };

    return (
        <div className="p-4 bg-messenger-bg relative">
            {/* Image Preview Overlay */}
            {imagePreview && (
                <div className="absolute bottom-[calc(100%+12px)] left-4 animate-fade-in bg-messenger-card p-2 rounded-2xl border border-messenger-border shadow-2xl z-20">
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                    <img src={imagePreview} className="max-h-40 rounded-xl" alt="Preview" />
                </div>
            )}

            <form onSubmit={handleSend} className="flex  gap-3 max-w-5xl mx-auto">
                {/* Attachment Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-messenger-blue hover:bg-messenger-card rounded-full transition-all flex-shrink-0"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                </button>
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                />

                {/* Text Input */}
                <div className="flex-grow">
                    <textarea
                        value={text}
                        onChange={handleTyping}
                        placeholder="Aa"
                        className="msg-input input-pill"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}

                    />
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!text.trim() && !imageFile}
                    className={`p-2.5 rounded-full transition-all transform active:scale-90 flex-shrink-0 ${text.trim() || imageFile
                        ? "text-messenger-blue hover:bg-messenger-blue/10"
                        : "text-messenger-muted opacity-40"
                        }`}
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
