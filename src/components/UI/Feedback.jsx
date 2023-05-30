import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import DefaultAvatar from "../../assets/images/user-dark.png";
import "../../style/Feedback.css";
import Rating from "@mui/material/Rating";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { CustomPrevArrow, CustomNextArrow } from "../../globals/Slider";

// Firebase
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

const Feedback = () => {
  // Retrieve Feedback Data
  const [feedbackData, setFeedbackData] = useState([]);
  useEffect(() => {
    const feedbackRef = collection(db, "FeedbackData");
    const q = query(feedbackRef, where("posted", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbackDataList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort feedbackDataList in descending order based on rating
      feedbackDataList.sort((a, b) => b.rating - a.rating);

      setFeedbackData(feedbackDataList);
    });
    // Return the data realtime, reloading the page is not needed to reflect
    return unsubscribe;
  }, []);

  // console.log(feedbackData);

  // Slider Settings
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    arrows: true,
    prevArrow: <CustomPrevArrow arrowSize={40} />,
    nextArrow: <CustomNextArrow arrowSize={40} />,
    className: "feedback__slides",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="feedback__container">
      <h4>Customer Feedback</h4>
      <Slider {...settings}>
        {feedbackData.map((feedback) => {
          return (
            <div className="feedback__slides-item" key={feedback.uid}>
              <div className="feedback__content">
                {feedback?.profileImageUrl ? (
                  <img src={feedback?.profileImage} alt="User Avatar" />
                ) : (
                  <img src={DefaultAvatar} alt="Default Avatar" />
                )}

                <div className="feedback__group">
                  <label>{`${feedback?.firstName} ${feedback?.lastName}`}</label>
                  <Rating
                    className="feedback__rating"
                    emptyIcon={<StarBorderIcon />}
                    icon={
                      <StarIcon style={{ color: "var(--background-color2)" }} />
                    }
                    value={parseInt(feedback?.rating)}
                    readOnly={true}
                    style={{
                      fontSize: "1.5rem",
                    }}
                  />
                </div>
                <p>{feedback?.message}</p>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default Feedback;
