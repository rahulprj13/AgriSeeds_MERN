const Contact = require("../models/ContactModel.js");

// GET CONTACT INFO
exports.getContact = async (req, res) => {
  try {
    let contact = await Contact.findOne();

    if (!contact) {
      // Create default contact if none exists
      contact = await Contact.create({
        companyName: "SeedStore",
        address: "SeedStore Pvt. Ltd.",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        phone: "+91 98765 43210",
        email: "support@seedstore.com",
        workingHours: "Monday - Saturday: 9 AM – 7 PM",
        mapEmbedUrl: "https://maps.google.com/maps?q=Ahmedabad&t=&z=13&ie=UTF8&iwloc=&output=embed",
      });
    }

    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CONTACT INFO (ADMIN)
exports.updateContact = async (req, res) => {
  try {
    const { companyName, address, city, state, country, phone, email, workingHours, mapEmbedUrl } = req.body;

    // Validate required fields
    if (!companyName || !address || !city || !state || !country || !phone || !email) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    let contact = await Contact.findOne();

    if (!contact) {
      // Create new contact if none exists
      contact = await Contact.create({
        companyName,
        address,
        city,
        state,
        country,
        phone,
        email,
        workingHours,
        mapEmbedUrl,
      });
    } else {
      // Update existing contact
      contact = await Contact.findByIdAndUpdate(
        contact._id,
        {
          companyName,
          address,
          city,
          state,
          country,
          phone,
          email,
          workingHours,
          mapEmbedUrl,
        },
        { new: true }
      );
    }

    res.json({
      message: "Contact information updated successfully",
      contact,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
