import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import styled from "styled-components";
import Widget from "./Widget";
import axios from "axios";
import Sidebar from "../../../components/Sidebar/Sidebar";

const Summary = () => {
  const [users, setUsers] = useState([]);
  const [usersPercentage, setUsersPercentage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`http://localhost:4000/api/userr`);
        const sortedUsers = res.data.sort((a, b) => b._id - a._id);
        setUsers(sortedUsers);

        if (sortedUsers.length >= 2) {
          const percentage =
            ((sortedUsers[0].total - sortedUsers[1].total) /
              sortedUsers[1].total) *
            100;
          setUsersPercentage(percentage);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  const data = [
    {
      icon: <FaUsers />,
      digits: users[0]?.total || 0, // Showing total users
      title: "Users",
      color: "black",
      bgColor: "rgba(102,108,225,0.12)",
      percentage: usersPercentage.toFixed(2), // Ensure the percentage is rounded to two decimal places
    },
  ];

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <StyledSummary>
        <MainStats>
          <Overview>
            <Title>
              <h2>Overview</h2>
              <p>How the application is performing</p>
            </Title>
            <WidgetRapper>
              {data.map((data, index) => (
                <Widget key={index} data={data} />
              ))}
            </WidgetRapper>
          </Overview>
        </MainStats>
        <SideStats></SideStats>
      </StyledSummary>
    </div>
  );
};

export default Summary;

const SideStats = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
  width: 100%;
`;

const StyledSummary = styled.div`
  width: 100%;
  display: flex;
  padding: 2rem;
  flex-direction: column;
  justify-content: space-between; /* Center the content horizontally */
`;

const MainStats = styled.div`
  flex: 2;
  width: 100%;
`;

const Overview = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  padding: 1.5rem;
  height: 170px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2); /* Add box shadow for depth */
`;

const Title = styled.div`
  margin-bottom: 1rem; /* Add some space between title and widgets */
  p {
    font-size: 14px;
    color: #d4d4d4; /* Lighter text color */
  }
  h2 {
    color: #ffffff; /* White title */
    margin-bottom: 0.5rem; /* Add space below title */
  }
`;

const WidgetRapper = styled.div`
  display: flex;
  width: 100%;
  color: white;
  justify-content: space-between;
`;
