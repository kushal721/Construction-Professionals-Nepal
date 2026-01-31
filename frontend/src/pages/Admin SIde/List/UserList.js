import React, { useState, useEffect } from "react";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { FiTrash2, FiEdit2, FiSave, FiX, FiCheck } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import "react-toastify/dist/ReactToastify.css";

export default function UserList() {
  const [items, setItems] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    username: "",
    email: "",
    contactNumber: "",
    location: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/userr");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await fetch(`http://localhost:4000/api/userr/${deleteUserId}`, {
        method: "DELETE",
      });

      setItems(items.filter((item) => item._id !== deleteUserId));
      setShowDeleteModal(false);
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row.id);
    setUpdatedData({
      username: row.userName,
      email: row.userEmail,
      contactNumber: row.userContact,
      location: row.userLocation,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!updatedData.username?.trim()) newErrors.username = "Name is required";
    if (!updatedData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!updatedData.contactNumber?.trim()) newErrors.contactNumber = "Contact is required";
    if (!updatedData.location?.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("username", updatedData.username);
      formData.append("email", updatedData.email);
      formData.append("contactNumber", updatedData.contactNumber);
      formData.append("location", updatedData.location);

      const response = await fetch(`http://localhost:4000/api/userr/${editingRow}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update user");

      setShowEditModal(false);
      toast.success("User updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  const rows = items.map((item) => ({
    id: item._id,
    userName: item.username,
    userEmail: item.email,
    userContact: item.contactNumber,
    userLocation: item.location,
    userRole: item.role,
  }));

  const columns = [
    { field: "userName", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "userEmail", headerName: "Email", flex: 1.2, minWidth: 200 },
    { field: "userContact", headerName: "Contact", flex: 0.8, minWidth: 130 },
    { field: "userLocation", headerName: "Location", flex: 0.8, minWidth: 130 },
    {
      field: "userRole",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <span className={`role-badge ${params.value}`}>
          {params.value}
        </span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="action-buttons-row">
          <button
            className="icon-btn edit-btn"
            onClick={() => handleEditClick(params.row)}
            title="Edit"
          >
            <FiEdit2 />
          </button>
          <button
            className="icon-btn delete-btn"
            onClick={() => handleDeleteClick(params.row.id)}
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="User Management" subtitle="Manage all users, professionals, and admins">
      <div className="user-list-container" style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          className="custom-data-grid"
          sx={{
            [`& .${gridClasses.root}`]: {
              border: 'none',
              backgroundColor: 'white',
              borderRadius: '12px',
            },
            [`& .${gridClasses.columnHeaders}`]: {
              backgroundColor: '#f8fafc',
              color: '#64748b',
              fontSize: '0.9rem',
              fontWeight: '600',
            },
            [`& .${gridClasses.cell}`]: {
              borderBottom: '1px solid #f1f5f9',
              color: '#334155',
            },
            [`& .${gridClasses.row}:hover`]: {
              backgroundColor: '#f8fafc',
            },
          }}
        />
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={updatedData.username}
                  onChange={(e) => setUpdatedData({ ...updatedData, username: e.target.value })}
                  className={errors.username ? "error" : ""}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={updatedData.email}
                  onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Contact</label>
                <input
                  type="text"
                  value={updatedData.contactNumber}
                  onChange={(e) => setUpdatedData({ ...updatedData, contactNumber: e.target.value })}
                  className={errors.contactNumber ? "error" : ""}
                />
                {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={updatedData.location}
                  onChange={(e) => setUpdatedData({ ...updatedData, location: e.target.value })}
                  className={errors.location ? "error" : ""}
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpdate}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container small">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />

      <style jsx>{`
        .user-list-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .role-badge.admin {
          background: #e0f2fe;
          color: #0284c7;
        }
        
        .role-badge.professional {
          background: #f0fdf4;
          color: #16a34a;
        }
        
        .role-badge.client {
          background: #f1f5f9;
          color: #475569;
        }

        .action-buttons-row {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-btn {
          background: #eff6ff;
          color: #3b82f6;
        }

        .edit-btn:hover {
          background: #dbeafe;
        }

        .delete-btn {
          background: #fef2f2;
          color: #ef4444;
        }

        .delete-btn:hover {
          background: #fee2e2;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-container {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .modal-container.small {
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1e293b;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #475569;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .form-group input.error {
          border-color: #ef4444;
        }

        .error-text {
          font-size: 0.8rem;
          color: #ef4444;
          margin-top: 4px;
          display: block;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-primary, .btn-secondary, .btn-danger {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </DashboardLayout>
  );
}
