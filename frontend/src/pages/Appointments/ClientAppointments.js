// import React, { useState, useEffect } from "react";
// import "./ClientAppointments.css";
// import { useAuthContext } from "../../hooks/useAuthContext";
// import NavbarComp from "../../components/Navbar/Navbar";
// import { toast, ToastContainer } from "react-toastify"; // Import toast for notifications

// const ClientAppointments = () => {
//   const [confirmedAppointments, setConfirmedAppointments] = useState([]);
//   const [pendingAppointments, setPendingAppointments] = useState([]);
//   const [cancelledAppointments, setCancelledAppointments] = useState([]);

//   const { user } = useAuthContext();
//   console.log(confirmedAppointments, "confirmedAppointments");
//   console.log(pendingAppointments, "pendingAppointments");
//   console.log(cancelledAppointments, "cancelledAppointments");

//   useEffect(() => {
//     const fetchClientAppointments = async () => {
//       try {
//         // Check if the user object or its token property is null
//         if (!user || !user?.token) {
//           console.error("User object or token is null.");
//           // You can display an error message or redirect the user to the login page
//           return;
//         }

//         const response = await fetch(
//           `http://localhost:4000/api/appointments/client-appointments`,
//           {
//             headers: {
//               Authorization: `Bearer ${user?.token}`,
//             },
//           }
//         );
//         if (response.ok) {
//           const data = await response.json();
//           if (Array.isArray(data.appointments)) {
//             // Filter appointments based on status
//             const confirmed = data.appointments.filter(
//               (appointment) => appointment.appointment?.status === "confirmed"
//             );
//             const pending = data.appointments.filter(
//               (appointment) => appointment.appointment?.status === "pending"
//             );
//             const cancelled = data.appointments.filter(
//               (appointment) => appointment.appointment?.status === "cancelled"
//             );
//             setConfirmedAppointments(confirmed);
//             setPendingAppointments(pending);
//             setCancelledAppointments(cancelled);
//           } else {
//             console.error("Appointments data is not an array:", data);
//           }
//         } else {
//           console.error("Failed to fetch client appointments");
//         }
//       } catch (error) {
//         console.error("Error fetching client appointments:", error);
//       }
//     };

//     if (user?.token) {
//       fetchClientAppointments();
//     }
//   }, [user]);

//   const handleDeleteAppointment = async (appointmentId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:4000/api/appointments/deleteCancelledAppointments/${appointmentId}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         }
//       );

//       // if (response.ok) {
//       //   setCancelledAppointments((currentAppointments) =>
//       //     currentAppointments.filter(
//       //       (appointment) => appointment?._id !== appointmentId
//       //     )
//       //   );
//       //   toast.success("Appointment deleted successfully!");
//       // } else {
//       //   toast.error("Failed to delete the appointment.");
//       // }
//       if (response.ok) {
//         setCancelledAppointments((currentAppointments) =>
//           currentAppointments.filter(
//             (appointment) => appointment?._id !== appointmentId
//           )
//         );
//         console.log("Updated cancelledAppointments state");
//         toast.success("Appointment deleted successfully!");
//       }
//     } catch (error) {
//       toast.error(`Error deleting appointment: ${error.message}`);
//     }
//   };

//   return (
//     <div className="client-appointments-container">
//       <ToastContainer
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//       <div className="appointment-section">
//         <h1 className="page-title">Your Confirmed Appointments</h1>
//         <AppointmentTable appointments={confirmedAppointments} />
//       </div>
//       <br />
//       <br />
//       <br />
//       <div className="appointment-section">
//         <h1 className="page-title">Pending Appointments</h1>
//         <AppointmentTable appointments={pendingAppointments} />
//       </div>
//       <div className="appointment-section">
//         <h1 className="page-title">Cancelled Appointments</h1>
//         <AppointmentTable
//           appointments={cancelledAppointments}
//           showDelete={true}
//           onDelete={handleDeleteAppointment}
//         />
//       </div>
//     </div>
//   );
// };

