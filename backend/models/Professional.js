import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema({
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: {
    type: String,
  },
  experience: {
    type: String, 
  },

  description: {
    type: String, 
  },
  skills: {
    type: String,
  },
  education: {
    type: String, 
  },
});

const ProfessionalModel = mongoose.model("Professional", professionalSchema);

export default ProfessionalModel;
