import styled from "styled-components";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiCalendar,
  FiPlusCircle,
  FiUser,
  FiBarChart2,
  FiUsers,
  FiFileText,
  FiClipboard,
} from "react-icons/fi";
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
    <StyledSidebar>
      <SidebarHeader>
        <SidebarTitle>Dashboard</SidebarTitle>
      </SidebarHeader>

      <SideNav>
        {isProfessional() && (
          <>
            <NavLink to="/dashboard/my-designs">
              <FiLayers />
              My Designs
            </NavLink>
            <NavLink to="/dashboard/add-designs">
              <FiPlusCircle />
              Add Design
            </NavLink>
            <NavLink to="/dashboard/profe-appointments">
              <FiCalendar />
              Appointments
            </NavLink>
            <NavLink to="/dashboard/allappointments">
              <FiClipboard />
              All Appointments
            </NavLink>
            <NavLink to="/dashboard/addAppointment">
              <FiPlusCircle />
              Add Appointment
            </NavLink>
            <NavLink to="/dashboard/profe-profile">
              <FiUser />
              Profile
            </NavLink>
            <NavLink to="/dashboard/professionalsummary">
              <FiBarChart2 />
              Summary
            </NavLink>
          </>
        )}
        {isAdmin() && (
          <>
            <NavLink to="/dashboard/summary">
              <FiBarChart2 />
              Summary
            </NavLink>
            <NavLink to="/dashboard/manageusers">
              <FiUsers />
              Manage Users
            </NavLink>
            <NavLink to="/dashboard/adminreport">
              <FiFileText />
              Report
            </NavLink>
          </>
        )}
      </SideNav>
    </StyledSidebar>
  );
};

export default Sidebar;

const StyledSidebar = styled.div`
  width: 260px;
  min-height: calc(100vh - 80px);
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
`;

const SidebarTitle = styled.h2`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-600);
  margin: 0;
`;

const SideNav = styled.nav`
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NavLink = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  &.active {
    background: var(--primary-50);
    color: var(--primary-700);
    border-left-color: var(--primary-600);
    font-weight: 600;
  }

  svg {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;
