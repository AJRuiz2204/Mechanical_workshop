import { useNavigate } from "react-router-dom";

/**
 * Unauthorized Component
 *
 * This component is displayed when a user tries to access a route
 * they don't have permission for.
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h1 className="display-1 text-danger">403</h1>
        <h2 className="mb-4">Unauthorized Access</h2>
        <p className="mb-4 text-muted">
          You don&apos;t have permission to access this page.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Go Back
          </button>
          <button className="btn btn-primary" onClick={handleGoHome}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
