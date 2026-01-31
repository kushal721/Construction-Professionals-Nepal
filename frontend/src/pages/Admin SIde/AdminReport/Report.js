import React, { useState, useEffect } from "react";
import { FiUsers, FiDownload, FiFileText } from "react-icons/fi";
import jsPDF from "jspdf";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import "./Report.css";

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
        (item) => item.professional?.role === "professional"
      );

      if (professionals.length === 0) {
        setReportText("No professional data available.");
        return;
      }

      let report = "CONSTRUCTION PROFESSIONALS NEPAL\n";
      report += "Professional Performance Report\n";
      report += `Generated on: ${new Date().toLocaleDateString()}\n`;
      report += "=================================================\n\n";

      professionals.forEach((item, index) => {
        report += `${index + 1}. Professional: ${item.professional.username}\n`;
        report += `   Email: ${item.professional.email}\n`;
        report += `   Contact: ${item.professional.contactNumber || 'N/A'}\n`;

        if (item.designs && item.designs.length > 0) {
          report += `   Designs Portfolio:\n`;
          item.designs.forEach((design) => {
            report += `    - ${design.designName} | Rating: ${design.averageRating || 0}/5 | Area: ${design.area}m2 | Cost: Rs.${design.estimateCost}\n`;
          });
          report += `   Total Designs: ${item.designs.length}\n`;
        } else {
          report += `   No designs uploaded yet.\n`;
        }
        report += "\n-------------------------------------------------\n\n";
      });

      setReportText(report);
    };

    generateReport();
  }, [designData]);

  const exportReport = () => {
    const doc = new jsPDF();

    // Set font size and type
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Split text to fit page width
    const splitText = doc.splitTextToSize(reportText, 180);

    // Add text to document
    doc.text(splitText, 15, 15);

    doc.save("CPN_Professional_Report.pdf");
  };

  if (loading) {
    return (
      <DashboardLayout title="System Reports" subtitle="View and export system reports">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Reports" subtitle="View and export system reports">
      <div className="report-card">
        <div className="report-header">
          <div className="report-title-section">
            <div className="report-icon">
              <FiFileText />
            </div>
            <div>
              <h3>Professional Activity Report</h3>
              <p>Comprehensive overview of professionals and their design portfolios</p>
            </div>
          </div>
          <button className="export-btn" onClick={exportReport}>
            <FiDownload />
            Export PDF
          </button>
        </div>

        {error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : (
          <div className="report-preview">
            <div className="preview-label">Report Preview</div>
            <textarea
              className="report-textarea"
              readOnly
              value={reportText}
            />
          </div>
        )}

        <div className="report-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-info">
              <span className="stat-value">{designData ? designData.length : 0}</span>
              <span className="stat-label">Total Professionals Tracked</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Report;
