import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiX, FiStar } from "react-icons/fi";
import { Pagination } from "@mui/material";
import ProfessionalCard from "../../components/Cards/ProfessionalCard";
import Footer from "../../components/Footer/Footer";
import "./Professionals.css";

const Professionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [professionalsPerPage] = useState(9);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/userr/professionals"
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionals(data);
          setFilteredProfessionals(data);
          setLoading(false);
        } else {
          console.error("Failed to fetch professionals");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  useEffect(() => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchLocation("");
  };

  const indexOfLastProfessional = currentPage * professionalsPerPage;
  const indexOfFirstProfessional = indexOfLastProfessional - professionalsPerPage;
  const currentProfessionals = filteredProfessionals.slice(
    indexOfFirstProfessional,
    indexOfLastProfessional
  );

  if (loading) {
    return (
      <div className="professionals-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading professionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="professionals-page">
      {/* Hero Banner */}
      <section className="professionals-hero">
        <div className="professionals-hero-content">
          <h1 className="professionals-hero-title">Find Your Expert Professional</h1>
          <p className="professionals-hero-subtitle">
            Connect with verified architects, engineers, and contractors across Nepal
          </p>

          {/* Search Filters */}
          <div className="hero-filters">
            <div className="hero-filter-group">
              <FiSearch className="filter-icon" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hero-filter-group">
              <FiMapPin className="filter-icon" />
              <input
                type="text"
                placeholder="Search by location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <button className="hero-search-btn">
              <FiSearch />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="professionals-main">
        <div className="professionals-container">
          {/* Toolbar */}
          <div className="professionals-toolbar">
            <div className="toolbar-left">
              <span className="result-count">
                {filteredProfessionals.length} professionals found
              </span>
            </div>
            <div className="toolbar-right">
              {(searchTerm || searchLocation) && (
                <button className="clear-btn" onClick={clearFilters}>
                  <FiX />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Professionals Grid */}
          {currentProfessionals.length > 0 ? (
            <>
              <div className="professionals-grid">
                {currentProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional._id}
                    professional={professional}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination-container">
                <Pagination
                  count={Math.ceil(filteredProfessionals.length / professionalsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  color="primary"
                  size="large"
                />
              </div>
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">👷</div>
              <h3>No professionals found</h3>
              <p>Try adjusting your search criteria</p>
              <button className="btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Professionals;
