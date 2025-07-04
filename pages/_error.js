import React from "react";
import Link from "next/link";

function Error({ statusCode }) {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 style={{ fontSize: 48, color: "#e53e3e" }}>Error {statusCode || 404}</h1>
      <p style={{ fontSize: 20, color: "#555" }}>
        {statusCode
          ? `An error ${statusCode} occurred on server.`
          : "An error occurred on client."}
      </p>
      <Link href="/" style={{ color: "#3182ce", textDecoration: "underline", marginTop: 24, display: "inline-block" }}>
        Go Home
      </Link>
    </div>
  );
}

// Removed getInitialProps to prevent Fast Refresh issues

export default Error;
