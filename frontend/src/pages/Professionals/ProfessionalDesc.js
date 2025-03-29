import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavbarComp from "../../components/Navbar/Navbar";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./ProfessionalDesc.css";
import DesignCard from "../../components/Cards/DesignCard";

const ProfessionalDesc = () => {
  const { id } = useParams(); // Get the professional ID from the route parameters
  const { user } = useAuthContext(); // Access the user authentication state

  const [professionalPersonalDesc, setProfessionalPersonalDesc] =
    useState(null); // Set initial state to null
  const [professionalDesc, setProfessionalDesc] = useState(null);
  const [designs, setDesigns] = useState([]); // Initialize designs state as an empty array
  console.log("professional personal", professionalPersonalDesc);
  console.log("professional desc", professionalDesc);
  console.log("designs", designs);

  // Function to handle the message request
  const handleMessageRequest = async () => {
    if (!user) {
      console.error("User object is null.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user.userId,
          receiverId: id,
        }),
      });
      if (response.ok) {
        // Handle success
        console.log("Message sent successfully");
        // You can update the UI or show a success message here if needed
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Check if user object exists before logging userId
  useEffect(() => {
    if (user) {
      console.log(user?.userId, "suid");
    }
  }, [user]);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/professionals/personal/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionalPersonalDesc(data); // Set the professionalDesc state with fetched data
          console.log("data", data);
        } else {
          console.error("Failed to fetch professional details");
        }
      } catch (error) {
        console.error("Error fetching professional details:", error);
      }
    };

    fetchProfessional();
  }, [id]); // Fetch professional details when ID changes

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/professionals/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionalDesc(data); // Set the professionalDesc state with fetched data
          console.log("data", data);
        } else {
          console.error("Failed to fetch professional details");
        }
      } catch (error) {
        console.error("Error fetching professional details:", error);
      }
    };
    if (user?.token) {
      fetchProfessional();
    }
  }, [id]);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/designs/${id}/designs`
        );
        if (response.ok) {
          const data = await response.json();
          setDesigns(data); // Set the designs state with fetched data
          console.log("designs", data);
        } else {
          console.error("Failed to fetch professional designs");
        }
      } catch (error) {
        console.error("Error fetching professional designs:", error);
      }
    };

    fetchDesigns();
  }, [id]); // Fetch designs when ID changes

  // Render loading state while waiting for data to be fetched
  // if (!professionalDesc || designs.length === 0) {
  //   return (
  //     <div>
  //       <NavbarComp />
  //       <div className="container">
  //         <h2>Loading...</h2>
  //       </div>
  //     </div>
  //   );
  // }

  // Render the professional description and designs once data is fetched
  // Render the professional description and designs once data is fetched
  return (
    <div>
      <div className="profedesc-container">
        <div className="professional-details">
          {professionalPersonalDesc && (
            <div className="personal-info">
              {professionalPersonalDesc?.profile ? (
                <img
                  src={`http://localhost:4000/${professionalPersonalDesc.profile}`}
                  alt="Profile Picture"
                  className="profile-image"
                />
              ) : (
                <img
                  src="./profile.png"
                  alt="Profile Picture"
                  className="profile-image"
                />
              )}
              <h1>{professionalPersonalDesc.username}</h1>
            </div>
          )}

          {professionalDesc && (
            <div className="professional-info">
              <h1>Professional Details</h1>
              <div>
                <h2>{professionalPersonalDesc?.email}</h2>
                <h2>Specialization: {professionalDesc?.specialization}</h2>
                <h3>Experience: {professionalDesc?.experience}</h3>
                <p>Skills: {professionalDesc?.skills}</p>
                <p>Education: {professionalDesc?.education}</p>
                <p>Contact: {professionalDesc?.contact}</p>
              </div>
            </div>
          )}
          {user ? (
            <div className="booking-links">
              <Link
                to={`/chat`}
                onClick={handleMessageRequest}
                className="btn-book-appoint"
              >
                Message Now
              </Link>
              <Link to={`/${id}/booking`} className="btn-book-appoint BookAppo">
                Book Appointment
              </Link>
            </div>
          ) : (
            <p>Please log in to book an appointment</p>
          )}
        </div>
        <div className="professional-designs">
          {designs.length > 0 && (
            <div className="designs-container">
              <h1>Professional Designs</h1>
              <div className="designs-grid">
                {designs.map((design) => (
                  <div key={design._id} className="design-card">
                    <Link to={`/design-desc/${design._id}`} className="card">
                      <div className="imag-container">
                        {design.designImages.length > 0 && (
                          <img
                            src={`http://localhost:4000/${design.designImages[0]}`}
                            alt={``}
                          />
                        )}
                      </div>
                      <div className="card-content">
                        <div className="header">
                          <h5 className="title">{design.designName}</h5>
                          <p className="rating">★ {design.averageRating}</p>
                        </div>
                        <p className="short-description">
                          {design.designDescription}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDesc;
