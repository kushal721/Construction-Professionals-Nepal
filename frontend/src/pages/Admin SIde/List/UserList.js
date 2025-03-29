import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import styled from "styled-components";
import { Modal } from "react-bootstrap";

import { Button } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../../components/Sidebar/Sidebar";

export default function UserList() {
  const [items, setItems] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedContact, setUpdatedContact] = useState("");
  const [updatedLocation, setUpdatedLocation] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [contactError, setContactError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [contactTouched, setContactTouched] = useState(false);
  const [locationTouched, setLocationTouched] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/userr");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const deleteUser = async (id) => {
    setDeleteUserId(id);
    setShowConfirmationPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await fetch(`http://localhost:4000/api/userr/${deleteUserId}`, {
        method: "DELETE",
      });

      setItems(items.filter((item) => item._id !== deleteUserId));
      setShowConfirmationPopup(false);
      toast.success("User deleted successfully!"); // Show success toast
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user."); // Show error toast
    }
  };

  const updateUserDetails = async (id) => {
    try {
      // Validation
      if (!updatedName.trim()) {
        setNameError("Name cannot be empty");
        return;
      } else {
        setNameError("");
      }
      if (!updatedEmail.trim()) {
        setEmailError("Email cannot be empty");
        return;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      } else {
        setEmailError("");
      }
      if (!updatedContact.trim()) {
        setContactError("Contact cannot be empty");
        return;
      } else {
        setContactError("");
      }
      if (!updatedLocation.trim()) {
        setLocationError("Location cannot be empty");
        return;
      } else {
        setLocationError("");
      }

      const formData = new FormData();
      formData.append("username", updatedName);
      formData.append("email", updatedEmail);
      formData.append("contactNumber", updatedContact);
      formData.append("location", updatedLocation);

      const response = await fetch(`http://localhost:4000/api/userr/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setShowModal(false);
      toast.success("User updated successfully!"); // Show success toast
      // You may need to refresh the data after updating a user
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user."); // Show error toast
    }
  };

  const cancelEditing = () => {
    setShowModal(false);
    setEditingRow(null);
    setUpdatedName("");
    setUpdatedEmail("");
    setUpdatedContact("");
    setUpdatedLocation("");
  };

  const editUser = (id, username, email, contact, location) => {
    setEditingRow(id);
    setUpdatedName(username);
    setUpdatedEmail(email);
    setUpdatedContact(contact);
    setUpdatedLocation(location);
    setShowModal(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmationPopup(false);
    setDeleteUserId(null);
  };

  const handleNameChange = (e) => {
    const username = e.target.value;
    setUpdatedName(username);
    setNameTouched(true);
    if (nameError && (username.trim() || nameTouched)) {
      setNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUpdatedEmail(email);
    setEmailTouched(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && (emailError || emailTouched)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleContactChange = (e) => {
    const contact = e.target.value;
    setUpdatedContact(contact);
    setContactTouched(true);
    if (contactError && (contact.trim() || contactTouched)) {
      setContactError("");
    }
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setUpdatedLocation(location);
    setLocationTouched(true);
    if (locationError && (location.trim() || locationTouched)) {
      setLocationError("");
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/userr");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const rows = items.map((item) => ({
    id: item._id,
    userName: item.username,
    userEmail: item.email,
    userContact: item.contactNumber,
    userLocation: item.location,
    userRole: item.role,
    userPassword: item.password,
    userProfile: item.profile,
  }));

  const columns = [
    { field: "id", headerName: "ID", width: 220 },
    { field: "userName", headerName: "User name", width: 150 },
    { field: "userEmail", headerName: "Email", width: 230 },
    { field: "userContact", headerName: "Contact", width: 150 },
    { field: "userLocation", headerName: "Location", width: 100 },
    { field: "userRole", headerName: "Role", width: 130 },
    { field: "userPassword", headerName: "Password", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 170,
      height: 190,
      renderCell: (params) => (
        <Actions>
          <Button
            type="button"
            color="failure"
            onClick={() => deleteUser(params.row.id)}
          >
            Delete
          </Button>
          <Button
            type="button"
            color="success"
            onClick={() =>
              editUser(
                params.row.id,
                params.row.userName,
                params.row.userEmail,
                params.row.userContact,
                params.row.userLocation
              )
            }
          >
            Edit
          </Button>
        </Actions>
      ),
    },
  ];

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div style={{ padding: "1%" }}>
        <div style={{ height: "84vh", width: "75vw" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={6}
            checkboxSelection
          />
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${nameError ? "is-invalid" : ""}`}
                    id="username"
                    value={updatedName}
                    onChange={handleNameChange}
                  />
                  {nameError && (
                    <div className="invalid-feedback">{nameError}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${emailError ? "is-invalid" : ""}`}
                    id="email"
                    value={updatedEmail}
                    onChange={handleEmailChange}
                  />
                  {emailError && (
                    <div className="invalid-feedback">{emailError}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="contact" className="form-label">
                    Contact
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      contactError ? "is-invalid" : ""
                    }`}
                    id="contact"
                    value={updatedContact}
                    onChange={handleContactChange}
                  />
                  {contactError && (
                    <div className="invalid-feedback">{contactError}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      locationError ? "is-invalid" : ""
                    }`}
                    id="location"
                    value={updatedLocation}
                    onChange={handleLocationChange}
                  />
                  {locationError && (
                    <div className="invalid-feedback">{locationError}</div>
                  )}
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => updateUserDetails(editingRow)}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            </Modal.Footer>
          </Modal>
          {showConfirmationPopup && (
            <div className="confirmation-popup">
              <h3>Are you sure you want to delete?</h3>
              <div className="popup-buttons">
                <button className="popup-button" onClick={handleConfirmDelete}>
                  Yes
                </button>
                <button className="popup-button" onClick={handleCancelDelete}>
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer /> {/* Toast container */}
    </div>
  );
}

const Actions = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;
