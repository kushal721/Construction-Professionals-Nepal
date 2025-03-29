import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaUserTie, FaChartBar, FaUsers } from "react-icons/fa";
import { useAuthContext } from "../../../hooks/useAuthContext";
import Sidebar from "../../../components/Sidebar/Sidebar";

const ProfessionalSummary = () => {
  const { user } = useAuthContext();
  const [professionalDesigns, setProfessionalDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionalDesigns = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/designs/profe/getDesigns",
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionalDesigns(data);
          setLoading(false);
        } else {
          throw new Error("Failed to fetch professional designs");
        }
      } catch (error) {
        console.error("Error fetching professional designs:", error.message);
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfessionalDesigns();
    }
  }, [user?.token]);

  if (loading) {
    return <Loading>Loading...</Loading>;
  }

  // Calculate total designs uploaded by the professional
  const totalDesigns = professionalDesigns.length;

  // Calculate number of designs with ratings
  const ratedDesigns = professionalDesigns.filter(
    (design) => design.averageRating > 0
  ).length;

  // Calculate total ratings
  const totalRatings = professionalDesigns.reduce(
    (acc, design) => acc + design.totalRatings,
    0
  );

  // Calculate total comments
  const totalComments = professionalDesigns.reduce(
    (acc, design) => acc + design.comments.length,
    0
  );

  return (
    <Container>
      <Sidebar />
      <WidgetsContainer>
        <Widget
          icon={<FaUsers />}
          digits={totalDesigns}
          title="Total Designs"
          color="blue"
          bgColor="lightblue"
        />
        {/* Admin Users */}
        <Widget
          icon={<FaUserTie />}
          digits={totalComments}
          title="Total Comments"
          color="purple"
          bgColor="lavender"
        />
        {/* Regular Users */}
        <Widget
          digits={totalRatings}
          title="Total Ratings"
          color="orange"
          bgColor="lightgreen"
        />
      </WidgetsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  margin-top: 50px;
`;

const WidgetsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 80px;
`;

const Widget = ({ icon, digits, title, color, bgColor }) => (
  <StyledWidget bgColor={bgColor}>
    <WidgetIcon color={color}>{icon}</WidgetIcon>
    <WidgetText>{title}</WidgetText>
    <WidgetValue>{digits}</WidgetValue>
  </StyledWidget>
);

const StyledWidget = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ bgColor }) => bgColor || "#f2f2f2"};
  border-radius: 8px;
  text-align: center;
  margin: 0 10px;
`;

const WidgetIcon = styled.div`
  font-size: 36px;
  color: ${({ color }) => color};
`;

const WidgetText = styled.div`
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
`;

const WidgetValue = styled.div`
  margin-top: 5px;
  font-size: 24px;
  font-weight: bold;
`;

const Loading = styled.div`
  margin-top: 50px;
  text-align: center;
  font-size: 100px;
`;

export default ProfessionalSummary;
