// utils/apiutils.js
export async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Attempt to get more detailed error info, falling back gracefully
      let errorInfo = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.text(); // Read as text first
        // Log more detailed error if possible, without breaking if errorBody isn't JSON
        console.error(`API Error ${response.status} for ${url}: ${errorBody}`);
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
    // Log the error before re-throwing, if not already an API error logged above
    if (!error.status) { // Avoid double logging for API errors
        console.error(`Fetch error for ${url}:`, error.message);
    }
    throw error; // Re-throw to allow caller to handle
  }
}