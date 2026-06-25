const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8082;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'samsky2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files with caching disabled to prevent stale client state
app.use(express.static(__dirname, {
  etag: false,
  maxAge: 0,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// POST /api/contact - Receive form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, organisation, email, interest, message } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required fields.' });
    }

    // Load existing submissions
    let submissions = [];
    try {
      const fileData = await fs.readFile(SUBMISSIONS_FILE, 'utf8');
      submissions = JSON.parse(fileData);
    } catch (err) {
      // If file doesn't exist, start empty
      submissions = [];
    }

    // Create new submission entry
    const newEntry = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      name,
      organisation: organisation || '',
      email,
      interest: interest || 'General Inquiry',
      message: message || '',
      timestamp: new Date().toISOString()
    };

    submissions.push(newEntry);

    // Save back to file
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');

    console.log(`[API] New inquiry submitted from ${name} (${email})`);
    return res.status(201).json({ success: true, message: 'Submission received successfully.' });
  } catch (error) {
    console.error('[API] Error handling contact form submission:', error);
    return res.status(500).json({ error: 'Server error processing submission. Please try again.' });
  }
});

// GET /api/submissions - Retrieve all submissions (Admin access)
app.get('/api/submissions', async (req, res) => {
  try {
    // Password checking middleware check
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. Authorization header missing.' });
    }

    // Bearer token style or simple password match
    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Access denied. Invalid credentials.' });
    }

    // Load submissions
    let fileData = '[]';
    try {
      fileData = await fs.readFile(SUBMISSIONS_FILE, 'utf8');
    } catch (err) {
      // Create empty if missing
      await fs.writeFile(SUBMISSIONS_FILE, '[]', 'utf8');
    }
    
    const submissions = JSON.parse(fileData);
    
    // Sort submissions newest first
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json({ success: true, submissions });
  } catch (error) {
    console.error('[API] Error retrieving submissions:', error);
    return res.status(500).json({ error: 'Server error retrieving submissions.' });
  }
});

// POST /api/bookings - Save new consultation booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, organisation, date, timeSlot, topic, message } = req.body;

    // Validation
    if (!name || !email || !date || !timeSlot) {
      return res.status(400).json({ error: 'Name, email, date, and time slot are required.' });
    }

    // Load existing bookings
    let bookings = [];
    try {
      const fileData = await fs.readFile(BOOKINGS_FILE, 'utf8');
      bookings = JSON.parse(fileData);
    } catch (err) {
      bookings = [];
    }

    // Create new booking entry
    const newEntry = {
      id: 'book_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      organisation: organisation || '',
      date,
      timeSlot,
      topic: topic || 'General Consultation',
      message: message || '',
      timestamp: new Date().toISOString()
    };

    bookings.push(newEntry);

    // Save back to file
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');

    console.log(`[API] New booking registered for ${name} on ${date} at ${timeSlot}`);
    return res.status(201).json({ success: true, booking: newEntry });
  } catch (error) {
    console.error('[API] Error handling booking submission:', error);
    return res.status(500).json({ error: 'Server error processing booking. Please try again.' });
  }
});

// GET /api/bookings - Retrieve all bookings (Admin access)
app.get('/api/bookings', async (req, res) => {
  try {
    // Password checking
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. Authorization header missing.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Access denied. Invalid credentials.' });
    }

    // Load bookings
    let fileData = '[]';
    try {
      fileData = await fs.readFile(BOOKINGS_FILE, 'utf8');
    } catch (err) {
      await fs.writeFile(BOOKINGS_FILE, '[]', 'utf8');
    }
    
    const bookings = JSON.parse(fileData);
    
    // Sort bookings: newest booking registration date first
    bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json({ success: true, bookings });
  } catch (error) {
    console.error('[API] Error retrieving bookings:', error);
    return res.status(500).json({ error: 'Server error retrieving bookings.' });
  }
});

// Serve admin dashboard (optional redirect fallback)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` SAMSKY DRONE SYSTEMS BACKEND INITIALIZED`);
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Admin Dashboard:   http://localhost:${PORT}/admin`);
  console.log(`==================================================`);
});
