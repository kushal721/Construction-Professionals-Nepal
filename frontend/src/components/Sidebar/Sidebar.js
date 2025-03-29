
import styled from "styled-components";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  FaBook,
  FaComments,
  FaStore,
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaUserCog,
  FaFileAlt,
} from "react-icons/fa";
import { useLogout } from "../../hooks/useLogout";
import { useAuthContext } from "../../hooks/useAuthContext";

const Sidebar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
  };

  const isAdmin = () => {
    return user && user.role === "admin";
  };
  const isProfessional = () => {
    return user && user.role === "professional";
  };

  return (
    <StyledDashboard>
      <SideNav>
        {isProfessional() && (
          <>
            <NavLink to="/dashboard/my-designs">
              <FaBook /> My Designs
            </NavLink>
            <NavLink to="/dashboard/profe-appointments">
              <FaStore /> Appointments
            </NavLink>
            <NavLink to="/dashboard/allappointments">
              <FaStore /> All Appointments
            </NavLink>
            <NavLink to="/dashboard/add-designs">
              <FaStore /> Add Designs
            </NavLink>
            <NavLink to="/dashboard/addAppointment">
              <FaStore /> Add Appointment
            </NavLink>
            <NavLink to="/dashboard/profe-profile">
              <FaStore /> Profile
            </NavLink>
            <NavLink to="/dashboard/professionalsummary">
              <FaClipboardList /> Summary
            </NavLink>
          </>
        )}
        {isAdmin() && (
          <>
            <NavLink to="/dashboard/summary">
              <FaClipboardList /> Summary
            </NavLink>
            <NavLink to="/dashboard/manageusers">
              <FaUserCog /> Manage Users
            </NavLink>
            {/* <NavLink to="/dashboard/managedesigns">
              <FaUserCog /> Manage Designs
            </NavLink> */}
            <NavLink to="/dashboard/adminreport">
              <FaFileAlt /> Report
            </NavLink>
          </>
        )}
      </SideNav>
    </StyledDashboard>
  );
};

export default Sidebar;

const StyledDashboard = styled.div`
  display: flex;
  height: 88vh;
`;

const SideNav = styled.nav`
  border-right: 1px solid #e0e0e0;
  height: 100%;
  overflow-y: auto;
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #f5f5f5;

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const SidebarHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 22px;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
`;

const NavLink = styled(RouterNavLink)`
  color: #333;
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }

  &.active {
    color: #007bff;
    background-color: #cfe2ff;
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const LogoutContainer = styled.div`
  margin-top: auto;
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  span {
    font-weight: bold;
  }
`;

const LogoutButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;
