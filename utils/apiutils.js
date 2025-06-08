// utils/apiUtils.js
export const fetcher = async url => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    error.status = res.status;
    try {
      const body = await res.json();
      error.info = body.message || body.error || 'Server error';
    } catch (e) {
      error.info = res.statusText;
    }
    throw error;
  }
  return res.json();
};