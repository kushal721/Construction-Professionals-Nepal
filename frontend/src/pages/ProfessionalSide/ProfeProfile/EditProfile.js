import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./EditProfile.css";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css";

const EditProfile = () => {
  const { user } = useAuthContext();

  const [userData, setUserData] = useState({});
  const [professionalsData, setProfessionalsData] = useState({});
  const [showProfessionalsForm, setShowProfessionalsForm] = useState(false);

  useEffect(() => {
    // Fetch user data
    fetch(`http://localhost:4000/api/userr/${user?.userId}`)
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching user data: ", error);
      });

    // Fetch professionals data if user is a professional
    if (user?.isProfessional) {
      fetch(`http://localhost:4000/api/userr/professionals/${user?.userId}`)
        .then((response) => response.json())
        .then((data) => {
          setProfessionalsData(data);
        })
        .catch((error) => {
          console.error("Error fetching professionals data: ", error);
        });
    }
  }, [user]);

  const handleUserEdit = (e) => {
    e.preventDefault();
    // Update user data on the server
    const formData = new FormData();
    formData.append("profile", userData.profile); // Append profile photo
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("contactNumber", userData.contactNumber);

    fetch(`http://localhost:4000/api/userr/${user?.userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User data updated successfully: ", data);
        toast.success("User data updated successfully");
      })
      .catch((error) => {
        console.error("Error updating user data: ", error);
        toast.error("An error occurred while updating user data");
      });
  };

  const handleProfessionalsEdit = (e) => {
    e.preventDefault();
    // Update professionals data on the server
    fetch(`http://localhost:4000/api/userr/professionals/${user?.userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(professionalsData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Professionals data updated successfully: ", data);
        toast.success("Professionals data updated successfully");
      })
      .catch((error) => {
        console.error("Error updating professionals data: ", error);
        toast.error("An error occurred while updating professionals data");
      });
  };

  const isProfessional = () => {
    return user && user?.role === "professional";
  };

  return (
    <div className="edit-profile-container">
      <h1 className="edit-profile-heading">Edit Profile</h1>
      <form onSubmit={handleUserEdit} className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="profile" className="profile-picture">
            {userData?.profile?.length > 0 && (
              <img
                src={`http://localhost:4000/${userData?.profile}`}
                alt="Profile Picture"
                className="profile-img"
              />
            )}
          </label>
          <input
            type="file"
            name="profile"
            id="profile"
            accept=".jpeg, .png, .jpg"
            onChange={(event) =>
              setUserData({ ...userData, profile: event.target.files[0] })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username || ""}
            className="form-control"
            onChange={(event) =>
              setUserData({ ...userData, username: event.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email || ""}
            className="form-control"
            onChange={(event) =>
              setUserData({ ...userData, email: event.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Phone:
          </label>
          <input
            type="number"
            id="contactNumber"
            name="contactNumber"
            value={userData.contactNumber || ""}
            className="form-control"
            onChange={(event) =>
              setUserData({ ...userData, contactNumber: event.target.value })
            }
          />
        </div>
        <button type="submit" className="btn btn-primary save-btn">
          Save Changes
        </button>
      </form>

      {isProfessional() && (
        <div className="professionals-section mt-4">
          <button
            className="btn btn-secondary toggle-btn"
            onClick={() => setShowProfessionalsForm(!showProfessionalsForm)}
          >
            {showProfessionalsForm
              ? "Hide Professional Details"
              : "Edit Professional Details"}
          </button>
          {showProfessionalsForm && (
            <form
              onSubmit={handleProfessionalsEdit}
              className="professionals-form"
            >
              <div className="row">
                <div className="leftside">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="specialization" className="form-label">
                        Specialization:
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        className="form-control"
                        value={professionalsData.specialization || ""}
                        onChange={(event) =>
                          setProfessionalsData({
                            ...professionalsData,
                            specialization: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="experience" className="form-label">
                        Experience:
                      </label>
                      <input
                        type="text"
                        id="experience"
                        name="experience"
                        className="form-control"
                        value={professionalsData.experience || ""}
                        onChange={(event) =>
                          setProfessionalsData({
                            ...professionalsData,
                            experience: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="skills" className="form-label">
                        Skills:
                      </label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        className="form-control"
                        value={professionalsData.skills || ""}
                        onChange={(event) =>
                          setProfessionalsData({
                            ...professionalsData,
                            skills: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="leftside">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="education" className="form-label">
                        Education:
                      </label>
                      <input
                        type="text"
                        id="education"
                        name="education"
                        className="form-control"
                        value={professionalsData.education || ""}
                        onChange={(event) =>
                          setProfessionalsData({
                            ...professionalsData,
                            education: event.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description" className="form-label">
                        Description:
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        className="form-control"
                        value={professionalsData.description || ""}
                        onChange={(event) =>
                          setProfessionalsData({
                            ...professionalsData,
                            description: event.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary submit-btn">
                Save Changes
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default EditProfile;
