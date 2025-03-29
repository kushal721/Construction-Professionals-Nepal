// ErrorAlert.js
import React from "react";
import styled from "styled-components";
import { useLocation, Navigate } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";

const AlertBox = styled.div`
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #fff;
  background-color: ${(props) => (props.error ? "#f44336" : "#4caf50")};
  display: ${(props) => (props.error ? "block" : "none")};
  cursor: pointer;
`;

const ErrorAlert = () => {
  const { error, clearError } = useSignup();
  const location = useLocation();

  const handleErrorClose = () => {
    if (location.pathname !== "/") {
      clearError();
    }
  };

  return (
    <AlertBox error={error} onClick={handleErrorClose}>
      {error}
    </AlertBox>
  );
};

export default ErrorAlert;
