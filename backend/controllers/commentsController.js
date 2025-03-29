import User from "../models/User.js";
import Design from "../models/Design.js";
import Comment from "../models/Design.js";
import mongoose from "mongoose";

//controller to add comments
export const addComment = async (req, res) => {
  const { designId } = req.params;
  const { content, createdBy } = req.body;

  try {
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Fetch the commenter's details
    const commenter = await User.findById(createdBy);
    if (!commenter) {
      return res.status(404).json({ message: "Commenter not found" });
    }

    // Add commenter's name to the comment
    const comment = {
      content,
      createdBy,
      commenterName: commenter.username, // Add commenter's name here
    };

    design.comments.push(comment);
    await design.save();

    res.status(201).json({ comment, message: "Commented successfully" }); // Return the newly created comment
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update a comment for a design
export const updateComment = async (req, res) => {
  const { designId, commentId } = req.params;
  const { content } = req.body;

  try {
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    const comment = design.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.content = content;
    await design.save();

    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//controller to delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { designId, commentId } = req.params;
    const design = await Design.findByIdAndUpdate(
      designId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully", design });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to get all comments for a design
export const getComments = async (req, res) => {
  const { designId } = req.params;

  try {
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    res.status(200).json(design.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
