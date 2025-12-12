import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ChatHistoryPage = () => {
    const { userId, astroId } = useParams();
    const token = localStorage.getItem("User-admin-token");

    const [chatData, setChatData] = useState([]);
    const [userName, setUserName] = useState('');
    const [astroName, setAstroName] = useState('');
    const [chatDate, setChatDate] = useState(null);

   
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/user`, {
                    headers: { Authorization: token },
                });
                const user = res?.data?.data?.find(u => u._id === userId);
                if (user) setUserName(user.fullName || user.name || user.email);
            } catch (err) {
                console.error("User fetch error:", err);
            }
        };
        if (userId) fetchUser();
    }, [userId, token]);

    
    useEffect(() => {
        const fetchAstro = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/getAstro`, {
                    headers: { Authorization: token },
                });
                const astro = res?.data?.data?.find(a => a._id === astroId);
                if (astro) setAstroName(astro.fullName || astro.name || astro.email);
            } catch (err) {
                console.error("Astrologer fetch error:", err);
            }
        };
        if (astroId) fetchAstro();
    }, [astroId, token]);


    useEffect(() => {
        const fetchChat = async () => {
            if (!userId || !astroId) return;
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/chats/${userId}/${astroId}`, {
                    headers: { Authorization: token },
                });
                const messages = res?.data?.data || [];
                if (Array.isArray(messages)) {
                    setChatData(messages);
                    if (messages.length > 0) {
                        setChatDate(messages[0].timestamp);
                    }
                } else {
                    console.error("API response for chats was not an array:", messages);
                    setChatData([]); 
                }

            } catch (err) {
                console.error("Chat fetch error:", err);
                setChatData([]);             }
        };

        fetchChat();
    }, [userId, astroId, token]);
    // --- END FIX ---


    const formatDate = (dateStr) => {
        if (!dateStr) return "No Date";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container py-5 pt-1">
            <button
                onClick={() => window.history.back()}
                style={{
                    marginBottom: "10px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    color: "#007bff",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    padding: "10px 20px",
                }}
            >
                <span style={{ marginRight: "8px" }}>&lt;</span>
                <span style={{ position: "relative", display: "inline-block", textDecoration: "underline" }}>
                    Back
                    {/* <span
                        style={{
                            content: "''",
                            position: "absolute",
                            left: 0,
                            bottom: -2,
                            width: "100%",
                            height: "1px",
                            borderBottom: "2px solid #007bff",
                        }}
                    ></span> */}
                </span>
            </button>

            <div className="card shadow-sm p-4">
                <h2 className="text-center mb-4 fw-bold">Chat</h2>

                <div className="d-flex align-items-center mb-3 justify-content-between" style={{ borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
                    {/* <img src="/user-icon.png" alt="user" style={{ width: 50, height: 50, marginRight: 10 }} /> */}
                    <div>
                        <strong>{userName || 'User'} - {astroName || 'Astrologer'}</strong><br />
                        <small className="text-muted">Chat History</small>
                    </div>
                    <div className="text-center text-muted">
                        {formatDate(chatDate)}
                    </div>
                </div>



                <div style={{ maxHeight: "400px", overflowY: "auto", padding: "0 10px" }}>
                    {/* This rendering logic is now correct because chatData is guaranteed to be an array */}
                    {chatData.length === 0 ? (
                        <div className="text-center text-muted p-3">No messages found for this chat.</div>
                    ) : (
                        chatData.map((msg, index) => {

                            const isSenderUser = msg.senderId === userId;
                            // Fallback to generic names if the names haven't loaded yet
                            const senderName = isSenderUser ? (userName || 'User') : (astroName || 'Astrologer');

                            return (
                                <div key={msg._id || index} className="mb-3"> {/* Use msg._id for a more stable key */}
                                    <div className={`d-flex ${isSenderUser ? 'justify-content-start' : 'justify-content-end'}`}>
                                        <div
                                            style={{
                                                maxWidth: "70%",
                                                background: isSenderUser ? "#eef2f7" : "#d6f5d6",
                                                padding: "10px 15px",
                                                borderRadius: "10px",
                                                // This style is important for showing the multi-line birth details correctly
                                                whiteSpace: "pre-wrap",
                                                textAlign: "left"
                                            }}
                                        >
                                            <div style={{ fontWeight: 500, marginBottom: 5 }}>{senderName}</div>
                                            {/* This correctly reads the 'text' property from your object */}
                                            <div>{msg.text || msg.message}</div>
                                            <div className="text-muted small text-end mt-1">
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHistoryPage;