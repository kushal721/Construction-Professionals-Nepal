import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import "./Report.css"; // Import CSS for styling
import jsPDF from "jspdf";
import { Button } from "@mui/material";
import Sidebar from "../../../components/Sidebar/Sidebar";

const Report = () => {
  const [designData, setDesignData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportText, setReportText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/report/designs"
        );
        const data = await response.json();
        setDesignData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const generateReport = async () => {
      if (!designData || designData.length === 0) {
        setReportText("No design data available.");
        return;
      }

      let professionals = designData.filter(
        (item) => item.professional.role === "professional"
      );

      if (professionals.length === 0) {
        setReportText("No professional data available.");
        return;
      }

      let report = "Professional Report:\n\n";

      professionals.forEach((item, index) => {
        report += `${index + 1}. Professional Name: ${
          item.professional.username
        }\n`;
        report += `${index + 1}. Email: ${item.professional.email}\n`;

        if (item.designs && item.designs.length > 0) {
          report += ` - Design Name(Rating) -area(m2)-estimatecost(Rs.):\n`;
          item.designs.forEach((design) => {
            report += `  - ${design.designName}(${design.averageRating}) -${design.area}-${design.estimateCost}\n`;
          });
          report += ` - Total Designs: ${item.designs.length}\n\n`;
        } else {
          report += ` - No designs available.\n\n`;
        }
      });

      setReportText(report);
    };

    generateReport();
  }, [designData]);

  const exportReport = () => {
    const doc = new jsPDF();
    doc.text(reportText, 10, 10);
    doc.save("Professional_Report.pdf");
  };

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="report-container">
        <h3 className="report-heading">Professional Report</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <div>
            <Button className="export-button" onClick={exportReport}>
              Export Report
            </Button>
            <textarea
              className="report-textarea"
              rows={10}
              cols={50}
              readOnly
              value={reportText}
              style={{ resize: "none" }}
            />
          </div>
        )}
        <div className="bottom-info-container">
          <div className="user-count-container">
            <FaUsers className="users-icon" />
          </div>
          <div className="design-count-container">
            <span className="design-count">
              Total User: {designData ? designData.length : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
