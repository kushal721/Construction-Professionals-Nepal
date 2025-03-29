

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
    <div className="ChatBox-container">
      <div>
        {chat ? (
          <>
            <div className="chat-header">
              {userData && (
                <div className="cb-user-info">
                  <div className="user-icon"></div>
                  <div className="cb-username">
                    <span className="headertitle">{userData.username}</span>
                  </div>
                </div>
              )}
            </div>
            <hr />
          </>
        ) : (
          <span className="chatbox-empty-message">
            Tap on a Chat to start Conversation...
          </span>
        )}
      </div>

      {/* Chatbox messages */}
      <div className="chat-body">
        {messages.map((message, index) => (
          <div
            ref={scroll}
            className={
              message.senderId === currentUser ? "message own" : "message"
            }
          >
            <span>{message.text}</span>
            <span>{format(message.createdAt)}</span>
          </div>
        ))}
      </div>

      {/* chat-sender */}
      <div className="chat-sender">
        <div></div>
        <InputEmoji
          value={newMessage}
          onChange={handleChange}
          onKeyPress={handleKeyPress} // Add this line to handle key press
        />
        <div className="send-button button" onClick={handleSend}>
          Send
        </div>
        <input type="file" name="" id="" style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default Chatbox;
