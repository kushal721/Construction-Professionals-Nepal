
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import AddInformation from "./AddInformation"; // Import the AddInformation component
import EditProfile from "./EditProfile"; // Import the EditProfile component
import "./ProfeProfile.css";
import ChangePassword from "../../../components/ChangePassword/ChangePassword";
import { useAuthContext } from "../../../hooks/useAuthContext";
import styled from "styled-components";

const ProfeProfile = () => {
  // State variables to control the visibility of the Add Information popup and Edit Information popup
  const [showAddInfoPopup, setShowAddInfoPopup] = useState(false);
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [userData, setUserData] = useState({});
  const [professionalData, setProfessionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState({ myProfile: "" });
  const { user } = useAuthContext();
  const professionalId = user?.userId;
  const userId = user?.userId;
  console.log("user data", userData);
  console.log("p data", professionalData);
  console.log("pid", professionalId);
  console.log("profile", user?.profile);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const response = await fetch(
            `http://localhost:4000/api/userr/${user.userId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();

    const fetchProfessionalData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/professionals/${professionalId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionalData(data);
          console.log(data, "data");
          setLoading(false);
        } else {
          throw new Error("Failed to fetch professional data");
        }
      } catch (error) {
        console.error("Error fetching professional data:", error.message);
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfessionalData();
    }
  }, [user?.token]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  if (loading) {
    return <Loading>Loading...</Loading>;
  }

  return (
    <>
      <div className="maindiv">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="profile-container">
          <div className="profile-content">
            <div className="page-name">
              <div className="action-buttons">
                <button
                  className="action-button"
                  onClick={() => setShowAddInfoPopup(true)} // Show the Add Information popup when clicked
                >
                  Add Information
                </button>
                <button
                  className="action-button"
                  onClick={() => setShowEditProfilePopup(true)} // Show the Edit Profile popup when clicked
                >
                  Edit Profile
                </button>
                <button
                  className="action-button"
                  onClick={() => setShowChangePasswordPopup(true)}
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="profile-section">
              <div className="profile-info">
                <div className="profile-picture">
                  {userData?.profile?.length > 0 ? (
                    <img
                      src={`http://localhost:4000/${userData?.profile}`}
                      alt="Profile Picture"
                      className="profile-img"
                    />
                  ) : (
                    <img
                      src="./profile.png"
                      alt="Profile Picture"
                      className="profile-img"
                    />
                  )}
                </div>
                {/* <input
                    className="upload-input"
                    type="file"
                    lable="Image"
                    name="profile"
                    id="profile-upload"
                    accept=".jpeg, .png, .jpg"
                  /> */}

                <div className="info">
                  <span className="label">
                    Full Name: {userData?.username}{" "}
                  </span>

                  <span className="label">Email: {userData?.email}</span>
                  <span className="label">
                    Phone: {userData?.contactNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="profile-section">
              <h2 className="section-title">Professional Experience</h2>
              <div className="experience-item">
                <h3 className="experience-title">
                  Specialization: {professionalData?.specialization}
                </h3>
                <p className="experience-details">
                  Experience: {professionalData?.experience}
                </p>
                <p className="experience-description">
                  {professionalData?.description}
                </p>
              </div>
              {/* Add more experience items */}
            </div>

            {/* Skills */}
            <div className="profile-section">
              <h2 className="section-title">Skills</h2>
              <p>{professionalData?.skills}</p>
            </div>

            {/* Education */}
            <div className="profile-section">
              <h2 className="section-title">Education</h2>
              <div className="education-item">
                <p className="education-details">
                  {professionalData?.education}
                </p>
              </div>
              {/* Add more education items */}
            </div>

            {/* Contact Information */}

            {/* Add Information Popup */}
            {showAddInfoPopup && (
              <div className="add-info-popup">
                <AddInformation />
                <button
                  className="close-popup-btn"
                  onClick={() => setShowAddInfoPopup(false)} // Hide the Add Information popup when clicked
                >
                  ❌
                </button>
              </div>
            )}

            {/* Edit Profile Popup */}
            {showEditProfilePopup && (
              <div className="edit-profile-popup">
                <EditProfile />
                <button
                  className="close-popup-btn"
                  onClick={() => setShowEditProfilePopup(false)} // Hide the Edit Profile popup when clicked
                >
                  ❌
                </button>
              </div>
            )}

            {/* change password Popup */}
            {showChangePasswordPopup && (
              <div className="change-password-popup">
                <ChangePassword />
                <button
                  className="close-popup-btn"
                  onClick={() => setShowChangePasswordPopup(false)} // Hide the change password popup when clicked
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Loading = styled.div`
  margin-top: 50px;
  text-align: center;
  font-size: 24px;
  color: #6a5acd;
`;

export default ProfeProfile;

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
