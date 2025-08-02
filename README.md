# Faculty Availability Indicator

A QR-enabled real-time faculty availability indicator that leverages binary status encoding to inform students of a teacher's readiness for in-person interaction, thereby preempting unproductive visits and minimizing on-campus inefficiencies.

## 🚀 Features

### Core Functionality
- **Real-time Status Updates**: WebSocket-powered live status changes
- **Binary Status Encoding**: Efficient 3-bit status representation (000-110)
- **QR Code Generation**: Unique QR codes for each faculty member
- **Mobile-Responsive Design**: Optimized for all devices
- **Secure Authentication**: JWT-based faculty login system

### Status System
The system uses a 3-bit binary encoding for efficient status representation:

| Status | Binary | Description |
|--------|--------|-------------|
| Unavailable | 000 | Completely unavailable |
| Available | 001 | Available for meetings |
| Busy | 010 | Busy - Do not disturb |
| In Meeting | 011 | Currently in a meeting |
| Office Hours | 100 | Official office hours |
| Away | 101 | Away from office |
| Online Only | 110 | Available online only |

### User Interfaces
- **Public Faculty List**: Browse all faculty with real-time status
- **Individual Faculty Pages**: Detailed status with QR codes
- **Faculty Dashboard**: Status management interface
- **Authentication System**: Secure login/registration

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **Socket.IO** for real-time updates
- **JWT** authentication
- **QR Code** generation
- **bcrypt** password hashing

### Frontend
- **React** with modern hooks
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time updates
- **Axios** for API calls
- **React QR Code** for QR display

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd faculty-availability-indicator
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   # Copy and modify .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev:full
   
   # Or start them separately:
   # Backend only
   npm run dev
   
   # Frontend only (in another terminal)
   cd client && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗 Project Structure

```
faculty-availability-indicator/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── faculty_availability.db   # SQLite database (auto-created)
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions and contexts
│   │   └── App.js           # Main app component
│   ├── public/              # Static files
│   └── package.json         # Frontend dependencies
└── README.md                # This file
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/faculty` - Get all faculty with current status
- `GET /api/faculty/:id` - Get specific faculty member
- `GET /api/qr/:id` - Generate QR code for faculty member
- `GET /api/status-codes` - Get available status codes

### Authentication Endpoints
- `POST /api/faculty/register` - Register new faculty member
- `POST /api/faculty/login` - Faculty login

### Protected Endpoints
- `POST /api/faculty/:id/status` - Update faculty status (requires auth)

## 💡 Usage Guide

### For Students
1. **Browse Faculty**: Visit the main page to see all faculty members
2. **Check Status**: View real-time availability status with color coding
3. **Scan QR Codes**: Use mobile device to scan QR codes for quick access
4. **Filter & Search**: Use filters to find specific faculty or departments

### For Faculty
1. **Register**: Create an account with your university credentials
2. **Login**: Access your personal dashboard
3. **Update Status**: Use quick buttons or custom form to set availability
4. **Share QR Code**: Display your QR code for students to scan
5. **Real-time Updates**: Status changes are immediately visible to students

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests

## 🚀 Deployment

### Production Build
```bash
# Build the frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
PORT=5000
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@university.edu or create an issue in the repository.

## 🎯 Future Enhancements

- [ ] Email notifications for status changes
- [ ] Calendar integration for automatic status updates
- [ ] Mobile app for iOS and Android
- [ ] Analytics dashboard for administrators
- [ ] Integration with university directory systems
- [ ] Bulk status updates for holidays/breaks
- [ ] Student feedback system

---

**Faculty Availability Indicator** - Making campus interactions more efficient through technology.
