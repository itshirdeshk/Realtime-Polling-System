"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../contexts/SocketContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Textarea } from "../components/ui/textarea"
import { Users, Plus, Play, Square, BarChart3, Trash2, ArrowLeft, Timer, CheckCircle, User } from "lucide-react"
import ChatBox from "../components/ChatBox"
import PollHistoryModal from "../components/PollHistoryModal"

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const [currentPoll, setCurrentPoll] = useState(null)
  const [students, setStudents] = useState([])
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", "", "", ""],
    duration: 60,
    correctAnswers: [], // Array of correct option indices
  })
  const [pollHistory, setPollHistory] = useState([])
  const [selectedHistoryPoll, setSelectedHistoryPoll] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teacherName, setTeacherName] = useState("")
  const [teacherUser, setTeacherUser] = useState(null)

  // Load teacher name from localStorage on mount
  useEffect(() => {
    const savedTeacherName = localStorage.getItem("teacher-name")
    if (savedTeacherName) {
      setTeacherName(savedTeacherName)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (!socket) return;

    const handleStudentsUpdated = (studentList) => {
      setStudents(studentList);
    };
    socket.on("students-updated", handleStudentsUpdated);
    socket.emit("get-students");
    return () => {
      socket.off("students-updated", handleStudentsUpdated);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handlePollHistoryUpdated = (history) => setPollHistory(history);
    const handlePollCreated = (poll) => setCurrentPoll(poll);
    const handlePollStarted = (poll) => setCurrentPoll(poll);
    const handlePollStopped = (poll) => setCurrentPoll(poll);
    const handlePollUpdated = (poll) => setCurrentPoll(poll);
    const handlePollTimerUpdate = (data) => setCurrentPoll((prev) => (prev ? { ...prev, timeRemaining: data.timeRemaining } : null));
    socket.on("poll-history-updated", handlePollHistoryUpdated);
    socket.on("poll-created", handlePollCreated);
    socket.on("poll-started", handlePollStarted);
    socket.on("poll-stopped", handlePollStopped);
    socket.on("poll-updated", handlePollUpdated);
    socket.on("poll-timer-update", handlePollTimerUpdate);
    return () => {
      socket.off("poll-history-updated", handlePollHistoryUpdated);
      socket.off("poll-created", handlePollCreated);
      socket.off("poll-started", handlePollStarted);
      socket.off("poll-stopped", handlePollStopped);
      socket.off("poll-updated", handlePollUpdated);
      socket.off("poll-timer-update", handlePollTimerUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (socket && isAuthenticated) {
      socket.emit("join-teacher", { teacherName });
    }
  }, [socket, isAuthenticated, teacherName]);

  const handleTeacherLogin = () => {
    if (!teacherName.trim()) {
      alert("Please enter your name")
      return
    }

    localStorage.setItem("teacher-name", teacherName)
    setIsAuthenticated(true)
  }

  const handleTeacherLogout = () => {
    localStorage.removeItem("teacher-name")
    setIsAuthenticated(false)
    setTeacherName("")
    setTeacherUser(null)
    setCurrentPoll(null)
    setStudents([])
    setPollHistory([])
  }

  const createPoll = () => {
    if (!newPoll.question.trim() || newPoll.options.filter((opt) => opt.trim()).length < 2) {
      alert("Please provide a question and at least 2 options");
      return;
    }
    if (newPoll.correctAnswers.length === 0) {
      alert("Please select at least one correct answer");
      return;
    }
    const pollData = {
      question: newPoll.question,
      options: newPoll.options.filter((opt) => opt.trim()),
      duration: newPoll.duration,
      correctAnswers: newPoll.correctAnswers,
    };
    socket.emit("create-poll", pollData);
    setNewPoll({
      question: "",
      options: ["", "", "", ""],
      duration: 60,
      correctAnswers: [],
    });
  };

  const startPoll = () => {
    socket.emit("start-poll")
  }

  const stopPoll = () => {
    socket.emit("stop-poll")
  }

  const removeStudent = (studentId) => {
    socket.emit("remove-student", { studentId })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getResponsePercentage = (optionIndex) => {
    if (!currentPoll || currentPoll.totalResponses === 0) return 0
    return ((currentPoll.responses[optionIndex] || 0) / currentPoll.totalResponses) * 100
  }

  const toggleCorrectAnswer = (optionIndex) => {
    setNewPoll((prev) => ({
      ...prev,
      correctAnswers: prev.correctAnswers.includes(optionIndex)
        ? prev.correctAnswers.filter((i) => i !== optionIndex)
        : [...prev.correctAnswers, optionIndex],
    }))
  }

  const isCorrectOption = (optionIndex) => {
    return currentPoll?.correctAnswers && currentPoll.correctAnswers.includes(optionIndex)
  }

  const getCorrectResponsesCount = () => {
    if (!currentPoll?.correctAnswers || !currentPoll.responses) return 0
    return currentPoll.correctAnswers.reduce((count, correctIndex) => {
      return count + (currentPoll.responses[correctIndex] || 0)
    }, 0)
  }

  const getAccuracyPercentage = () => {
    if (!currentPoll?.totalResponses || !currentPoll.correctAnswers) return 0
    return (getCorrectResponsesCount() / currentPoll.totalResponses) * 100
  }

  const refreshStudentList = () => {
    socket.emit("get-students")
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Teacher Login</CardTitle>
              <CardDescription>Enter your name to access the teacher dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teacherName">Your Name</Label>
                <Input
                  id="teacherName"
                  placeholder="Enter your name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTeacherLogin()}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleTeacherLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                Enter Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {students.length} Students Online
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshStudentList}>
                Refresh Students
              </Button>
              <Badge variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {teacherName}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleTeacherLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Poll Section */}
          <div className="lg:col-span-2 space-y-6">
            {!currentPoll && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Poll
                  </CardTitle>
                  <CardDescription>Create a multiple-choice poll for your students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question">Poll Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Enter your poll question..."
                      value={newPoll.question}
                      onChange={(e) => setNewPoll((prev) => ({ ...prev, question: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2 mt-1">
                      {newPoll.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newPoll.options]
                              newOptions[index] = e.target.value
                              setNewPoll((prev) => ({ ...prev, options: newOptions }))
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant={newPoll.correctAnswers.includes(index) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleCorrectAnswer(index)}
                            disabled={!option.trim()}
                            className={newPoll.correctAnswers.includes(index) ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click the check icon to mark correct answers</p>
                  </div>

                  <div>
                    <Label htmlFor="duration">Poll Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="10"
                      max="300"
                      value={newPoll.duration}
                      onChange={(e) =>
                        setNewPoll((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 60 }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={createPoll} className="w-full">
                    Create Poll
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Active Poll */}
            {currentPoll && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {currentPoll.isActive ? (
                        <>
                          <Play className="w-5 h-5 text-green-500" />
                          Active Poll
                        </>
                      ) : (
                        <>
                          <Square className="w-5 h-5 text-gray-500" />
                          Poll Ready
                        </>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {currentPoll.isActive && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {formatTime(currentPoll.timeRemaining)}
                        </Badge>
                      )}
                      {!currentPoll.isActive && currentPoll.timeRemaining === currentPoll.duration && (
                        <Button onClick={startPoll} size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Start Poll
                        </Button>
                      )}
                      {currentPoll.isActive && (
                        <Button onClick={stopPoll} variant="destructive" size="sm">
                          <Square className="w-4 h-4 mr-2" />
                          Stop Poll
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{currentPoll.question}</h3>
                    <div className="space-y-3">
                      {currentPoll.options.map((option, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{option}</span>
                              {isCorrectOption(index) && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Correct
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {currentPoll.responses[index] || 0} votes ({getResponsePercentage(index).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress
                            value={getResponsePercentage(index)}
                            className={`h-2 ${isCorrectOption(index) ? "bg-green-50" : ""}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Total Responses: {currentPoll.totalResponses}</span>
                      {currentPoll.correctAnswers &&
                        currentPoll.correctAnswers.length > 0 &&
                        currentPoll.totalResponses > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {getAccuracyPercentage().toFixed(1)}% Accuracy
                          </Badge>
                        )}
                    </div>
                    {!currentPoll.isActive && currentPoll.timeRemaining === 0 && (
                      <Button onClick={() => setCurrentPoll(null)} variant="outline" size="sm">
                        Create New Poll
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Students Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No students connected yet</p>
                    <p className="text-sm text-gray-400">Students will appear here when they join</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${student.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <span className="text-sm font-medium">{student.username}</span>
                          {student.hasResponded && currentPoll?.isActive && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {student.answeredCorrectly === true && !currentPoll?.isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              ✓ Correct
                            </Badge>
                          )}
                          {student.answeredCorrectly === false && !currentPoll?.isActive && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                              ✗ Incorrect
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => removeStudent(student.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Poll History */}
            {pollHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Polls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pollHistory.slice(0, 5).map((poll) => (
                      <div
                        key={poll.id}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setSelectedHistoryPoll(poll)}
                      >
                        <p className="text-sm font-medium truncate">{poll.question}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{poll.totalResponses} responses</p>
                          {poll.correctAnswers && poll.correctAnswers.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {poll.correctAnswers.length} correct
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(poll.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Poll History Modal */}
            {selectedHistoryPoll && (
              <PollHistoryModal poll={selectedHistoryPoll} onClose={() => setSelectedHistoryPoll(null)} />
            )}
          </div>
        </div>
      </div>
      {isAuthenticated && <ChatBox userType="teacher" currentUser={teacherUser} />}
    </div>
  )
}
