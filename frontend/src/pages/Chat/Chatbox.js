

// Chatbox.js
import React, { useEffect, useState, useRef } from "react";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";
import "./Chatbox.css";

const Chatbox = ({ chat, currentUser, setSendMessage, receiveMessage }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scroll = useRef();

  useEffect(() => {
    if (receiveMessage !== null && chat && receiveMessage.chatId === chat._id) {
      setMessages((prevMessages) => [...prevMessages, receiveMessage]);
    }
  }, [receiveMessage, chat]);

  useEffect(() => {
    if (!chat) return;

    const fetchUserData = async () => {
      const otherUserId = chat?.members?.find((id) => id !== currentUser);
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/${otherUserId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setUserData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/message/${chat._id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const messages = await response.json();
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchUserData();
    fetchMessages();
  }, [chat, currentUser]);

  const handleChange = (newMessage) => {
    setNewMessage(newMessage);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Check if chat exists before accessing its properties
    if (!chat) {
      console.error("Chat is not initialized");
      return;
    }

    const message = {
      senderId: currentUser,
      text: newMessage,
      chatId: chat._id,
    };

    try {
      const response = await fetch("http://localhost:4000/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }

    const receiverId = chat?.members?.find((id) => id !== currentUser);
    setSendMessage({ ...message, receiverId });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  //always scorll to last message
  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatbox">
      {chat ? (
        <>
          {/* Chatbox Header */}
          <header className="chatbox-header">
            {userData ? (
              <div className="chatbox-header-info">
                <div className="chatbox-header-avatar-wrapper">
                  {userData.profile ? (
                    <img
                      src={`http://localhost:4000/${userData.profile}`}
                      alt={userData.username}
                      className="chatbox-header-avatar"
                    />
                  ) : (
                    <div className="chatbox-header-avatar-placeholder">
                      {userData.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="online-indicator active"></div>
                </div>
                <div className="chatbox-header-text">
                  <h4 className="chatbox-header-name">{userData.username}</h4>
                  <p className="chatbox-header-status">Online</p>
                </div>
              </div>
            ) : (
              <div className="chatbox-header-loading">
                <div className="spinner-small"></div>
                <span>Loading user info...</span>
              </div>
            )}
          </header>

          {/* Chat Messages */}
          <div className="chatbox-messages">
            {messages.length > 0 ? (
              messages.map((message) => {
                const isOwn = message.senderId === currentUser;
                return (
                  <div
                    key={message._id}
                    ref={scroll}
                    className={`message-wrapper ${isOwn ? "own" : "other"}`}
                  >
                    {!isOwn && userData && (
                      <div className="message-avatar-container">
                        {userData.profile ? (
                          <img
                            src={`http://localhost:4000/${userData.profile}`}
                            alt={userData.username}
                            className="message-avatar"
                          />
                        ) : (
                          <div className="message-avatar-placeholder">
                            {userData.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="message-content">
                      <p className="message-text">{message.text}</p>
                      <span className="message-time">{format(message.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="chat-empty-messages">
                <div className="chat-empty-icon">👋</div>
                <p>Start a conversation with {userData?.username || "this user"}</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chatbox-input-area">
            <div className="chatbox-input-wrapper">
              <InputEmoji
                value={newMessage}
                onChange={handleChange}
                onEnter={handleSend}
                placeholder="Type a message..."
                fontFamily="Inter, sans-serif"
                borderColor="transparent"
                fontSize={15}
              />
              <button
                className="chatbox-send-btn"
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="chatbox-empty">
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
