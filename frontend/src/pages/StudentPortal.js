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
import { User, Clock, CheckCircle, Users, ArrowLeft, Timer, BarChart3, AlertCircle, Star } from "lucide-react"
import ChatBox from "../components/ChatBox"

export default function StudentPortal() {
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const [username, setUsername] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPoll, setCurrentPoll] = useState(null)
  const [students, setStudents] = useState([])
  const [hasResponded, setHasResponded] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [currentStudent, setCurrentStudent] = useState(null)
  const [isKickedOut, setIsKickedOut] = useState(false)
  const [answeredCorrectly, setAnsweredCorrectly] = useState(null)

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("student-username")
    if (savedUsername) {
      setUsername(savedUsername)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (!socket || !isAuthenticated) return

    // Join as student when authenticated
    socket.emit("join-student", { username })

    const handleJoinSuccess = (data) => {
      console.log("Successfully joined as student")
      setCurrentStudent(data.student)
    }

    const handleJoinError = (data) => {
      alert(data.message)
      handleLogout()
    }

    const handleKickedOut = (data) => {
      setIsKickedOut(true)
      alert(data.message)
    }

    const handleCurrentPoll = (poll) => {
      setCurrentPoll(poll)
      setHasResponded(false)
      setSelectedOption(null)
      setAnsweredCorrectly(null)
    }

    const handlePollCreated = (poll) => {
      setCurrentPoll(poll)
      setHasResponded(false)
      setSelectedOption(null)
      setAnsweredCorrectly(null)
    }

    const handlePollStarted = (poll) => {
      setCurrentPoll(poll)
      setHasResponded(false)
      setSelectedOption(null)
      setAnsweredCorrectly(null)
    }

    const handlePollStopped = (poll) => {
      setCurrentPoll(poll)
    }

    const handlePollUpdated = (poll) => {
      setCurrentPoll(poll)
    }

    const handlePollTimerUpdate = (data) => {
      setCurrentPoll((prev) => (prev ? { ...prev, timeRemaining: data.timeRemaining } : null))
    }

    const handleStudentsUpdated = (studentList) => {
      setStudents(studentList)
    }

    const handleResponseSuccess = (data) => {
      setHasResponded(true)
      setCurrentPoll(data.poll)
      setAnsweredCorrectly(data.isCorrect)
    }

    const handleResponseError = (data) => {
      alert(data.message)
    }

    socket.on("join-success", handleJoinSuccess)
    socket.on("join-error", handleJoinError)
    socket.on("kicked-out", handleKickedOut)
    socket.on("current-poll", handleCurrentPoll)
    socket.on("poll-created", handlePollCreated)
    socket.on("poll-started", handlePollStarted)
    socket.on("poll-stopped", handlePollStopped)
    socket.on("poll-updated", handlePollUpdated)
    socket.on("poll-timer-update", handlePollTimerUpdate)
    socket.on("students-updated", handleStudentsUpdated)
    socket.on("response-success", handleResponseSuccess)
    socket.on("response-error", handleResponseError)

    return () => {
      socket.off("join-success", handleJoinSuccess)
      socket.off("join-error", handleJoinError)
      socket.off("kicked-out", handleKickedOut)
      socket.off("current-poll", handleCurrentPoll)
      socket.off("poll-created", handlePollCreated)
      socket.off("poll-started", handlePollStarted)
      socket.off("poll-stopped", handlePollStopped)
      socket.off("poll-updated", handlePollUpdated)
      socket.off("poll-timer-update", handlePollTimerUpdate)
      socket.off("students-updated", handleStudentsUpdated)
      socket.off("response-success", handleResponseSuccess)
      socket.off("response-error", handleResponseError)
    }
  }, [socket, isAuthenticated, username])

  const handleLogin = () => {
    if (!username.trim()) {
      alert("Please enter a username")
      return
    }

    localStorage.setItem("student-username", username)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("student-username")
    setIsAuthenticated(false)
    setUsername("")
    setCurrentPoll(null)
    setHasResponded(false)
    setSelectedOption(null)
    setIsKickedOut(false)
    setAnsweredCorrectly(null)
  }

  const submitAnswer = (optionIndex) => {
    if (!currentPoll || hasResponded || isKickedOut) return

    setSelectedOption(optionIndex)
    socket.emit("submit-response", { optionIndex })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getResponsePercentage = (optionIndex) => {
    if (!currentPoll?.responses || !currentPoll.totalResponses) return 0
    return ((currentPoll.responses[optionIndex] || 0) / currentPoll.totalResponses) * 100
  }

  const isCorrectOption = (optionIndex) => {
    return currentPoll?.correctAnswers && currentPoll.correctAnswers.includes(optionIndex)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Join Classroom</CardTitle>
              <CardDescription>Enter a unique username to participate in polls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700">
                Join Classroom
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

  // Show kicked out message
  if (isKickedOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Removed from Classroom</h3>
              <p className="text-gray-600 mb-6">You have been removed from the classroom by the teacher.</p>
              <div className="space-y-3">
                <Button onClick={handleLogout} className="w-full bg-purple-600 hover:bg-purple-700">
                  Join Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {username}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {!currentPoll && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Waiting for Poll</h3>
                <p className="text-gray-600">Your teacher will start a poll soon. Stay tuned!</p>
              </CardContent>
            </Card>
          )}

          {currentPoll && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {currentPoll.isActive ? (
                      <>
                        <Timer className="w-5 h-5 text-green-500" />
                        Active Poll
                      </>
                    ) : hasResponded || (!currentPoll.isActive && currentPoll.totalResponses > 0) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        Poll Results
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-orange-500" />
                        Waiting for Teacher
                      </>
                    )}
                  </CardTitle>
                  {currentPoll.isActive && (
                    <Badge
                      variant={currentPoll.timeRemaining <= 10 ? "destructive" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      {formatTime(currentPoll.timeRemaining)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  {currentPoll.isActive && <h3 className="text-xl font-semibold mb-4">{currentPoll.question}</h3>}

                  {!currentPoll.isActive && currentPoll.timeRemaining === currentPoll.duration && (
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Waiting for Teacher</h4>
                      <p className="text-gray-600">The teacher will start the poll shortly. Get ready to respond!</p>
                    </div>
                  )}

                  {currentPoll.isActive && !hasResponded && (
                    <div className="space-y-3">
                      {currentPoll.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-4 hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => submitAnswer(index)}
                        >
                          <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {hasResponded && currentPoll.isActive && (
                    <div className="space-y-3">
                      {currentPoll.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            index === selectedOption ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-semibold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                            {index === selectedOption && <CheckCircle className="w-5 h-5 text-purple-500 ml-auto" />}
                          </div>
                        </div>
                      ))}
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">Response submitted!</p>
                        <p className="text-sm text-gray-600">Waiting for results...</p>
                        {answeredCorrectly !== null && (
                          <div className="mt-3">
                            {answeredCorrectly ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <Star className="w-3 h-3 mr-1" />
                                Great! You got it right!
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                Keep trying! Check the results below.
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!currentPoll.isActive && currentPoll.totalResponses > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">Poll Results</h4>
                        {answeredCorrectly !== null && (
                          <Badge
                            variant="secondary"
                            className={answeredCorrectly ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                          >
                            {answeredCorrectly ? "✓ Correct Answer!" : "✗ Incorrect Answer"}
                          </Badge>
                        )}
                      </div>
                      {currentPoll.options.map((option, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-semibold">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="font-medium">{option}</span>
                              {index === selectedOption && <CheckCircle className="w-4 h-4 text-purple-500" />}
                              {isCorrectOption(index) && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Correct
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">
                              {currentPoll.responses[index] || 0} votes ({getResponsePercentage(index).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress
                            value={getResponsePercentage(index)}
                            className={`h-3 ${isCorrectOption(index) ? "bg-green-50" : ""}`}
                          />
                        </div>
                      ))}
                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-gray-600">Total responses: {currentPoll.totalResponses}</p>
                      </div>
                    </div>
                  )}

                  {!currentPoll.isActive && !hasResponded && currentPoll.totalResponses === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">Time's Up!</h4>
                      <p className="text-gray-600">The poll has ended. You didn't submit a response in time.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {isAuthenticated && !isKickedOut && <ChatBox userType="student" currentUser={currentStudent} />}
    </div>
  )
}
