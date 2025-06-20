const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage (replace with database in production)
const students = new Map()
const teachers = new Map()
let currentPoll = null
let pollHistory = []
const pollResponses = new Map()

// Chat storage
const chatMessages = []
const privateMessages = new Map() // Map of conversation IDs to messages
const notifications = new Map() // Map of user IDs to notifications

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Student joins
  socket.on("join-student", (data) => {
    const { username } = data

    // Check if username is already taken
    const existingStudent = Array.from(students.values()).find((s) => s.username === username)
    if (existingStudent) {
      socket.emit("join-error", { message: "Username already taken" })
      return
    }

    const student = {
      id: socket.id,
      username,
      isOnline: true,
      hasResponded: false,
      joinedAt: new Date().toISOString(),
    }

    students.set(socket.id, student)

    // Send current poll to the new student
    socket.emit("current-poll", currentPoll)

    // Broadcast updated student list to all clients (only students)
    console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
    io.emit("students-updated", Array.from(students.values()))

    socket.emit("join-success", { student })
  })

  // Teacher joins
  socket.on("join-teacher", (data) => {
    const { teacherName } = data

    const teacher = {
      id: socket.id,
      username: teacherName || "Teacher",
      isOnline: true,
      isTeacher: true,
      joinedAt: new Date().toISOString(),
    }

    teachers.set(socket.id, teacher)

    socket.emit("join-success", { user: teacher })
    // Send current students to the new teacher
    socket.emit("students-updated", Array.from(students.values()))
    // Also broadcast to all clients
    console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
    io.emit("students-updated", Array.from(students.values()))
  })

  // Teacher creates poll
  socket.on("create-poll", (data) => {
    currentPoll = {
      id: uuidv4(),
      ...data,
      isActive: false,
      responses: {},
      totalResponses: 0,
      timeRemaining: data.duration,
      createdAt: new Date().toISOString(),
    }

    // Reset all student response status
    students.forEach((student) => {
      student.hasResponded = false
      student.selectedOption = null
      student.answeredCorrectly = null
    })

    io.emit("poll-created", currentPoll)
    console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
    io.emit("students-updated", Array.from(students.values()))
  })

  // Teacher starts poll
  socket.on("start-poll", () => {
    if (currentPoll) {
      currentPoll.isActive = true
      currentPoll.timeRemaining = currentPoll.duration
      currentPoll.startedAt = new Date().toISOString()

      // Reset all student response status
      students.forEach((student) => {
        student.hasResponded = false
        student.selectedOption = null
        student.answeredCorrectly = null
      })

      io.emit("poll-started", currentPoll)
      console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
      io.emit("students-updated", Array.from(students.values()))
      startPollTimer();
    }
  })

  // Teacher stops poll
  socket.on("stop-poll", () => {
    if (currentPoll) {
      currentPoll.isActive = false
      currentPoll.timeRemaining = 0
      currentPoll.endedAt = new Date().toISOString()

      // Add to history
      pollHistory.unshift({ ...currentPoll })
      if (pollHistory.length > 10) {
        pollHistory = pollHistory.slice(0, 10)
      }

      io.emit("poll-stopped", currentPoll)
      io.emit("poll-history-updated", pollHistory)
    }
  })

  // Student submits response
  socket.on("submit-response", (data) => {
    const { optionIndex } = data
    const student = students.get(socket.id)

    if (!currentPoll || !currentPoll.isActive || !student || student.hasResponded) {
      socket.emit("response-error", { message: "Cannot submit response" })
      return
    }

    // Record response
    pollResponses.set(socket.id, optionIndex)
    student.hasResponded = true
    student.selectedOption = optionIndex // Track selected option

    // Check if this is a correct answer
    const isCorrect = currentPoll.correctAnswers && currentPoll.correctAnswers.includes(optionIndex)
    student.answeredCorrectly = isCorrect

    // Update poll responses
    if (!currentPoll.responses[optionIndex]) {
      currentPoll.responses[optionIndex] = 0
    }
    currentPoll.responses[optionIndex]++
    currentPoll.totalResponses++

    // Broadcast updated poll and students
    io.emit("poll-updated", currentPoll)
    console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
    io.emit("students-updated", Array.from(students.values()))

    socket.emit("response-success", { poll: currentPoll, isCorrect })
  })

  // Update the remove student functionality
  socket.on("remove-student", (data) => {
    const { studentId } = data
    const student = students.get(studentId)

    if (student) {
      // Send kick message to the student before removing
      const studentSocket = io.sockets.sockets.get(studentId)
      if (studentSocket) {
        studentSocket.emit("kicked-out", {
          message: "You have been removed from the classroom by the teacher.",
        })
        // Don't disconnect the socket, just mark as kicked
      }

      // Remove from students list
      students.delete(studentId)
      pollResponses.delete(studentId)

      // Update all clients with new student list
      console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
      io.emit("students-updated", Array.from(students.values()))
    }
  })

  // Chat functionality
  socket.on("send-message", (data) => {
    const { message, type = "public", recipientId } = data
    const sender = students.get(socket.id) || teachers.get(socket.id)

    if (!sender || !message.trim()) return

    const chatMessage = {
      id: uuidv4(),
      senderId: socket.id,
      senderName: sender.username,
      message: message.trim(),
      type, // 'public', 'private', 'question'
      recipientId,
      timestamp: new Date().toISOString(),
    }

    if (type === "private" && recipientId) {
      // Private message between students
      const conversationId = [socket.id, recipientId].sort().join("-")
      if (!privateMessages.has(conversationId)) {
        privateMessages.set(conversationId, [])
      }
      privateMessages.get(conversationId).push(chatMessage)

      // Send to both participants
      socket.emit("private-message", chatMessage)
      const recipientSocket = io.sockets.sockets.get(recipientId)
      if (recipientSocket) {
        recipientSocket.emit("private-message", chatMessage)
      }
    } else {
      // Public message or question to teacher
      chatMessages.push(chatMessage)
      if (chatMessages.length > 100) {
        chatMessages.shift() // Keep only last 100 messages
      }

      io.emit("new-message", chatMessage)
    }
  })

  // Get chat history
  socket.on("get-chat-history", () => {
    socket.emit("chat-history", chatMessages)
  })

  // Get private conversation
  socket.on("get-private-conversation", (data) => {
    const { participantId } = data
    const conversationId = [socket.id, participantId].sort().join("-")
    const messages = privateMessages.get(conversationId) || []
    socket.emit("private-conversation", { participantId, messages })
  })

  // Add this new socket event after the existing ones
  socket.on("get-students", () => {
    socket.emit("students-updated", Array.from(students.values()))
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    const wasStudent = students.has(socket.id)
    const wasTeacher = teachers.has(socket.id)

    students.delete(socket.id)
    teachers.delete(socket.id)
    pollResponses.delete(socket.id)

    if (wasStudent || wasTeacher) {
      console.log("Broadcasting student list after disconnect")
      console.log("[SERVER] Emitting students-updated:", Array.from(students.values()));
      io.emit("students-updated", Array.from(students.values()))
    }
  })
})

