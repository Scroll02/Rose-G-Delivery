import React from "react";
import "./Modal.css";
const ConfirmationModal = ({
  closeConfirmationModal,
  handlePayCashToRider,
}) => {
  return (
    <>
      <div className="modal__wrapper">
        <div className="modal__container">
          {/* <div className="modal__close-btn">
        <button onClick={closeModal}>
          <i class="ri-close-fill"></i>
        </button>
      </div> */}
          <div className="modal__header">
            <h6>Confirmation</h6>
          </div>

          <div className="modal__content">
            <p>Are you sure you want to pay cash to the rider?</p>
            <div className="modal__actions">
              <button onClick={handlePayCashToRider}>Yes</button>
              <button onClick={closeConfirmationModal}>No</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
