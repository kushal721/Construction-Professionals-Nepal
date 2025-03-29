import React from "react";

const Error = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 - Not Found</h1>
      <p style={styles.text}>
        The page you are looking for might be unavailable or does not exist.
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
  },
  heading: {
    fontSize: "3em",
    marginBottom: "20px",
  },
  text: {
    fontSize: "1.5em",
  },
};

export default Error;
