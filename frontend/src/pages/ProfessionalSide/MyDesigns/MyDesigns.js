// import React, { useEffect, useState } from "react";
// import Sidebar from "../../../components/Sidebar/Sidebar";
// import "./MyDesigns.css"; // Import the CSS for MyDesigns
// import MyDesignCard from "../../../components/Cards/MyDesignsCard";
// import { useAuthContext } from "../../../hooks/useAuthContext";
// import styled from "styled-components";

// const MyDesigns = () => {
//   const [my_designs, setMy_Designs] = useState([]);
//   const { user } = useAuthContext();
//   const [loading, setLoading] = useState(true);

//   console.log("my designs", my_designs);
//   useEffect(() => {
//     const fetchDesigns = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:4000/api/designs/profe/getDesigns",
//           {
//             headers: {
//               Authorization: `Bearer ${user?.token}`,
//             },
//           }
//         );
//         if (response.ok) {
//           const data = await response.json();
//           setMy_Designs(data); // Set designs with fetched data
//           console.log(data, "data");
//           setLoading(false);
//         } else {
//           console.error("Failed to fetch designs");
//         }
//       } catch (error) {
//         console.error("Error fetching designs:", error);
//       }
//     };
//     if (user?.token) {
//       fetchDesigns();
//     }
//   }, [user]);

//   const handleDelete = (deletedId) => {
//     setMy_Designs((prevDesigns) =>
//       prevDesigns.filter((design) => design._id !== deletedId)
//     );
//   };

//   if (loading) {
//     return <Loading>Loading...</Loading>;
//   }

//   return (
//     <>
//       <div className="maindiv">
//         <div className="sidebar">
//           <Sidebar />
//         </div>
//         <div className="my-designs-container">
//           <div className="content">
//             <div className="search-box">
//               <input type="text" placeholder="Search designs..." />
//               <button>Search</button>
//             </div>
//             <div className="page-name">
//               <h1 className="page-title">My Designs</h1>
//             </div>
//             <div className="designs">
//               {my_designs.map((my_design) => (
//                 <div key={my_design._id}>
//                   <MyDesignCard my_design={my_design} onDelete={handleDelete} />
//                   {/* <Description design={design} /> */}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// const Loading = styled.div`
//   margin-top: 50px;
//   text-align: center;
//   font-size: 100px;
// `;

// export default MyDesigns;

import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./MyDesigns.css";
import MyDesignCard from "../../../components/Cards/MyDesignsCard";
import { useAuthContext } from "../../../hooks/useAuthContext";
import styled from "styled-components";

const MyDesigns = () => {
  const [myDesigns, setMyDesigns] = useState([]);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/designs/profe/getDesigns",
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMyDesigns(data);
          setLoading(false);
        } else {
          console.error("Failed to fetch designs");
        }
      } catch (error) {
        console.error("Error fetching designs:", error);
      }
    };

    if (user?.token) {
      fetchDesigns();
    }
  }, [user]);

  const handleDelete = (deletedId) => {
    setMyDesigns((prevDesigns) =>
      prevDesigns.filter((design) => design._id !== deletedId)
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter designs based on search term
  const filteredDesigns = myDesigns.filter(
    (design) =>
      design.designName &&
      design.designName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading>Loading...</Loading>;
  }

  return (
    <>
      <div className="maindiv">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="my-designs-container">
          <div className="content">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search designs..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button>Search</button>
            </div>
            <div className="page-name">
              <h1 className="page-title">My Designs</h1>
            </div>
            <div className="designs">
              {filteredDesigns.map((my_design) => (
                <div key={my_design._id}>
                  <MyDesignCard my_design={my_design} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Loading = styled.div`
  margin-top: 50px;
  text-align: center;
  font-size: 100px;
`;

export default MyDesigns;
