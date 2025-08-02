const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path'); // Added missing import for path

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database setup
const db = new sqlite3.Database('./faculty_availability.db');

// Binary status encoding
const STATUS_CODES = {
  AVAILABLE: 0b001,      // 1 - Available for meetings
  BUSY: 0b010,           // 2 - Busy, do not disturb
  IN_MEETING: 0b011,     // 3 - Currently in a meeting
  OFFICE_HOURS: 0b100,   // 4 - Official office hours
  AWAY: 0b101,           // 5 - Away from office
  ONLINE_ONLY: 0b110,    // 6 - Available online only
  UNAVAILABLE: 0b000     // 0 - Completely unavailable
};

const STATUS_MESSAGES = {
  [STATUS_CODES.AVAILABLE]: 'Available for meetings',
  [STATUS_CODES.BUSY]: 'Busy - Do not disturb',
  [STATUS_CODES.IN_MEETING]: 'Currently in a meeting',
  [STATUS_CODES.OFFICE_HOURS]: 'Office hours - Students welcome',
  [STATUS_CODES.AWAY]: 'Away from office',
  [STATUS_CODES.ONLINE_ONLY]: 'Available online only',
  [STATUS_CODES.UNAVAILABLE]: 'Unavailable'
};

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    office_location TEXT,
    password_hash TEXT NOT NULL,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS status_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    custom_message TEXT,
    estimated_duration INTEGER, -- in minutes
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    custom_message TEXT,
    duration INTEGER, -- actual duration in minutes
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    FOREIGN KEY (faculty_id) REFERENCES faculty (id)
  )`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes

// Get all faculty with current status
app.get('/api/faculty', (req, res) => {
  const query = `
    SELECT 
      f.id, f.name, f.email, f.department, f.office_location,
      COALESCE(s.status_code, 0) as status_code,
      COALESCE(s.custom_message, '') as custom_message,
      COALESCE(s.estimated_duration, 0) as estimated_duration,
      COALESCE(s.updated_at, f.created_at) as last_updated
    FROM faculty f
    LEFT JOIN (
      SELECT faculty_id, status_code, custom_message, estimated_duration, updated_at,
             ROW_NUMBER() OVER (PARTITION BY faculty_id ORDER BY updated_at DESC) as rn
      FROM status_updates
    ) s ON f.id = s.faculty_id AND s.rn = 1
    ORDER BY f.department, f.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const facultyWithStatus = rows.map(row => ({
      ...row,
      status_message: STATUS_MESSAGES[row.status_code] || 'Unknown status',
      qr_url: `/api/qr/${row.id}`
    }));
    
    res.json(facultyWithStatus);
  });
});

// Get specific faculty member
app.get('/api/faculty/:id', (req, res) => {
  const facultyId = req.params.id;
  
  const query = `
    SELECT 
      f.id, f.name, f.email, f.department, f.office_location,
      COALESCE(s.status_code, 0) as status_code,
      COALESCE(s.custom_message, '') as custom_message,
      COALESCE(s.estimated_duration, 0) as estimated_duration,
      COALESCE(s.updated_at, f.created_at) as last_updated
    FROM faculty f
    LEFT JOIN (
      SELECT faculty_id, status_code, custom_message, estimated_duration, updated_at,
             ROW_NUMBER() OVER (PARTITION BY faculty_id ORDER BY updated_at DESC) as rn
      FROM status_updates
    ) s ON f.id = s.faculty_id AND s.rn = 1
    WHERE f.id = ?
  `;
  
  db.get(query, [facultyId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Faculty member not found' });
      return;
    }
    
    const facultyWithStatus = {
      ...row,
      status_message: STATUS_MESSAGES[row.status_code] || 'Unknown status'
    };
    
    res.json(facultyWithStatus);
  });
});

// Generate QR code for faculty member
app.get('/api/qr/:id', async (req, res) => {
  const facultyId = req.params.id;
  const baseUrl = req.protocol + '://' + req.get('host');
  const facultyUrl = `${baseUrl}/faculty/${facultyId}`;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(facultyUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({ qr_code: qrCodeDataURL, url: facultyUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Faculty registration
app.post('/api/faculty/register', async (req, res) => {
  const { name, email, department, office_location, password } = req.body;
  
  if (!name || !email || !department || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO faculty (name, email, department, office_location, password_hash) VALUES (?, ?, ?, ?, ?)',
      [name, email, department, office_location, passwordHash],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.status(201).json({ 
          message: 'Faculty registered successfully', 
          faculty_id: this.lastID,
          token 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Faculty login
app.post('/api/faculty/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  db.get('SELECT * FROM faculty WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      const validPassword = await bcrypt.compare(password, row.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET);
      res.json({ 
        message: 'Login successful', 
        token,
        faculty: {
          id: row.id,
          name: row.name,
          email: row.email,
          department: row.department,
          office_location: row.office_location
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// Update faculty status
app.post('/api/faculty/:id/status', authenticateToken, (req, res) => {
  const facultyId = req.params.id;
  const { status_code, custom_message, estimated_duration } = req.body;
  
  // Verify faculty can only update their own status
  if (req.user.id !== parseInt(facultyId)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  if (status_code === undefined || !Object.values(STATUS_CODES).includes(status_code)) {
    return res.status(400).json({ error: 'Invalid status code' });
  }
  
  db.run(
    'INSERT INTO status_updates (faculty_id, status_code, custom_message, estimated_duration) VALUES (?, ?, ?, ?)',
    [facultyId, status_code, custom_message || '', estimated_duration || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Emit real-time update
      io.emit('status_update', {
        faculty_id: parseInt(facultyId),
        status_code,
        custom_message: custom_message || '',
        estimated_duration: estimated_duration || 0,
        status_message: STATUS_MESSAGES[status_code],
        updated_at: new Date().toISOString()
      });
      
      res.json({ 
        message: 'Status updated successfully',
        status_message: STATUS_MESSAGES[status_code]
      });
    }
  );
});

// Get status codes
app.get('/api/status-codes', (req, res) => {
  const codes = Object.entries(STATUS_CODES).map(([key, value]) => ({
    key,
    code: value,
    message: STATUS_MESSAGES[value]
  }));
  res.json(codes);
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Join faculty-specific room for targeted updates
  socket.on('join_faculty', (facultyId) => {
    socket.join(`faculty_${facultyId}`);
  });
});

// Serve static files from client build
app.use(express.static('client/build'));

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Faculty Availability Server running on port ${PORT}`);
  console.log(`Binary status encoding system active`);
  console.log(`Available status codes:`, Object.entries(STATUS_CODES));
});