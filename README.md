# Classroom Polling System

A real-time classroom polling system with a React frontend and Express/Socket.io backend.

---

## 🚀 Features

- **Teacher Interface:** Create polls, manage students, view real-time results
- **Student Interface:** Join with a unique username, participate in polls, see live results
- **Real-time Updates:** Instant communication via Socket.io
- **Responsive Design:** Works on all devices
- **Timer Functionality:** Configurable poll duration with countdown
- **Chat:** Public and private messaging (see roadmap for more)

---

## 🗂️ Project Structure

```
classroom-polling-system/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── lib/
│   └── package.json
├── server/            # Express backend
│   ├── server.js
│   └── package.json
└── package.json       # Root package.json
```

---

## ⚡ Getting Started

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Start Development Servers

```bash
npm run dev
```

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🧑‍🏫 Usage

- **Teacher:** Go to `/teacher` to create and manage polls
- **Student:** Go to `/student` to join with a unique username
- **Real-time:** All updates are instant across all connected clients

---

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router DOM
- Socket.io Client
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Express.js
- Socket.io
- CORS
- UUID

---

## 📡 API Endpoints

- `GET /api/health` — Server health check
- `GET /api/poll` — Get current poll and students
- `GET /api/students` — Get all students

---

## 🔌 Socket Events

**Client → Server**
- `join-student` — Student joins the classroom
- `create-poll` — Teacher creates a new poll
- `start-poll` — Teacher starts the poll
- `stop-poll` — Teacher stops the poll
- `submit-response` — Student submits poll response
- `remove-student` — Teacher removes a student

**Server → Client**
- `poll-created` — New poll created
- `poll-started` — Poll started
- `poll-stopped` — Poll stopped/ended
- `poll-updated` — Poll results updated
- `poll-timer-update` — Timer countdown update
- `students-updated` — Student list updated

---

## 🏗️ Development

**Frontend:**
```bash
cd frontend
npm start
```

**Backend:**
```bash
cd server
npm run dev
```

---

## 🚀 Production Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy backend:**
   - Set environment variables
   - Deploy to your preferred platform (Heroku, AWS, etc.)
   - Ensure CORS is configured for your frontend domain

**Environment Variables:**
```bash
PORT=5000
NODE_ENV=production
```

---

## 🔍 Features in Detail

- **Real-time Communication:** Instant poll updates, live student count, real-time timer, immediate feedback
- **Teacher Features:** Create polls, configure duration, start/stop polls, remove students, view poll history, track responses
- **Student Features:** Unique username, join classroom, submit responses, view live results, feedback for answers

---

## 🔒 Security Considerations

- Username uniqueness validation
- Socket connection management
- Input sanitization
- CORS configuration
- (Recommended) Rate limiting for production

---

## 🛣️ Roadmap / Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication system
- Poll analytics and reporting
- Multiple question types
- File upload support
- Enhanced chat functionality
- Mobile app development

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details

---

**Tip:**  
For local development, ensure your frontend and backend are running on the correct ports and that the frontend connects to the backend's socket.io server (see documentation in `frontend/src/contexts/SocketContext.js`).
