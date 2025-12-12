// utils/auth.js
export const handleUnauthorized = () => {
  localStorage.removeItem("student-admin-token");
  localStorage.removeItem("student-admin-data");
  window.location.href = "/sign-in"; 
};
