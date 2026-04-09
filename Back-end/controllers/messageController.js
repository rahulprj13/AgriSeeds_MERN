const MessageModel = require("../models/MessagesModel");

// Submit a new contact message
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    const contact = new MessageModel({
      name,
      email,
      subject,
      message,
    });

    await contact.save();

    res.status(201).send({
      success: true,
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in sending message",
      error: error.message,
    });
  }
};

// Get all contact messages for admin
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await MessageModel.find({}).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      countTotal: messages.length,
      message: "All contact messages",
      messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting messages",
      error: error.message,
    });
  }
};

// Mark a message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await MessageModel.findByIdAndUpdate(
      id,
      { status: "Read" },
      { new: true }
    );

    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Message marked as read",
      updatedMessage: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while marking message as read",
      error: error.message,
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await MessageModel.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting message",
      error: error.message,
    });
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  deleteMessage,
};