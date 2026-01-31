import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiGrid, FiChevronDown, FiX } from "react-icons/fi";
import { Pagination } from "@mui/material";
import { sortBy } from "lodash";
import DesignCard from "../../components/Cards/DesignCard";
import FooterComp from "../../components/Footer/Footer";
import "./Designs.css";

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortByOption, setSortByOption] = useState("designName");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [designsPerPage] = useState(9);
  const [showFilters, setShowFilters] = useState(false);
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/designs");
        if (!response.ok) {
          throw new Error("Failed to fetch designs");
        }
        const data = await response.json();
        setDesigns(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching designs:", error.message);
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  useEffect(() => {
    let filtered = designs.filter((design) =>
      design.designName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (minArea && maxArea) {
      filtered = filtered.filter(
        (design) =>
          design.area >= parseInt(minArea) && design.area <= parseInt(maxArea)
      );
    }

    const sorted = sortBy(filtered, sortByOption);
    setFilteredDesigns(sorted);
  }, [designs, searchTerm, sortByOption, minArea, maxArea]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const indexOfLastDesign = currentPage * designsPerPage;
  const indexOfFirstDesign = indexOfLastDesign - designsPerPage;
  const currentDesigns = filteredDesigns.slice(indexOfFirstDesign, indexOfLastDesign);

  const clearFilters = () => {
    setSearchTerm("");
    setSortByOption("designName");
    setMinArea("");
    setMaxArea("");
  };

  if (loading) {
    return (
      <div className="designs-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="designs-page">
      {/* Hero Banner */}
      <section className="designs-hero">
        <div className="designs-hero-content">
          <h1 className="designs-hero-title">Explore Our Designs</h1>
          <p className="designs-hero-subtitle">
            Discover stunning architectural designs for your dream home
          </p>

          {/* Search Bar */}
          <div className="hero-search">
            <FiSearch className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search designs by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
            {searchTerm && (
              <button className="hero-search-clear" onClick={() => setSearchTerm("")}>
                <FiX />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="designs-main">
        <div className="designs-container">
          {/* Toolbar */}
          <div className="designs-toolbar">
            <div className="toolbar-left">
              <span className="result-count">
                {filteredDesigns.length} designs found
              </span>
            </div>
            <div className="toolbar-right">
              <button
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter />
                Filters
              </button>
              <div className="sort-dropdown">
                <label>Sort by:</label>
                <select
                  value={sortByOption}
                  onChange={(e) => setSortByOption(e.target.value)}
                >
                  <option value="designName">Name</option>
                  <option value="estimatedCost">Price</option>
                  <option value="area">Area</option>
                  <option value="averageRating">Rating</option>
                </select>
                <FiChevronDown className="dropdown-icon" />
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Min Area (sqm)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Max Area (sqm)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                />
              </div>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          {/* Designs Grid */}
          {currentDesigns.length > 0 ? (
            <>
              <div className="designs-grid">
                {currentDesigns.map((design) => (
                  <DesignCard key={design._id} design={design} />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination-container">
                <Pagination
                  count={Math.ceil(filteredDesigns.length / designsPerPage)}
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
              <div className="no-results-icon">🏠</div>
              <h3>No designs found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <FooterComp />
    </div>
  );
};

export default Designs;