// const AppointmentTable = ({ appointments, showDelete, onDelete }) => (
//   <table className="appointment-table">
//     <thead>
//       <tr>
//         <th className="table-heading">Professional Name</th>
//         <th className="table-heading">Email</th>
//         <th className="table-heading">Contact Number</th>
//         <th className="table-heading">Date</th>
//         <th className="table-heading">Time</th>
//         <th className="table-heading">Location</th>
//         <th className="table-heading">Remark</th>
//         {showDelete && <th className="table-heading">Action</th>}
//       </tr>
//     </thead>
//     <tbody>
//       {appointments.length > 0 ? (
//         appointments.map((appointment) => (
//           <tr key={appointment._id}>
//             <td>{appointment.professionalDetails?.username}</td>
//             <td>{appointment.professionalDetails?.email}</td>
//             <td>{appointment.professionalDetails?.contactNumber}</td>
//             <td className="table-data">
//               {
//                 new Date(appointment.appointmentDetails?.date)
//                   .toISOString()
//                   .split("T")[0]
//               }
//             </td>
//             <td className="table-data">
//               {appointment.appointment?.appointmentTime}
//             </td>
//             <td className="table-data">
//               {appointment.appointmentDetails?.location}
//             </td>
//             <td className="table-data">{appointment.appointment?.remark}</td>
//             {showDelete && (
//               <td>
//                 <button
//                   onClick={() => onDelete(appointment.appointment?._id)}
//                   className="delete-btn"
//                 >
//                   Delete
//                 </button>
//               </td>
//             )}
//           </tr>
//         ))
//       ) : (
//         <tr>
//           <td colSpan={showDelete ? 8 : 7}>No appointments found.</td>
//         </tr>
//       )}
//     </tbody>
//   </table>
// );

// export default ClientAppointments;

import React, { useState, useEffect } from "react";
import "./ClientAppointments.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import NavbarComp from "../../components/Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClientAppointments = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const { user } = useAuthContext();

  useEffect(() => {
    const fetchClientAppointments = async () => {
      if (!user || !user?.token) {
        console.error("User object or token is null.");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/api/appointments/client-appointments`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setConfirmedAppointments(
          data.appointments.filter(
            (appointment) => appointment.appointment.status === "confirmed"
          )
        );
        setPendingAppointments(
          data.appointments.filter(
            (appointment) => appointment.appointment.status === "pending"
          )
        );
        setCancelledAppointments(
          data.appointments.filter(
            (appointment) => appointment.appointment.status === "cancelled"
          )
        );
      } else {
        console.error("Failed to fetch client appointments");
      }
    };

    if (user?.token) {
      fetchClientAppointments();
    }
    // fetchClientAppointments();
  }, [user]);

  const handleDeleteClick = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setShowConfirmationPopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/deleteCancelledAppointments/${appointmentToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        setCancelledAppointments((currentAppointments) =>
          currentAppointments.filter(
            (appointment) => appointment._id !== appointmentToDelete
          )
        );
        toast.success("Appointment deleted successfully!");
      } else {
        toast.error("Failed to delete the appointment.");
      }
    } catch (error) {
      toast.error(`Error deleting appointment: ${error.message}`);
    }

    setShowConfirmationPopup(false);
    setAppointmentToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmationPopup(false);
    setAppointmentToDelete(null);
  };

  return (
    <div className="client-appointments-container">
      <ToastContainer />
      <div className="appointment-section">
        <h1 className="page-title">Your Confirmed Appointments</h1>
        <AppointmentTable appointments={confirmedAppointments} />
        <br />
        <br />
        <br />
        <h1 className="page-title">Pending Appointments</h1>
        <AppointmentTable appointments={pendingAppointments} />
        <br />
        <br />
        <br />
        <h1 className="page-title">Cancelled Appointments</h1>
        <AppointmentTable
          appointments={cancelledAppointments}
          showDelete={true}
          onDelete={handleDeleteClick}
        />
      </div>

      {showConfirmationPopup && (
        <div className="confirmation-popup">
          <h3>Are you sure you want to delete?</h3>
          <div className="popup-buttons">
            <button className="popup-button" onClick={handleConfirmDelete}>
              Yes
            </button>
            <button className="popup-button" onClick={handleCancelDelete}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AppointmentTable = ({ appointments, showDelete, onDelete }) => (
  <table className="appointment-table">
    <thead>
      <tr>
        <th className="table-heading">Professional Name</th>
        <th className="table-heading">Email</th>
        <th className="table-heading">Contact Number</th>
        <th className="table-heading">Date</th>
        <th className="table-heading">Time</th>
        <th className="table-heading">Location</th>
        <th className="table-heading">Remark</th>
        {showDelete && <th className="table-heading">Action</th>}
      </tr>
    </thead>
    <tbody>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <tr key={appointment._id}>
            <td>{appointment.professionalDetails?.username}</td>
            <td>{appointment.professionalDetails?.email}</td>
            <td>{appointment.professionalDetails?.contactNumber}</td>
            <td className="table-data">
              {
                new Date(appointment.appointmentDetails?.date)
                  .toISOString()
                  .split("T")[0]
              }
            </td>
            <td className="table-data">
              {appointment.appointment?.appointmentTime}
            </td>
            <td className="table-data">
              {appointment.appointmentDetails?.location}
            </td>
            <td className="table-data">{appointment.appointment?.remark}</td>
            {showDelete && (
              <td>
                <button
                  onClick={() => onDelete(appointment.appointment._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={showDelete ? 8 : 7}>No appointments found.</td>
        </tr>
      )}
    </tbody>
  </table>
);

export default ClientAppointments;
