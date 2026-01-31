import React, { useState, useEffect, useRef } from "react";
import { FiMessageCircle, FiSearch, FiSend } from "react-icons/fi";
import { io } from "socket.io-client";
import { useAuthContext } from "../../hooks/useAuthContext";
import Conversation from "./Conversation";
import Chatbox from "./Chatbox";
import "./Chat.css";

const Chat = () => {
  const { user } = useAuthContext();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sendMessage, setSendMessage] = useState(null);
  const [receiveMessage, setReceiveMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const socket = useRef();

  // Send message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", user?.userId);
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
    socket.current.on("receive-message", (data) => {
      setReceiveMessage(data);
    });
  }, [user]);

  // Fetch user chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!user) {
          console.error("User object is null.");
          return;
        }

        const response = await fetch(
          `http://localhost:4000/api/chat/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [user]);

  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user.userId);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  const filteredChats = chats.filter((chat) =>
    chat.members.some(member =>
      member.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="chat-page">
      {/* Chat Sidebar */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2 className="chat-sidebar-title">
            <FiMessageCircle />
            Messages
          </h2>
          <span className="chat-count">{chats.length}</span>
        </div>

        {/* Search */}
        <div className="chat-search">
          <FiSearch className="chat-search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Chat List */}
        <div className="chat-list">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-list-item ${currentChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => setCurrentChat(chat)}
              >
                <Conversation
                  data={chat}
                  currentUserId={user.userId}
                  online={checkOnlineStatus(chat)}
                />
              </div>
            ))
          ) : (
            <div className="chat-empty-list">
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </aside>

      {/* Chat Main */}
      <main className="chat-main">
        {currentChat ? (
          <Chatbox
            chat={currentChat}
            currentUser={user?.userId}
            setSendMessage={setSendMessage}
            receiveMessage={receiveMessage}
          />
        ) : (
          <div className="chat-no-selection">
            <div className="chat-no-selection-content">
              <div className="chat-no-selection-icon">
                <FiMessageCircle />
              </div>
              <h3>Select a Conversation</h3>
              <p>Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
