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
    <>
      <div className="conversation" style={{ width: "100vh" }}>
        {userData && (
          <div className="user-info">
            {online && <div className="online-dot"> </div>}
            {/* <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600"> */}
            <svg
              className="relative w-15 h-12 text-gray-400 -left-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              ></path>
            </svg>

            <div className="username">
              <br />
              <span>{userData.username}</span>

              <br />
              <span style={{ fontSize: "0.8rem" }}>
                {online ? "Online" : "Ofline"}
              </span>
            </div>
            <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
          </div>
        )}
      </div>
    </>
  );
};

export default Conversation;
