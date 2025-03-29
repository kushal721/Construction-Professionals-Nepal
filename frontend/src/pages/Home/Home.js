// import React, { useEffect } from "react";
// import Hero from "../../components/Hero/Hero";
// import PopularDesigns from "../../components/PopularDesigns/PopularDesigns";
// import Footer from "../../components/Footer/Footer";
// import NavbarComp from "../../components/Navbar/Navbar";
// import Cookies from "js-cookie";

// const Home = () => {
//   return (
//     <div className="App">
//       <div>
//         <div className="white-gradient" />

//         <Hero />
//       </div>
//       <PopularDesigns />
//       <Footer />
//     </div>
//   );
// };

// export default Home;
import React from "react";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero/Hero";
import Footer from "../../components/Footer/Footer";
import NavbarComp from "../../components/Navbar/Navbar";
import "./home.css";

const Home = () => {
  return (
    <div className="App">
      <div>
        <div className="white-gradient" />
        <Hero />
      </div>
      <div className="services-container">
        <div className="service">
          <h3>Explore Designs</h3>
          <p>
            Discover a wide range of creative and innovative designs tailored to
            enhance your space.
          </p>
          <Link to="/designs">
            <button className="service-button">Explore Designs</button>
          </Link>
        </div>
        <div className="service">
          <h3>Find Professionals</h3>
          <p>
            Connect with experienced and skilled professionals to bring your
            vision to life.
          </p>
          <Link to="/professionals">
            <button className="service-button">Find Professionals</button>
          </Link>
        </div>
        <div className="service">
          <h3>Book Appointment</h3>
          <p>
            Schedule consultations at your convenience with our easy-to-use
            appointment booking system.
          </p>
          <Link to="/professionals">
            <button className="service-button">Book Appointment</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
