import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import useChatStore from "../store/useChatStore";

const UserSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { createOrGetConversation, onlineUsers } = useChatStore();

    useEffect(() => {
        const handleSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const { data } = await API.get(`/users?search=${query}`);
                setResults(data.users);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (recipientId) => {
        const conversation = await createOrGetConversation(recipientId);
        if (conversation) {
            navigate(`/chat/${conversation._id}`);
        }
        setQuery("");
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-messenger-muted fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="block w-full bg-messenger-card/50 text-white text-sm border border-messenger-border rounded-2xl py-2 pl-10 pr-3 focus:ring-1 focus:ring-messenger-blue/50 outline-none placeholder-messenger-muted transition-all"
                    placeholder="Search Messenger"
                />
            </div>

            {showDropdown && (query.length >= 2 || isSearching) && (
                <div className="absolute z-50 mt-2 w-full glass-panel rounded-xl shadow-2xl overflow-hidden fade-in max-h-80 overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-sm text-messenger-muted animate-pulse">Searching...</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-sm text-messenger-muted">No users found</div>
                    ) : (
                        results.map((u) => (
                            <div
                                key={u._id}
                                onClick={() => handleSelect(u._id)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-messenger-input cursor-pointer transition-all"
                            >
                                <div className="relative">
                                    <img
                                        src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`}
                                        alt={u.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    {onlineUsers.includes(u._id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-messenger-card"></div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{u.username}</div>
                                    <div className="text-xs text-messenger-muted truncate max-w-[180px]">{u.email}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default UserSearch;
