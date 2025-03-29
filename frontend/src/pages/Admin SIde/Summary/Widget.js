import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FaUsers,
  FaUserCheck,
  FaUserAltSlash,
  FaUserTie,
  FaChartPie,
  FaChartBar,
} from "react-icons/fa";
import Chart from "chart.js/auto";

const UserSummaryReport = () => {
  // State to store user data
  const [userData, setUserData] = useState(null);
  // Refs to store the chart instances
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  // Fetch user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/userr");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, []);

  // Calculate summary based on user data
  const totalUsers = userData ? userData.length : 0;
  const adminUsers = userData
    ? userData.filter((user) => user.role === "admin").length
    : 0;
  const professionalUsers = userData
    ? userData.filter((user) => user.role === "professional").length
    : 0;
  const totalProfessionalUsers = professionalUsers
    ? professionalUsers.length
    : 0;
  const clientUsers = userData
    ? userData.filter((user) => user.role === "client").length
    : 0;
  const totalClientUsers = clientUsers ? clientUsers.length : 0;

  // Generate data for the pie chart
  const pieChartData = {
    labels: ["Admin Users", "Professionals User", "Client Users"],
    datasets: [
      {
        label: "User Roles",
        data: [adminUsers, professionalUsers, clientUsers],
        backgroundColor: ["green", "blue", "orange"],
      },
    ],
  };

  // Generate data for the bar chart
  const barChartData = {
    labels: ["Admin Users", "Professional Users", "Client Users"],
    datasets: [
      {
        label: "User Roles",
        data: [adminUsers, professionalUsers, clientUsers],
        backgroundColor: ["green", "blue", "orange"],
        borderColor: ["green", "blue", "orange"],
        borderWidth: 1,
      },
    ],
  };

  // Render the pie chart
  useEffect(() => {
    if (userData) {
      const ctx = document.getElementById("pieChart").getContext("2d");
      // Destroy previous chart instance if it exists
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }
      // Create new pie chart instance
      pieChartRef.current = new Chart(ctx, {
        type: "pie",
        data: pieChartData,
        options: {
          plugins: {
            legend: {
              position: "bottom",
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [userData]);

  // Render the bar chart
  useEffect(() => {
    if (userData) {
      const ctx = document.getElementById("barChart").getContext("2d");
      // Destroy previous chart instance if it exists
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
      // Create new bar chart instance
      barChartRef.current = new Chart(ctx, {
        type: "bar",
        data: barChartData,
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [userData]);

  return (
    <UserSummaryContainer>
      {/* Total Users */}
      <Widget
        data={{
          icon: <FaUsers />,
          digits: totalUsers,
          title: "Total Users",
          color: "blue",
          bgColor: "lightblue",
        }}
      />
      {/* Admin Users */}
      <Widget
        data={{
          icon: <FaUserTie />,
          digits: adminUsers,
          title: "Admin Users",
          color: "green",
          bgColor: "lavender",
        }}
      />
      {/* Regular Users */}
      <Widget
        data={{
          digits: clientUsers,
          title: "Client Users",
          color: "blue",
          bgColor: "lightyellow",
        }}
      />
      <Widget
        data={{
          digits: professionalUsers,
          title: "Professional Users",
          color: "skyblue",
          bgColor: "lightyellow",
        }}
      />
      {/* Pie Chart */}
      <ChartContainer>
        <Canvas id="pieChart" />
        <ChartIcon>
          <FaChartPie />
        </ChartIcon>
      </ChartContainer>
      {/* Bar Chart */}
      <ChartContainer>
        <Canvas id="barChart" />
        <ChartIcon>
          <FaChartBar />
        </ChartIcon>
      </ChartContainer>
    </UserSummaryContainer>
  );
};

const Widget = ({ data }) => {
  return (
    <StyledWidget>
      <Icon color={data.color} bgcolor={data.bgColor}>
        {data.icon}
      </Icon>
      <Text>
        <h3>{data.digits}</h3>
        <p>{data.title}</p>
      </Text>
    </StyledWidget>
  );
};

const UserSummaryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: flex-start
  lex-wrap: wrap
  justify-content: space-around;

  margin: 0px;
`;

const StyledWidget = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  background-color: ${(props) => props.bgColor || "powderblue"};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const Icon = styled.div`
  margin-right: 0.3rem;
  padding: 0.5rem;
  color: ${({ color }) => color};
  background: ${({ bgcolor }) => bgcolor};
  border-radius: 50%;
  font-size: 24px;
`;

const Text = styled.div`
  h3 {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 4px;
  }
  p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
  }
`;

const ChartContainer = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`;

const ChartIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
`;

export default UserSummaryReport;
