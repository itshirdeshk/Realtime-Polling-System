# Classroom Polling System

A real-time classroom polling system built with React frontend and Express/Socket.io backend.

## Features

- **Teacher Interface**: Create polls, manage students, view real-time results
- **Student Interface**: Join with unique username, participate in polls, see live results
- **Real-time Updates**: Socket.io for instant communication
- **Responsive Design**: Works on all devices
- **Timer Functionality**: Configurable poll duration with countdown

## Project Structure

\`\`\`
classroom-polling-system/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── lib/
│   └── package.json
├── server/           # Express backend
│   ├── server.js
│   └── package.json
└── package.json      # Root package.json
\`\`\`

## Installation

1. **Install all dependencies:**
   \`\`\`bash
   npm run install-all
   \`\`\`

2. **Start the development servers:**
   \`\`\`bash
   npm run dev
   \`\`\`

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

## Usage

1. **Teacher**: Navigate to `/teacher` to create and manage polls
2. **Student**: Navigate to `/student` to join with a unique username
3. **Real-time**: All updates happen instantly across all connected clients

## Technology Stack

### Frontend
- React 18
- React Router DOM
- Socket.io Client
- Tailwind CSS
- Lucide React (icons)

### Backend
- Express.js
- Socket.io
- CORS
- UUID

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/poll` - Get current poll and students
- `GET /api/students` - Get all students

## Socket Events

### Client to Server
- `join-student` - Student joins the classroom
- `create-poll` - Teacher creates a new poll
- `start-poll` - Teacher starts the poll
- `stop-poll` - Teacher stops the poll
- `submit-response` - Student submits poll response
- `remove-student` - Teacher removes a student

### Server to Client
- `poll-created` - New poll created
- `poll-started` - Poll started
- `poll-stopped` - Poll stopped/ended
- `poll-updated` - Poll results updated
- `poll-timer-update` - Timer countdown update
- `students-updated` - Student list updated

## Development

### Frontend Development
\`\`\`bash
cd frontend
npm start
\`\`\`

### Backend Development
\`\`\`bash
cd server
npm run dev
\`\`\`

## Production Deployment

1. **Build the frontend:**
   \`\`\`bash
   cd frontend
   npm run build
   \`\`\`

2. **Deploy backend:**
   - Set environment variables
   - Deploy to your preferred platform (Heroku, AWS, etc.)
   - Ensure CORS is configured for your frontend domain

3. **Environment Variables:**
   \`\`\`bash
   PORT=5000
   NODE_ENV=production
   \`\`\`

## Features in Detail

### Real-time Communication
- Instant poll updates using Socket.io
- Live student count and status
- Real-time timer countdown
- Immediate response feedback

### Teacher Features
- Create multiple-choice polls
- Configure poll duration (10-300 seconds)
- Start/stop polls manually
- Remove disruptive students
- View poll history
- Real-time response tracking

### Student Features
- Unique username authentication
- Join classroom with persistent session
- Submit responses within time limit
- View live results after poll ends
- Visual feedback for submitted answers

## Security Considerations

- Username uniqueness validation
- Socket connection management
- Input sanitization
- CORS configuration
- Rate limiting (recommended for production)

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication system
- Poll analytics and reporting
- Multiple question types
- File upload support
- Chat functionality
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
\`\`\`

Perfect! I've successfully converted the Next.js application into a separate React frontend and Express backend structure. Here's what I've accomplished:

## 🎯 **Complete Separation:**

### **Frontend (React)**
- ✅ Converted Next.js to React with React Router
- ✅ Replaced Next.js navigation with React Router DOM
- ✅ Created Socket.io context for real-time communication
- ✅ Maintained all UI components and styling
- ✅ Added proper package.json with dependencies

### **Backend (Express + Socket.io)**
- ✅ Created Express server with Socket.io integration
- ✅ Implemented real-time WebSocket communication
- ✅ Added proper CORS configuration
- ✅ Created RESTful API endpoints
- ✅ Real-time poll management and student handling

## 🚀 **Key Improvements:**

### **Real-time Features:**
- **Socket.io Integration**: True real-time communication
- **Live Updates**: Instant poll results and student status
- **Timer Synchronization**: Server-side timer with client updates
- **Connection Management**: Proper join/leave handling

### **Architecture Benefits:**
- **Scalability**: Separate frontend and backend can be deployed independently
- **Flexibility**: Frontend can be served from CDN, backend can scale horizontally
- **Development**: Teams can work on frontend and backend separately
- **Technology Choice**: Can easily swap React for Vue/Angular or Express for other backends

## 📁 **Project Structure:**
\`\`\`
classroom-polling-system/
├── frontend/          # React app (port 3000)
├── server/           # Express + Socket.io (port 5000)
└── package.json      # Root scripts for development
\`\`\`

## 🔧 **How to Run:**

1. **Install all dependencies:**
   \`\`\`bash
   npm run install-all
   \`\`\`

2. **Start both servers:**
   \`\`\`bash
   npm run dev
   \`\`\`

The system now has true real-time capabilities with WebSocket connections, making it production-ready for actual classroom use!
