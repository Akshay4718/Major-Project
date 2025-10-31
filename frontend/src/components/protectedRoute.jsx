import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import Loading from "./Loading";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run checks after user is loaded and we have user data
    if (loading || !user) return;

    // Skip profile completion check if already on complete-profile page
    const isOnCompleteProfilePage = location.pathname.includes('/complete-profile/');

    // Check if profile is complete (only if not already on complete-profile page)
    if (!isOnCompleteProfilePage && (user.isProfileCompleted === 'false' || user.isProfileCompleted === false)) {
      if (user.role === 'student') {
        navigate(`/student/complete-profile/${user.id}`, { replace: true });
      } else if (user.role === 'tpo_admin') {
        navigate(`/tpo/complete-profile/${user.id}`, { replace: true });
      } else if (user.role === 'management_admin') {
        navigate(`/management/complete-profile/${user.id}`, { replace: true });
      }
      return;
    }

    // Check if user has wrong role - redirect to their proper dashboard
    if (!allowedRoles.includes(user.role)) {
      if (user.role === 'student') {
        navigate("/student/dashboard", { replace: true });
      } else if (user.role === 'tpo_admin') {
        navigate("/tpo/dashboard", { replace: true });
      } else if (user.role === 'management_admin') {
        navigate("/management/dashboard", { replace: true });
      } else if (user.role === 'superuser') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/404", { replace: true });
      }
    }
  }, [user, loading, navigate, allowedRoles, location.pathname]);

  // Show loading while fetching user
  if (loading) {
    return <Loading />;
  }

  // If no user after loading, redirect to home
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user doesn't have the required role, show loading while redirecting
  if (!allowedRoles.includes(user.role)) {
    return <Loading />;
  }

  // Check if on complete-profile page
  const isOnCompleteProfilePage = location.pathname.includes('/complete-profile/');

  // If profile not complete, show loading while redirecting (unless on complete-profile page)
  if (!isOnCompleteProfilePage && (user.isProfileCompleted === 'false' || user.isProfileCompleted === false)) {
    return <Loading />;
  }

  // All checks passed, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;

