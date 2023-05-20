import React from "react";
import "./VerificationModal.css";
import MailSent from "../../assets/images/mail-sent.svg";
import { Link } from "react-router-dom";

const VerificationModal = ({
  closeVerificationModal,
  resendVerificationEmail,
}) => {
  return (
    <>
      <div className="verificationModal__wrapper">
        <div className="verificationModal__container">
          {/* <div className="verificationModal__close-btn">
            <button onClick={closeVerificationModal}>
              <i class="ri-close-fill"></i>
            </button>
          </div> */}
          <div className="verificationModal__header">
            <img src={MailSent} alt="Mail Sent Image" />
            <h6>Thank you for signing up!</h6>
          </div>

          <div className="verificationModal__content">
            <p>
              To activate your account, please verify by clicking the link sent
              to your registered email address.
            </p>

            <p>Did not receive an email?</p>
            <div className="verificationModal__actions">
              <button onClick={resendVerificationEmail}>
                Resend verification email
              </button>
              <button onClick={closeVerificationModal}>
                <Link to="/login">Proceed to Login Page</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationModal;
