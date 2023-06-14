import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import "../style/Home.css";
import HomeSlider from "../components/UI/HomeSlider";
import FoodCategorySlider from "../components/UI/FoodCategorySlider";
import Feedback from "../components/UI/Feedback";
import FeaturedProducts from "../components/UI/FeaturedProducts";
import CompanyBackground from "../components/UI/CompanyBackground";
import OurPartners from "../components/UI/OurPartners";
import OpeningHoursModal from "../components/Modal/OpeningHoursModal";

const Home = () => {
  const [showOpeningHoursModal, setShowOpeningHoursModal] = useState(false);
  const closeOpeningHoursModal = () => {
    setShowOpeningHoursModal(false);
  };

  // Display Opening Hours Modal when it exceeds on the specified time
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay();

    const openingHours = {
      weekdays: { start: "08:00:00", end: "19:00:00" }, // 8:00am - 7:00pm
      weekends: { start: "08:00:00", end: "20:00:00" }, // 8:00am - 8:00pm
    };

    const openingHoursPassed = () => {
      if (currentDay >= 1 && currentDay <= 5) {
        // Monday - Friday
        const { start, end } = openingHours.weekdays;
        const currentTime = today.toLocaleTimeString("en-US", {
          hour12: false,
        });
        return currentTime >= end;
      } else if (currentDay === 0 || currentDay === 6) {
        // Saturday - Sunday
        const { start, end } = openingHours.weekends;
        const currentTime = today.toLocaleTimeString("en-US", {
          hour12: false,
        });
        return currentTime >= end;
      }
      return false;
    };

    const isFirstVisit = sessionStorage.getItem("isFirstVisit");
    const isClosingTimePassed = openingHoursPassed();
    if (
      (!isFirstVisit && isClosingTimePassed) ||
      (isFirstVisit === "true" && isClosingTimePassed)
    ) {
      setShowOpeningHoursModal(true);
      sessionStorage.setItem("isFirstVisit", "false");
    }
  }, []);

  return (
    <div>
      {showOpeningHoursModal && (
        <OpeningHoursModal closeOpeningHoursModal={closeOpeningHoursModal} />
      )}

      {/*Home Slider Section*/}
      <section>
        <Container className="section__container">
          <HomeSlider />
        </Container>
      </section>

      {/*Featured Product Slider Section*/}
      <section>
        <Container className="section__container">
          <FeaturedProducts />
        </Container>
      </section>

      {/*Food Category Slider Section*/}
      <section>
        <Container className="section__container">
          <FoodCategorySlider />
        </Container>
      </section>

      {/*Feedback Section*/}
      <section>
        <Container className="section__container">
          <Feedback />
        </Container>
      </section>

      {/*About Us Section*/}
      <section className="section__container">
        <Container>
          <CompanyBackground />
        </Container>
      </section>

      {/* Our Partner Section */}
      <section className="section__container">
        <Container>
          <OurPartners />
        </Container>
      </section>
    </div>
  );
};

export default Home;
