// utils/apiutils.js
export async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Attempt to get more detailed error info, falling back gracefully
      let errorInfo = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.text(); // Read as text first
        // Store error body for structured error response
        // Try to parse as JSON for structured error, but don't fail if not JSON
        try {
          const jsonError = JSON.parse(errorBody);
          errorInfo = jsonError.message || jsonError.error || errorBody || errorInfo;
        } catch (e) {
          // errorBody wasn't JSON, use it as is if not empty
          errorInfo = errorBody || errorInfo;
        }
      } catch (e) {
        // Failed to get error body, stick with status text
        errorInfo = response.statusText || errorInfo;
      }
      const error = new Error(errorInfo);
      error.status = response.status; // Attach status code to the error object
      throw error;
    }
    return await response.json();
  } catch (error) {
    // Re-throw error for caller to handle
    throw error; // Re-throw to allow caller to handle
  }
}