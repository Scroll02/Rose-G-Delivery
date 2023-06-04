import React from "react";
import "./AvailabilityModal.css";
const AvailabilityModal = ({ closeAvalabilityModal }) => {
  return (
    <>
      <div className="availabilityModal__wrapper">
        <div className="availabilityModal__container">
          <div className="modal__close-btn">
            <button onClick={closeAvalabilityModal}>
              <i className="ri-close-fill"></i>
            </button>
          </div>
          <div className="availabilityModal__header">
            <h6>Stock Availability Notice</h6>
          </div>

          <div className="availabilityModal__content">
            <p>
              We regret to inform you that we are unable to fulfill your order
              at this time. The requested quantity exceeds our current stock
              availability. We apologize for any inconvenience caused. If you
              would like to place a bulk order or require further assistance,
              please contact us at:
            </p>
            <div className="contactUs__item">
              <i className="ri-phone-line "></i>
              <span>0917-994-7550</span>
            </div>
            <div className="contactUs__item">
              <i className="ri-mail-line "></i>
              <a href="mailto:rose.g.special@gmail.com">
                rose.g.special@gmail.com
              </a>
            </div>
            <div className="contactUs__item">
              <i className="ri-facebook-circle-line"></i>
              <a
                href="https://www.facebook.com/people/Rose-Garden-Special-Palabok/100063606564417/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Rose Garden Special Palabok
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailabilityModal;
