import React from "react";

function Error({ statusCode }) {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 style={{ fontSize: 48, color: "#e53e3e" }}>Error {statusCode || 404}</h1>
      <p style={{ fontSize: 20, color: "#555" }}>
        {statusCode
          ? `An error ${statusCode} occurred on server.`
          : "An error occurred on client."}
      </p>
      <a href="/" style={{ color: "#3182ce", textDecoration: "underline", marginTop: 24, display: "inline-block" }}>
        Go Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
