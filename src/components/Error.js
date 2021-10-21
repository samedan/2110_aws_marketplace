import React from "react";

const Error = ({ errors }) => (
  <pre className="error">
    {errors.map((err, index) => (
      <div key={index}>{err.message}</div>
    ))}
  </pre>
);

export default Error;
