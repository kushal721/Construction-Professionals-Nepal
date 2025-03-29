import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";

export default function DesignList() {
  const [items, setItems] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedFullDesc, setUpdatedFullDesc] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/designs");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const editResource = (id, name, description, fullDesc) => {
    setEditingRow(id);
    setUpdatedName(name);
    setUpdatedDescription(description);
    setUpdatedFullDesc(fullDesc);
    setShowModal(true);
  };

  const saveChanges = async (id) => {
    try {
      if (!updatedName.trim()) {
        setNameError("Name cannot be empty");
        return;
      } else {
        setNameError("");
      }
      if (!updatedDescription.trim()) {
        setDescriptionError("Description cannot be empty");
        return;
      } else {
        setDescriptionError("");
      }

      const response = await fetch(`http://localhost:4000/api/designs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // authorName: updatedName,
          resourceName: updatedName,
          description: updatedDescription,
          fullDesc: updatedFullDesc, // Include fullDesc in the request body
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resource");
      }

      const updatedResourceData = await response.json();
      setItems(
        items.map((item) => (item._id === id ? updatedResourceData : item))
      );
      setEditingRow(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setNameError("");
    setDescriptionError("");
    setShowModal(false);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setUpdatedName(name);
    if (nameError && name.trim()) {
      setNameError("");
    }
  };

  const handleDescriptionChange = (e) => {
    const description = e.target.value;
    setUpdatedDescription(description);
    if (descriptionError && description.trim()) {
      setDescriptionError("");
    }
  };

  const handleFullDescChange = (e) => {
    const fullDesc = e.target.value;
    setUpdatedFullDesc(fullDesc);
  };

  const deleteResource = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/design/${id}`, {
        method: "DELETE",
      });

      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const rows = items.map((item) => ({
    id: item._id,
    name: item.resourceName,
    description: item.description,
    fullDesc: item.fullDesc,
    category: item.category,
  }));

  const columns = [
    { field: "id", headerName: "ID", width: 220 },
    { field: "name", headerName: "Name", width: 130 },
    { field: "description", headerName: "Description", width: 130 },
    { field: "fullDesc", headerName: "Full Description", width: 130 },
    { field: "category", headerName: "category", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 170,
      renderCell: (params) => (
        <Actions>
          <Button
            type="button"
            color="failure"
            onClick={() => deleteResource(params.row.id)}
          >
            Delete
          </Button>
          <Button
            type="button"
            color="success"
            onClick={() =>
              editResource(
                params.row.id,
                params.row.name,
                params.row.description,
                params.row.fullDesc // Pass fullDesc to editResource function
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
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />

      {showModal && (
        <EditModal>
          <h2>Edit Resource</h2>
          <input
            type="text"
            value={updatedName}
            onChange={handleNameChange}
            placeholder="Enter Name"
          />
          {nameError && <span className="error">{nameError}</span>}

          <textarea
            value={updatedDescription}
            onChange={handleDescriptionChange}
            placeholder="Enter Description"
          />
          {descriptionError && (
            <span className="error">{descriptionError}</span>
          )}
          <textarea
            value={updatedFullDesc}
            onChange={handleFullDescChange} // Add onChange for fullDesc
            placeholder="Enter Full Description"
          />
          {descriptionError && (
            <span className="error">{descriptionError}</span>
          )}
          <div>
            <button type="button" onClick={() => saveChanges(editingRow)}>
              Save
            </button>
            <button type="button" onClick={cancelEditing}>
              Cancel
            </button>
          </div>
        </EditModal>
      )}
    </div>
  );
}

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
`;

const EditModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 10px;
  }

  input,
  textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  button {
    margin-right: 10px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;
