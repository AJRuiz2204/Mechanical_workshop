// src/components/EstimateActions.jsx
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const EstimateActions = ({
  item,
  onViewPDF,
  onEdit,
  onDelete,
  onGenerateAccount,
}) => {
  const isPaid = item.isPaid;
  const authorizationStatus = item.estimate.authorizationStatus?.toLowerCase() || "";
  const isApproved = authorizationStatus === "approved";
  
  return (
    <>
      <Button
        variant="info"
        size="sm"
        className="me-2"
        onClick={() => onViewPDF(item.estimate.id)}
      >
        View PDF
      </Button>

      {!isPaid && (
        <>
          <Link to={`/estimate/edit/${item.estimate.id}`}>
            <Button
              variant="warning"
              size="sm"
              className="me-2"
              onClick={() => onEdit(item)}
            >
              Edit
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            className="me-2"
            onClick={() => onDelete(item.estimate.id)}
          >
            Delete
          </Button>

          <Button
            variant="success"
            size="sm"
            disabled={!isApproved}
            onClick={() => onGenerateAccount(item)}
            title={!isApproved ? "Estimate must be approved to generate invoice" : ""}
          >
            {item.accountReceivable ? "Payment" : "Generate Invoice"}
          </Button>
        </>
      )}
    </>
  );
};

EstimateActions.propTypes = {
  item: PropTypes.shape({
    estimate: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      authorizationStatus: PropTypes.string,
    }).isRequired,
    isPaid: PropTypes.bool.isRequired,
    accountReceivable: PropTypes.object,
  }).isRequired,
  onViewPDF: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onGenerateAccount: PropTypes.func.isRequired,
};

export default EstimateActions;
