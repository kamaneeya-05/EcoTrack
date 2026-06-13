// contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('./contactModel');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      message
    });

    await newContact.save();
    res.status(200).json({ message: 'Contact form submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting contact form', error });
  }
});

module.exports = router;