// Poll timer function
function startPollTimer() {
  const timer = setInterval(() => {
    if (!currentPoll || !currentPoll.isActive) {
      clearInterval(timer)
      return
    }

    currentPoll.timeRemaining--

    // Send notification when 10 seconds remaining
    if (currentPoll.timeRemaining === 10) {
      const notificationMessage = {
        id: uuidv4(),
        senderId: "system",
        senderName: "System",
        message: `⏰ Only 10 seconds remaining for poll "${currentPoll.question}"! Submit your response quickly!`,
        type: "notification",
        timestamp: new Date().toISOString(),
      }
      chatMessages.push(notificationMessage)
      io.emit("new-message", notificationMessage)
    }

    if (currentPoll.timeRemaining <= 0) {
      currentPoll.isActive = false
      currentPoll.timeRemaining = 0
      currentPoll.endedAt = new Date().toISOString()

      // Add to history
      pollHistory.unshift({ ...currentPoll })
      if (pollHistory.length > 10) {
        pollHistory = pollHistory.slice(0, 10)
      }

      io.emit("poll-stopped", currentPoll)
      io.emit("poll-history-updated", pollHistory)
      clearInterval(timer)
    } else {
      io.emit("poll-timer-update", { timeRemaining: currentPoll.timeRemaining })
    }
  }, 1000)
}

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

app.get("/api/poll", (req, res) => {
  res.json({
    currentPoll,
    students: Array.from(students.values()),
    pollHistory: pollHistory.slice(0, 5),
  })
})

app.get("/api/students", (req, res) => {
  res.json({ students: Array.from(students.values()) })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
