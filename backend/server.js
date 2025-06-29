// 🟢 Load environment variables
const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

console.log('Email:', process.env.EMAIL_USER);
console.log('Password set:', !!process.env.EMAIL_PASS);
console.log('Recipient:', process.env.RECIPIENT_EMAIL);

console.log("🟢 Starting the server...");

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Harsh:harshith.007@harsh0portfolio.fiqfheo.mongodb.net/portfolioComments?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Email setup
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Mongoose Schema
const commentSchema = new mongoose.Schema({
  name: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 }
  }
});
const Comment = mongoose.model('Comment', commentSchema);

// 📥 Save comment
app.post('/comments', async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ message: 'Name and message are required' });
  }

  try {
    const newComment = new Comment({ name, message });
    await newComment.save();
    res.json({ message: '✅ Comment saved!' });
  } catch (err) {
    console.error('❌ Error saving comment:', err);
    res.status(500).json({ message: 'Failed to save comment' });
  }
});

// 📤 Get comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ timestamp: -1 });
    res.json(comments);
  } catch (err) {
    console.error('❌ Error fetching comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// 🗑️ Delete comment
app.delete('/comments/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Comment deleted!' });
  } catch (err) {
    console.error('❌ Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// 🔁 React to comment
app.patch('/comments/:id/reactions', async (req, res) => {
  const { reaction } = req.body;
  if (!['like', 'love', 'laugh'].includes(reaction)) {
    return res.status(400).json({ message: 'Invalid reaction type' });
  }

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.reactions[reaction] += 1;
    await comment.save();

    res.json({ message: `✅ ${reaction} added`, reactions: comment.reactions });
  } catch (err) {
    console.error('❌ Error updating reaction:', err);
    res.status(500).json({ message: 'Failed to update reaction' });
  }
});

// 📧 Contact Form
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, consent } = req.body;

  if (!name || !email || !phone || consent !== true) {
    return res.status(400).json({ msg: 'Please fill in all required fields and check the consent box.' });
  }

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: `New Portfolio Contact: ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message || 'No message provided.'}</p>
      <p><strong>Consent Given:</strong> ${consent ? 'Yes' : 'No'}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📨 Email sent successfully!');
    res.status(200).json({ msg: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ msg: 'Failed to send message. Please try again later.' });
  }
});


// 🚀 Start server on dynamic port (Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// 🌍 Fallback route to serve frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


