import React from "react";
import "./Hero.css";
import { HiLocationMarker } from "react-icons/hi";

const Hero = () => {
  return (
    <section className="hero-wrapper">
      <div className="paddings innerWidth flexCenter hero-container ">
        {/* Left side */}
        <div className="flexColStart hero-left">
          <div className="hero-title">
            <h1>
              Discover Designs <br /> of Your Choices
              <br /> with Professionals
            </h1>
          </div>
          <div className="flexColStart hero-des">
            <span>
              Find a variety of house designs of your choice and the best
              professionals.
            </span>
            <br />
            <span>
              Get access to a wide range of house designs and connect with top
              professionals in the field.
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flexCenter hero-right"></div>
      </div>
    </section>
  );
};

export default Hero;
