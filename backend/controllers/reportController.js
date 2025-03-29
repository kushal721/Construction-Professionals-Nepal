import Design from "../models/Design.js";
import Professional from "../models/Professional.js";
import UserModel from "../models/User.js";
import mongoose from "mongoose";

const getAllDesignsWithProfessionalDetails = async (req, res) => {
  try {
    // Fetch all professionals
    const professionals = await UserModel.find({}).select("-password");

    // Fetch designs for each professional
    const professionalsWithDetailsAndDesigns = await Promise.all(
      professionals.map(async (professional) => {
        // Fetch details of the professional
        const details = await Professional.findOne({
          professionalId: professional._id,
        });

        // Fetch designs for the professional
        const designs = await Design.find({ user_id: professional._id });

        // Return professional with details and designs
        return { professional, details, designs };
      })
    );

    // Return professionals with their details and designs
    res.json(professionalsWithDetailsAndDesigns);
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getAllDesignsWithProfessionalDetails };
