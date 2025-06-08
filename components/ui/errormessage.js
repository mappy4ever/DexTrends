// components/ui/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="p-4 my-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-app-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
    Error: {message}
  </div>
);

export default ErrorMessage;