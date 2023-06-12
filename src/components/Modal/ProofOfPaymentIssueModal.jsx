import React from "react";
import "./ProofOfPaymentIssueModal.css";
import NoticeIcon from "../../assets/images/notice.png";
import { Link, useLocation } from "react-router-dom";

const ProofOfPaymentIssueModal = ({
  closePOPIssueModal,
  popIssue,
  orderId,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  let issueContent;
  let additionalInstructions;

  if (popIssue === "Insufficient Payment Amount") {
    issueContent =
      "It appears that the payment amount provided is insufficient.";
    additionalInstructions =
      "You have the following options to settle the remaining payment:";
    additionalInstructions += "\n1. Pay the remaining amount using GCash.";
    additionalInstructions +=
      "\n2. Provide the remaining amount in cash to the rider upon delivery.";
  } else if (popIssue === "Invalid Proof of Payment") {
    issueContent = "The proof of payment provided is invalid.";
    additionalInstructions = "Please re-upload a valid proof of payment.";
  } else {
    issueContent = "There is an issue with your proof of payment.";
    additionalInstructions =
      "Please review your payment details and ensure that the payment amount is correct and that the proof of payment provided is valid.";
  }

  return (
    <>
      <div className="paymentIssueModal__wrapper">
        <div className="paymentIssueModal__container">
          <div className="modal__close-btn">
            <button onClick={closePOPIssueModal}>
              <i className="ri-close-fill"></i>
            </button>
          </div>
          <div className="paymentIssueModal__header">
            {/* <h6>Proof of Payment Issue</h6> */}
            <h6>Proof of Payment Issue - Order ID: {orderId}</h6>
          </div>

          <div className="paymentIssueModal__content">
            <img className="notice__icon" src={NoticeIcon} alt="Notice image" />
            <p>
              We regret to inform you that there is an issue with your proof of
              payment. {issueContent}
            </p>
            {additionalInstructions && <p>{additionalInstructions}</p>}
            {/* <Link style={{ textDecoration: "none" }} to={`/orders/${orderId}`}>
              <button className="goToOrder__modalBtn">Go to Order</button>
            </Link> */}
            {currentPath !== `/orders/${orderId}` && (
              <Link
                style={{ textDecoration: "none" }}
                to={`/orders/${orderId}`}
              >
                <button className="goToOrder__modalBtn">Go to Order</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProofOfPaymentIssueModal;
