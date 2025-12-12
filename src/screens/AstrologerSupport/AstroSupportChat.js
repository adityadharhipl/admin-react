import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleAstroTicket } from "../../Redux/Reducers/AstroTicketReducer";
import socket from "../../socket/socket";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AstrologerSupportList() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

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
    (state) => state?.AstroTicketReducer?.singleTicket || {}
  );

  const senderData = JSON.parse(localStorage.getItem("User-admin-data"));
  const senderId = String(senderData?._id);
  const messagesEndRef = useRef(null);

  const getSenderId = (msg) => {
    if (!msg?.sender) return null;
    return typeof msg.sender === "object" ? msg.sender._id : msg.sender;
  };

  const getReceiverId = (msg) => {
    if (!msg?.receiver) return null;
    return typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver;
  };

  const isImage = (url) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0];
    return /\.(jpeg|jpg|gif|png|webp|svg|heic)$/i.test(cleanUrl);
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

  useEffect(() => {
    if (id) dispatch(fetchSingleAstroTicket({ id, userType: "astro" }));
  }, [dispatch, id]);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      setConnected(true);
      if (senderId) socket.emit("new user", senderId);
      setIsInitialLoading(false);
    });
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [senderId]);

  useEffect(() => {
    if (!ticketData?.ticketId || !senderId) return;
    setIsPendingLoading(true);

    const privateMessageHandler = (message) => {
      if (message?.ticketId !== ticketData.ticketId) return;
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

    const pendingMessageHandler = (pendingMessages) => {
      const filtered = pendingMessages.filter((msg) => {
        return (
          msg?.ticketId === ticketData.ticketId &&
          (getSenderId(msg) === senderId || getReceiverId(msg) === senderId)
        );
      });
      setMessages((prev) => [...prev, ...filtered]);
      setIsPendingLoading(false);
    };

    socket.on("private message", privateMessageHandler);
    socket.on("pending messages", pendingMessageHandler);

    return () => {
      socket.off("private message", privateMessageHandler);
      socket.off("pending messages", pendingMessageHandler);
    };
  }, [ticketData?.ticketId, senderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesApiData]);

  useEffect(() => {
    const token = localStorage.getItem("User-admin-token");
    const fetchData = async () => {
      if (!ticketData?.ticketId) return;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/admin/chat/${ticketData.ticketId}`,
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
  }, [ticketData?.ticketId]);

  const parseMessage = (text) => {
    const parts = text?.split(",");
    const messageObject = {};
    parts?.forEach((part) => {
      const [key, value] = part?.split(":")?.map((item) => item?.trim());
      if (key && value) messageObject[key] = value;
    });
    return messageObject;
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/imageUpload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `${process.env.REACT_APP_ADMIN_TOKEN}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      const responseData = await response.json();
      const imageUrl = responseData?.data?.img[0];

      if (imageUrl) {
        toast.success("Image uploaded successfully!");
        return imageUrl;
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
      return null;
    }
  };

  const sendMessage = (messageContent) => {
    if (!senderId || !ticketData?.astrologerId || !ticketData?.ticketId) return;

    const messageData = {
      sender: senderId,
      receiver: ticketData.astrologerId,
      message: (messageContent || "").toString(),
      ticketId: ticketData.ticketId,
      timeStamp: new Date().toISOString(),
    };

    socket.emit("private message", messageData, (response) => {
      if (response?.status !== "ok") {
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        // Send image along with any typed message
        const text = inputMessage && inputMessage.trim() ? inputMessage.trim() : "";
        const messageContent = text || imageUrl;

        // include attachment field so backend can differentiate
        const messageData = {
          sender: senderId,
          receiver: ticketData.astrologerId,
          message: messageContent,
          attachment: imageUrl,
          ticketId: ticketData.ticketId,
          timeStamp: new Date().toISOString(),
        };

        socket.emit("private message", messageData, (response) => {
          if (response?.status !== "ok") {
            toast.error("Message failed to send.");
          }
        });

        setInputMessage("");
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  const closeTicket = async () => {
    const token = localStorage.getItem("User-admin-token");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/ticket/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "close" }),
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      dispatch(fetchSingleAstroTicket({ id, userType: "astro" }));
      toast.success("Ticket closed successfully!");
      navigate("/astrologer-support");
    } catch (error) {
      toast.error("Failed to close the ticket.");
    }
  };

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

      <div className="body d-flex">
        <div className="container-xxl">
          <div className="chatSupport">
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
                <span><b>Email:</b> {parseMessage(messagesApiData[0].text)["Email"] || "N/A"}</span>
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
                  const isSender = String(msg?.senderId || getSenderId(msg)) === senderId;
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
                style={{ display: "none" }}
                id="fileInput"
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="chatInputContainer">
                <button
                  className="attachButton"
                  onClick={() => document.getElementById('fileInput').click()}
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
                      if (inputMessage && inputMessage.trim()) sendMessage(inputMessage);
                    }
                  }}
                  rows={1}
                />
                {inputMessage && inputMessage.trim() && (
                  <button
                    className="sendButtonIcon"
                    onClick={() => sendMessage(inputMessage)}
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

export default AstrologerSupportList;





