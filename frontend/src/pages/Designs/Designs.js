import React, { useState, useEffect } from "react";

import FooterComp from "../../components/Footer/Footer";

import { sortBy } from "lodash";
import { Pagination } from "@mui/material";
import DesignCard from "../../components/Cards/DesignCard";

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [sortedDesigns, setSortedDesigns] = useState([]);
  const [sortByOption, setSortByOption] = useState("designName");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [designsPerPage] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minEstimatedCost, setMinEstimatedCost] = useState("");
  const [maxEstimatedCost, setMaxEstimatedCost] = useState("");
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
      } catch (error) {
        console.error("Error fetching designs:", error.message);
      }
    };

    fetchDesigns();
  }, []);

  useEffect(() => {
    const sorted = sortBy(designs, sortByOption);
    setSortedDesigns(sorted);
  }, [designs, sortByOption]);

  useEffect(() => {
    let filtered = sortedDesigns.filter((design) =>
      design.designName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory !== "") {
      filtered = filtered.filter(
        (design) => design.category === selectedCategory
      );
    }
    if (minEstimatedCost !== "" && maxEstimatedCost !== "") {
      filtered = filtered.filter(
        (design) =>
          design.estimatedCost >= parseInt(minEstimatedCost) &&
          design.estimatedCost <= parseInt(maxEstimatedCost)
      );
    }
    if (minArea !== "" && maxArea !== "") {
      filtered = filtered.filter(
        (design) =>
          design.area >= parseInt(minArea) && design.area <= parseInt(maxArea)
      );
    }
    setFilteredDesigns(filtered);
  }, [
    sortedDesigns,
    searchTerm,
    selectedCategory,
    minEstimatedCost,
    maxEstimatedCost,
    minArea,
    maxArea,
  ]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastDesign = currentPage * designsPerPage;
  const indexOfFirstDesign = indexOfLastDesign - designsPerPage;
  const currentDesigns = filteredDesigns.slice(
    indexOfFirstDesign,
    indexOfLastDesign
  );

  // Function to sort designs based on multiple criteria
  const sortDesigns = (designs) => {
    switch (sortByOption) {
      case "designName":
        return sortBy(designs, "designName");
      case "authorName":
        return sortBy(designs, "authorName");
      case "category":
        return sortBy(designs, "category");
      case "estimatedCost":
        return sortBy(designs, (design) => parseFloat(design.estimatedCost));
      case "area":
        return sortBy(designs, (design) => parseFloat(design.area));
      default:
        return designs;
    }
  };

  return (
    <div>
      <div className="flex">
        <nav className="w-1000 md:w-1/4 bg-light p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-dark">Explore</h2>

          <div className="mb-4">
            <label
              htmlFor="sortBy"
              className="form-label text-sm font-medium text-dark mb-1"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              className="form-select p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={sortByOption}
              onChange={(e) => setSortByOption(e.target.value)}
            >
              <option value="designName">Design Name</option>
              <option value="authorName">Author Name</option>
            </select>
          </div>
          <div className="mb-4">
            <input
              type="text"
              className="form-control p-2 border rounded"
              placeholder="Search designs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="minArea"
              className="form-label text-sm font-medium text-dark mb-1"
            >
              Min Area
            </label>
            <input
              type="number"
              id="minArea"
              className="form-control p-2 border rounded"
              placeholder="Min Area"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="maxArea"
              className="form-label text-sm font-medium text-dark mb-1"
            >
              Max Area
            </label>
            <input
              type="number"
              id="maxArea"
              className="form-control p-2 border rounded"
              placeholder="Max Area"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
            />
          </div>
        </nav>

        <div className="w-full md:w-3/4 p-4">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Designs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortDesigns(currentDesigns).map((design) => (
              <DesignCard key={design._id} design={design} />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Pagination
              count={Math.ceil(filteredDesigns.length / designsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              color="primary"
            />
          </div>
        </div>
      </div>
      <FooterComp />
    </div>
  );
};

export default Designs;
