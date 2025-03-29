

import React, { useState, useEffect } from "react";
import "./Professionals.css";
import NavbarComp from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProfessionalCard from "../../components/Cards/ProfessionalCard";
import { Pagination } from "@mui/material";

const Professionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [professionalsPerPage] = useState(6);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/userr/professionals"
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionals(data);
          setFilteredProfessionals(data); // Set filtered professionals initially to all professionals
        } else {
          console.error("Failed to fetch professionals");
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    };
    fetchProfessionals();
  }, []);
  console.log("sdfa0", professionals);
  console.log(searchLocation, "location");

  useEffect(() => {
    // Filter professionals based on search term and location
    const filtered = professionals.filter(
      (professional) =>
        professional.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        professional.location
          ?.toLowerCase()
          .includes(searchLocation.toLowerCase())
    );
    setFilteredProfessionals(filtered);
  }, [professionals, searchTerm, searchLocation]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastProfessional = currentPage * professionalsPerPage;
  const indexOfFirstProfessional =
    indexOfLastProfessional - professionalsPerPage;
  const currentProfessionals = filteredProfessionals.slice(
    indexOfFirstProfessional,
    indexOfLastProfessional
  );

  return (
    <div>
      <div className="container">
        <div className="left">
          <h2>Filter Search</h2>
          <div className="filter-search">
            <div className="mb-4">
              <input
                type="text"
                className="form-control p-2 border rounded"
                placeholder="Search professionals"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control p-2 border rounded"
                placeholder="Search by Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="right">
          <div className="designs">
            {currentProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional._id}
                professional={professional}
              />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Pagination
              count={Math.ceil(
                filteredProfessionals.length / professionalsPerPage
              )}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              color="primary"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Professionals;
