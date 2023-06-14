import React from "react";
import "./ThankYouModal.css";
import ThankYouIcon from "../../assets/images/thank-you.png";

const ThankYouModal = ({ closeThankYouModal, thankYouModalOrder }) => {
  return (
    <div className="thankYouModal__wrapper">
      <div className="thankYouModal__container">
        <div className="thankYouModal__close-btn">
          {/* <button onClick={closeThankYouModal}> */}
          <button onClick={() => closeThankYouModal(thankYouModalOrder)}>
            <i className="ri-close-fill"></i>
          </button>
        </div>
        <div className="thankYouModal__header">
          <h6>Thank You for Your Order!</h6>
        </div>

        <div className="thankYouModal__content">
          <img className="thankYou__icon" src={ThankYouIcon} alt="Thank You" />
          <p>
            We want to express our heartfelt gratitude for your order. Your
            order has been successfully completed, and we hope it brings you joy
            and satisfaction.
          </p>
          <p>
            If you have any feedback or suggestions, we would love to hear from
            you. Please visit your profile and access your order history to
            provide your input. Your feedback is invaluable as it helps us
            improve our services. Thank you once again, and we can't wait to
            serve you in the future!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
