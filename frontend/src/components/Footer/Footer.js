import React from "react";
import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import "./Footer.css";
const FooterComp = () => {
  return (
    <Footer container className="bg-black footer">
      <div className="w-full text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between dark:text-white">
          <Footer.Brand
            href="/"
            className="footer-brand text-color" // Apply custom class here
          >
            {" "}
            Construction Professional Nepal
          </Footer.Brand>
          <Footer.LinkGroup>
            <Link to="/professionals" className="text-color">
              Professionals
            </Link>{" "}
            &nbsp;&nbsp;&nbsp;
            <Link to="/designs" className="text-color">
              Designs
            </Link>
            &nbsp;&nbsp;&nbsp;
            <Link to="/contact" className="text-color">
              Contact us
            </Link>
          </Footer.LinkGroup>
        </div>
        <Footer.Divider />
        <Footer.Copyright
          href="#"
          className="text-color"
          by="Construction Professionals Nepal"
          year={2022}
        />
      </div>
    </Footer>
  );
};

export default FooterComp;
