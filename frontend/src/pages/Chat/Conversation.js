import React, { useEffect, useState } from "react";
import { BiFontSize } from "react-icons/bi";
import "./Conversation.css";

const Conversation = ({ data, currentUserId, online }) => {
  const [userData, setUserData] = useState(null);
  console.log(currentUserId, "currenuser");
  console.log(online, "online");

  useEffect(() => {
    const otherUserId = data.members.find((id) => id !== currentUserId);

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/${otherUserId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setUserData(userData);
        console.log("Fetched user data:", userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [data, currentUserId]);

  return (
    <div className="conversation-item">
      {userData && (
        <>
          <div className="conversation-avatar-wrapper">
            {userData.profile ? (
              <img
                src={`http://localhost:4000/${userData.profile}`}
                alt={userData.username}
                className="conversation-avatar"
              />
            ) : (
              <div className="conversation-avatar-placeholder">
                {userData.username.charAt(0).toUpperCase()}
              </div>
            )}
            {online && <div className="online-dot active"></div>}
          </div>

          <div className="conversation-info">
            <div className="conversation-top">
              <h4 className="conversation-name">{userData.username}</h4>
              <span className="conversation-time">Just now</span>
            </div>
            <div className="conversation-meta">
              <span className={`conversation-status ${online ? "online" : ""}`}>
                {online ? "Online" : "Offline"}
              </span>
              <p className="conversation-preview">Click to see messages</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Conversation;
