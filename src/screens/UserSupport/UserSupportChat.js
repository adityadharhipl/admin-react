import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleUserTicket } from "../../Redux/Reducers/UserTicketReducer";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserChatSupport() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Smart Socket URL selection
  const socketUrl =
    process.env.REACT_APP_BASEURL?.replace(/\/$/, "") ||
    (window.location.origin.includes("localhost")
      ? "http://localhost:5000"
      : window.location.origin);

  console.log("🔌 Connecting to socket:", socketUrl);

  const [messages, setMessages] = useState([]);
  const [messagesApiData, setMessagesApiData] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPendingLoading, setIsPendingLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const textareaRef = useRef(null);

  const ticketData = useSelector(
    (state) => state?.UserTicketReducer?.singleTicket || {}
  );

  const senderData = JSON.parse(localStorage.getItem("User-admin-data"));

  const senderId = String(senderData?.parentId || senderData?._id);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const isImage = (url) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0];
    return (
      /\.(jpeg|jpg|gif|png|webp|svg|heic|bmp)$/i.test(cleanUrl) ||
      url.startsWith("data:image/")
    );
  };

  const getDayLabel = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const msgDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (msgDateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (msgDateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Tomorrow";
    } else if (msgDateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    } else {
      // Return day name
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return days[messageDate.getDay()];
    }
  };

  const getDateKey = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/imageUpload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `${process.env.REACT_APP_ADMIN_TOKEN}`,
        },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData?.message || "Failed to upload image");

      const imageUrl = responseData?.data?.img?.[0] || responseData?.data?.img;
      if (imageUrl) {
        toast.success("Image uploaded successfully!");
        return imageUrl;
      }
      return null;
    } catch (error) {
      toast.error(error?.message || "Failed to upload image.");
      return null;
    }
  };

  const getSenderId = (msg) => {
    if (!msg?.sender) return null;
    if (typeof msg.sender === "string") return msg.sender;
    if (typeof msg.sender === "object" && msg.sender._id) return msg.sender._id;
    return null;
  };

  const getReceiverId = (msg) => {
    if (!msg?.receiver) return null;
    if (typeof msg.receiver === "string") return msg.receiver;
    if (typeof msg.receiver === "object" && msg.receiver._id)
      return msg.receiver._id;
    return null;
  };

  // 🔹 Fetch ticket data
  useEffect(() => {
    if (id) dispatch(fetchSingleUserTicket({ id, userType: "user" }));
  }, [dispatch, id]);

  // 🔹 Initialize socket
  useEffect(() => {
    const localSocket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      withCredentials: true,
      path: "/socket.io", // ✅ ensures correct socket path
    });

    socketRef.current = localSocket;

    localSocket.on("connect", () => {
      // console.log("✅ Socket connected:", localSocket.id);
      setConnected(true);
      if (senderId) localSocket.emit("new user", senderId);
      setIsInitialLoading(false);
    });

    localSocket.on("disconnect", () => {
      console.warn("⚠️ Socket disconnected");
      setConnected(false);
    });

    const privateMessageHandler = (message) => {
      if (message?.ticketId !== ticketData?.ticketId) return;

      const sender = getSenderId(message);
      const receiver = getReceiverId(message);

      if (sender !== senderId && receiver !== senderId) return;

      const newMessageId = message?._id || message?.timeStamp;
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (msg) => (msg?._id || msg?.timeStamp) === newMessageId
        );
        if (isDuplicate) return prev;
        return [...prev, message];
      });
    };

    localSocket.on("private message", privateMessageHandler);

    localSocket.on("pending messages", (pendingMessages) => {
      const filtered = pendingMessages.filter(
        (msg) =>
          msg?.ticketId === ticketData?.ticketId &&
          (getSenderId(msg) === senderId || getReceiverId(msg) === senderId)
      );
      setMessages((prev) => [...prev, ...filtered]);
      setIsPendingLoading(false);
    });

    return () => {
      console.log("🧹 Cleaning up socket...");
      localSocket.off("private message", privateMessageHandler);
      localSocket.off("pending messages");
      localSocket.off("connect");
      localSocket.off("disconnect");
      localSocket.disconnect();
      socketRef.current = null;
    };
  }, [senderId, ticketData?.ticketId, socketUrl]);

  // 🔹 Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesApiData]);

  // 🔹 Fetch old messages
  useEffect(() => {
    const token = localStorage.getItem("User-admin-token");
    const fetchData = async () => {
      if (!ticketData?.ticketId) return;
      try {
        const response = await fetch(
          `${socketUrl}/admin/chat/${ticketData.ticketId}`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        if (data?.data) setMessagesApiData(data.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [ticketData?.ticketId, socketUrl]);

  const parseMessage = (text) => {
    const parts = text?.split(",");
    const messageObject = {};
    parts?.forEach((part) => {
      const [key, value] = part?.split(":")?.map((item) => item?.trim());
      if (key && value) messageObject[key] = value;
    });
    return messageObject;
  };

  // 🔹 Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !senderId || !ticketData?.ticketId) return;

    const receiverId = ticketData?.userId;

    if (!receiverId) {
      toast.error("Receiver not found.");
      return;
    }

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message: inputMessage,
      ticketId: ticketData.ticketId,
      timeStamp: new Date().toISOString(),
    };

    const s = socketRef.current;
    if (!s || !connected) {
      toast.error("Socket not connected.");
      return;
    }

    s.emit("private message", messageData, (response) => {
      if (response?.status !== "ok") {
        console.error("Failed to send message:", response?.error);
        toast.error("Message failed to send.");
      }
    });

    setInputMessage("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  };

  // 🔹 Handle file selection -> upload -> send with optional text
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await handleImageUpload(file);
    if (!imageUrl) return;

    const receiverId = ticketData?.userId;
    if (!receiverId) {
      toast.error("Receiver not found.");
      return;
    }

    const text = inputMessage && inputMessage.trim() ? inputMessage.trim() : "";
    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message: text || imageUrl,
      attachment: imageUrl,
      ticketId: ticketData.ticketId,
      timeStamp: new Date().toISOString(),
    };

    const s = socketRef.current;
    if (!s || !connected) {
      toast.error("Socket not connected.");
      return;
    }

    s.emit("private message", messageData, (response) => {
      if (response?.status !== "ok") {
        console.error("Failed to send message:", response?.error);
        toast.error("Message failed to send.");
      }
    });

    setInputMessage("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    // clear file input value so same file can be selected again if needed
    e.target.value = null;
  };

  // 🔹 Close ticket
  const closeTicket = async () => {
    const token = localStorage.getItem("User-admin-token");
    try {
      const response = await fetch(`${socketUrl}/admin/ticket/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "close" }),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      dispatch(fetchSingleUserTicket({ id, userType: "user" }));
      toast.success("Ticket closed successfully!");
      navigate("/user-support");
    } catch (error) {
      console.error("Close ticket error:", error);
      toast.error("Failed to close the ticket.");
    }
  };

  // 🔹 Render
  return (
    <>
      <ToastContainer />
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <img
            src={previewImage}
            alt="preview"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 10 }}
          />
        </div>
      )}

      <div className="body d-flex py-0 my-0">
        <div className="container-xxl py-0 my-0">
          <div className="chatSupport py-0 my-0">
            <div className="ticket">
              <div className="d-flex align-items-center gap-1">
                <span
                  className="ticketIconBtn"
                  onClick={() => window.history.back()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#fff",
                    cursor: "pointer"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.25 19L8.75 12L15.25 5" stroke="#1d67d6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h4 style={{ display: 'inline-block', margin: 0, marginLeft: "15px" }}>
                  Ticket: {ticketData.ticketId}
                </h4>
                {ticketData.app_version && <h4 style={{ display: 'inline-block', margin: 0, marginLeft: "15px" }}>
                  (App Version: {ticketData.app_version})
                </h4>}
                {ticketData.app_version && <h4 style={{ display: 'inline-block', margin: 0, marginLeft: "15px" }}>
                  (Platform: {ticketData.platform})
                </h4>}
              </div>
              <button onClick={closeTicket} className="closeButton">Close Ticket</button>
            </div>
            {messagesApiData[0] && senderId && (
              <div className="ticketMeta">
                <span><b>Name:</b> {parseMessage(messagesApiData[0].text)["Name"] || "N/A"}</span>
                <span><b>Email:</b> {parseMessage(messagesApiData[0]?.text)?.["Email"] && parseMessage(messagesApiData[0]?.text)?.["Email"] !== "undefined" ? parseMessage(messagesApiData[0]?.text)?.["Email"] : "N/A"}</span>
                <span><b>Mobile:</b> {parseMessage(messagesApiData[0].text)["Mobile"] || "N/A"}</span>
                <span><b>Subject:</b> {messagesApiData[0].text?.match(/Subject:\s*(.*)/)?.[1] || "N/A"}</span>
                <span style={{ gridColumn: "1 / -1" }}>
                  <b>Description:</b> {parseMessage(messagesApiData[0].text)["Description"] || "N/A"}
                </span>
                <span><b>Ticket ID:</b> {parseMessage(messagesApiData[0].text)["Ticket ID"] || "N/A"}</span>
              </div>
            )}
            <div className="ticketBody">
              {/* Combine and sort all messages */}
              {(() => {
                const allMessages = [];

                // Add API messages (skip first message if it's the ticket creation message)
                messagesApiData.forEach((msg, index) => {
                  if (index === 0 && String(msg?.senderId) !== senderId) {
                    const parsed = parseMessage(msg?.text || msg?.message || "");
                    allMessages.push({
                      ...msg,
                      id: `api-${index}`,
                      timestamp: msg.timestamp || msg.timeStamp,
                      text: parsed?.Description || "N/A",
                      isApi: true
                    });
                    return;
                  }
                  allMessages.push({
                    ...msg,
                    id: `api-${index}`,
                    timestamp: msg.timestamp || msg.timeStamp,
                    text: msg.text || msg.message,
                    isApi: true
                  });
                });

                // Add live socket messages
                messages.forEach((msg, index) => {
                  // Check if this message already exists in API messages to avoid duplicates
                  const isDuplicate = allMessages.some(apiMsg => {
                    const apiMsgId = apiMsg._id || apiMsg.id;
                    const msgId = msg._id || msg.timeStamp;
                    return apiMsgId === msgId ||
                      (apiMsg.timestamp === msg.timeStamp && apiMsg.text === msg.message);
                  });

                  if (!isDuplicate) {
                    allMessages.push({
                      ...msg,
                      id: `live-${index}`,
                      timestamp: msg.timeStamp || msg.timestamp,
                      text: msg.message || msg.text,
                      isApi: false
                    });
                  }
                });

                // Sort messages by timestamp
                allMessages.sort((a, b) => {
                  const timeA = new Date(a.timestamp || a.timeStamp || 0).getTime();
                  const timeB = new Date(b.timestamp || b.timeStamp || 0).getTime();
                  return timeA - timeB;
                });

                // Filter out empty messages
                const validMessages = allMessages.filter((msg) => {
                  const text = msg.text || msg.message || "";
                  const hasImage = (msg.attachment && isImage(msg.attachment)) || isImage(msg.text);
                  return text.trim() || hasImage;
                });

                // Group messages by date and add day separators
                const messagesWithSeparators = [];
                let lastDateKey = null;

                validMessages.forEach((msg, index) => {
                  const msgTimestamp = msg.timestamp || msg.timeStamp;
                  const currentDateKey = getDateKey(msgTimestamp);

                  // Add date separator if date changed
                  if (currentDateKey !== lastDateKey && msgTimestamp) {
                    const dayLabel = getDayLabel(msgTimestamp);
                    messagesWithSeparators.push({
                      type: "dateSeparator",
                      date: msgTimestamp,
                      label: dayLabel,
                      key: `date-${currentDateKey}`
                    });
                    lastDateKey = currentDateKey;
                  }

                  // Add the message
                  messagesWithSeparators.push({
                    ...msg,
                    type: "message"
                  });
                });

                // Render messages and separators
                return messagesWithSeparators.map((item) => {
                  // Render date separator
                  if (item.type === "dateSeparator") {
                    return (
                      <div key={item.key} className="dateSeparator">
                        {item.label}
                      </div>
                    );
                  }

                  // Render message
                  const msg = item;

                  // Determine recipient ID based on ticketData.userType
                  const recipientIdToCheck = ticketData?.userType === 'user'
                    ? ticketData?.userId
                    : ticketData?.astrologerId;

                  // Get message's recipientId
                  const messageRecipientId = msg?.recipientId || getReceiverId(msg);

                  // If message's recipientId matches ticket's user/astrologer ID, it's a sender message (RIGHT)
                  // Otherwise, it's a recipient message (LEFT)
                  const isSender = String(messageRecipientId) === String(recipientIdToCheck);

                  const msgKey = msg?.id || msg?._id || msg?.timeStamp || `msg-${Date.now()}-${Math.random()}`;

                  // Check if attachment is an image
                  const attachmentIsImage = msg.attachment && isImage(msg.attachment);
                  // Check if text/message field contains an image URL
                  const textIsImage = (msg.text && isImage(msg.text)) || (msg.message && isImage(msg.message));

                  // Get imageUrl if it exists
                  const imageUrl = attachmentIsImage
                    ? msg.attachment
                    : textIsImage
                      ? (msg.text || msg.message)
                      : null;

                  // Get text (only if it's not an image URL)
                  const messageText = imageUrl
                    ? ""
                    : (msg.text || msg.message || "").trim();

                  // Show image only if imageUrl exists, otherwise show text only
                  const shouldShowImage = !!imageUrl;
                  const shouldShowText = !imageUrl && !!messageText;

                  return (
                    <div key={msgKey} className={isSender ? "ChatRightOuter" : "ChatLeftOuter"}>
                      <div className={isSender ? "userChatRight" : "userChatLeft"}>
                        {shouldShowImage ? (
                          <div className="messageImageContainer">
                            <img
                              src={imageUrl}
                              alt="Message attachment"
                              className="messageImage"
                              onClick={() => setPreviewImage(imageUrl)}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        ) : shouldShowText ? (
                          <div className="messageText">{messageText}</div>
                        ) : null}
                        <small className="messageTime">
                          {msg.timestamp || msg.timeStamp
                            ? new Date(msg.timestamp || msg.timeStamp).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : ""}
                        </small>
                      </div>
                    </div>
                  );
                });
              })()}

              <div ref={messagesEndRef} />
            </div>

            <div className="chatButtomfix">
              <input
                type="file"
                id="userFileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              <div className="chatInputContainer">
                <button
                  className="attachButton"
                  onClick={() => document.getElementById('userFileInput')?.click()}
                  disabled={!connected}
                  title="Attach file"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <textarea
                  ref={textareaRef}
                  className="chatInputField"
                  placeholder="Type a message"
                  value={inputMessage}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputMessage && inputMessage.trim()) sendMessage();
                    }
                  }}
                  rows={1}
                />
                {inputMessage && inputMessage.trim() && (
                  <button
                    className="sendButtonIcon"
                    onClick={sendMessage}
                    disabled={!connected}
                    title="Send message"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserChatSupport;
