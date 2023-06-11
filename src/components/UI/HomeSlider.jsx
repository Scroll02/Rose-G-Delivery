import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import HomeSliderImg1 from "../../assets/images/homeSliderImg1.png";
import HomeSliderImg2 from "../../assets/images/homeSliderImg2.png";
import HomeSliderImg3 from "../../assets/images/homeSliderImg3.png";
import "../../style/HomeSlider.css";
import { CustomPrevArrow, CustomNextArrow } from "../../globals/Slider";

// Firebase
import { db } from "../../firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const HomeSlider = () => {
  const [bannerData, setBannerData] = useState([]);

  useEffect(() => {
    const bannerRef = collection(db, "BannerSliderData");
    const unsubscribe = onSnapshot(bannerRef, (snapshot) => {
      const bannerDataList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBannerData(bannerDataList);
    });

    return unsubscribe;
  }, []);

  const settings = {
    autoplay: true,
    infinite: true,
    speed: 2500,
    autoplaySpeed: 4000,
    swipeToSlide: true,
    slideToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow arrowSize={40} />,
    nextArrow: <CustomNextArrow arrowSize={40} />,
    className: "home__slides",
    responsive: [
      {
        breakpoint: 600,
        settings: {
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          dots: true,
        },
      },
    ],
  };
  return (
    <Slider {...settings}>
      {bannerData.map((banner) => (
        <div className="homeSlider__img" key={banner.id}>
          <img src={banner.imageUrl} alt={banner.content} />
        </div>
      ))}
    </Slider>
  );
};

export default HomeSlider;
