import React from "react";
import "./OpeningHoursModal.css";
import NoticeIcon from "../../assets/images/notice.png";
const OpeningHoursModal = ({ closeOpeningHoursModal }) => {
  return (
    <>
      <div className="openingHoursModal__wrapper">
        <div className="openingHoursModal__container">
          <div className="openingHoursModal__close-btn">
            <button onClick={closeOpeningHoursModal}>
              <i className="ri-close-fill"></i>
            </button>
          </div>
          <div className="openingHoursModal__header">
            <h6>Store Opening Hours</h6>
          </div>

          <div className="openingHoursModal__content">
            <img className="notice__icon" src={NoticeIcon} alt="Notice image" />
            <p>
              We apologize for the inconvenience, but our store is currently
              closed. Please note our regular opening hours:
            </p>
            <p>
              <strong>Monday - Friday:</strong> 8:00am - 7:00pm
            </p>
            <p>
              <strong>Saturday - Sunday:</strong> 8:00am - 8:00pm
            </p>
            <p>
              Even though our store is closed, you can still browse our website
              and use our mobile app to explore our products. Additionally, we
              encourage you to visit our Facebook page for updates and
              promotions:
            </p>
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

export default OpeningHoursModal;
