// import React, { useState } from "react";
// import emailjs from "@emailjs/browser";
// import "./Contact.css";
// import SuccessAlert from "./alert";
// import { Button, TextField, Snackbar } from "@mui/material";

// const Contact = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [open, setOpen] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Check if any of the fields are empty
//     if (!name || !email || !message) {
//       setErrorMessage("Please fill in all fields");
//       setOpen(true);
//       return;
//     }

//     // Check if email is valid
//     if (!validateEmail(email)) {
//       setErrorMessage("Please enter a valid email address");
//       setOpen(true);
//       return;
//     }

//     // Your EmailJS service ID, template ID, and Public Key

//     const serviceId = "service_h70ilos";
//     const templateId = "template_gdhg6xi";
//     const publicKey = "19IeVuY6xFyLVA11L";

//     // Create a new object that contains dynamic template params
//     const templateParams = {
//       from_name: name,
//       from_email: email,
//       to_name: "Kushal",
//       message: message,
//     };

//     // Send the email using EmailJS
//     emailjs
//       .send(serviceId, templateId, templateParams, publicKey)
//       .then((response) => {
//         console.log("Email sent successfully!", response);
//         setName("");
//         setEmail("");
//         setMessage("");
//         setOpen(true); // Show success alert
//       })
//       .catch((error) => {
//         console.error("Error sending email:", error);
//       });
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const isSubmitDisabled = !name || !email || !message;

//   const validateEmail = (email) => {
//     // Regular expression for email validation
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   return (
//     <div className="email-form-container">
//       <div className="form-container">
//         <form onSubmit={handleSubmit} className="emailForm">
//           <h2>Contact Us</h2>
//           <br />
//           <div className="input-container">
//             <TextField
//               type="text"
//               placeholder="Your Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="input-field"
//               fullWidth
//             />
//           </div>
//           <div className="input-container">
//             <TextField
//               type="email"
//               placeholder="Your Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="input-field"
//               fullWidth
//             />
//           </div>
//           <div className="input-container">
//             <TextField
//               multiline
//               rows={4}
//               placeholder="Your Message"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               className="input-field textarea-field"
//               fullWidth
//             />
//           </div>
//           <Button variant="contained" type="submit" disabled={isSubmitDisabled}>
//             Send Email
//           </Button>
//         </form>
//         <SuccessAlert open={open} onClose={handleClose} />{" "}
//         {/* SuccessAlert component */}
//         <Snackbar
//           anchorOrigin={{ vertical: "top", horizontal: "center" }}
//           open={open}
//           autoHideDuration={6000}
//           onClose={handleClose}
//           message={errorMessage}
//         />
//       </div>
//     </div>
//   );
// };
// export default Contact;
import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css"; // Make sure to update your CSS as per the new styles below
import { Button, TextField, Snackbar } from "@mui/material";
import SuccessAlert from "./alert";
import FooterComp from "../../components/Footer/Footer";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if any of the fields are empty
    if (!name || !email || !message) {
      setErrorMessage("Please fill in all fields");
      setOpen(true);
      return;
    }

    // Check if email is valid
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setOpen(true);
      return;
    }

    // Your EmailJS service ID, template ID, and Public Key
    const serviceId = "service_h70ilos";
    const templateId = "template_gdhg6xi";
    const publicKey = "19IeVuY6xFyLVA11L";

    // Create a new object that contains dynamic template params
    const templateParams = {
      from_name: name,
      from_email: email,
      to_name: "Kushal",
      message: message,
    };

    // Send the email using EmailJS
    emailjs
      .send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log("Email sent successfully!", response);
        setName("");
        setEmail("");
        setMessage("");
        setOpen(true); // Show success alert
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isSubmitDisabled = !name || !email || !message;

  const validateEmail = (email) => {
    // Regular expression for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <>
      <div className="contact-container">
        <div className="contact-form">
          <h2 className="heading-2">Contact Us</h2>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Message"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            Send Message
          </Button>
        </div>
        <div className="contact-image">
          <img src="/images/contact.webp" alt="" />
        </div>
        <SuccessAlert open={open} onClose={handleClose} />{" "}
        {/* SuccessAlert component */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message={errorMessage}
        />
      </div>
      <FooterComp />
    </>
  );
};

export default Contact;
