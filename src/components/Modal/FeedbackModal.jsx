import React, { useState, useEffect } from "react";
import "./FeedbackModal.css";
import Rating from "@mui/material/Rating";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

// Firebase
import {
  doc,
  addDoc,
  serverTimestamp,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../firebase";

// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../Toast/Toast";

const FeedbackModal = ({
  closeFeedbackModal,
  orderData,
  hasReviewed,
  handleHasReviewedChange,
}) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const [existingFeedbackId, setExistingFeedbackId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkIfReviewed = async () => {
      const feedbackRef = collection(db, "FeedbackData");
      const feedbackQuery = query(
        feedbackRef,
        where("uid", "==", auth.currentUser.uid),
        where("orderId", "==", orderData.orderId)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      if (feedbackSnapshot.size > 0) {
        handleHasReviewedChange(true); // Update hasReviewed in parent component
        setExistingFeedbackId(feedbackSnapshot.docs[0].id);
      }
    };
    checkIfReviewed();
  }, []);

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save feedback to database
      await addDoc(collection(db, "FeedbackData"), {
        orderId: orderData.orderId,
        uid: auth.currentUser.uid,
        firstName: orderData?.orderFirstName,
        lastName: orderData?.orderLastName,
        profileImage: orderData?.customerProfileImg,
        rating: rating,
        message: message,
        hasReviewed: true, // Mark as reviewed
        submittedDate: serverTimestamp(),
      });
      handleHasReviewedChange(true); // Update hasReviewed in parent component
      showSuccessToast(
        "Thank you for taking the time to leave your feedback!",
        2000
      );
      closeFeedbackModal();
      navigate("/userProfile");
    } catch (error) {
      console.error(error);
      showErrorToast(
        "An error occurred while saving your feedback. Please try again.",
        2000
      );
    }
  };

  return (
    <div className="feedbackModal__wrapper">
      <div className="feedbackModal__container">
        <div className="feedbackModal__header">
          <h6>Leave a Review</h6>
          <button
            className="feedbackModal__close-btn"
            onClick={closeFeedbackModal}
          >
            <i className="ri-close-fill"></i>
          </button>
        </div>
        <div className="feedbackModal__content">
          <form>
            <div className="feedbackModalForm__group">
              <label htmlFor="rating">Rating:</label>
              <Rating
                className="feedback__rating"
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
                icon={<StarIcon fontSize="inherit" />}
                value={parseInt(rating)}
                onChange={handleRatingChange}
                style={{ fontSize: "2rem" }}
              />
            </div>
            <div className="feedbackModalForm__group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                rows="5"
                value={message}
                onChange={handleMessageChange}
                maxlength="200"
              ></textarea>
            </div>
            <div className="feedbackModal__actions">
              <button onClick={handleSubmit}>Send</button>
              <button onClick={closeFeedbackModal}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
