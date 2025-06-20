"use client"

import { useState, useEffect, useRef } from "react"
import { useSocket } from "../contexts/SocketContext"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { MessageCircle, Send, X, Users, User, Bell, Crown } from "lucide-react"

export default function ChatBox({ userType = "student", currentUser }) {
  const { socket } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat") // 'chat', 'participants', 'private'
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [participants, setParticipants] = useState([])
  const [privateConversations, setPrivateConversations] = useState(new Map())
  const [activePrivateChat, setActivePrivateChat] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message])
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    socket.on("chat-history", (history) => {
      setMessages(history)
    })

    socket.on("students-updated", (studentList) => {
      if (userType === "student") {
        const filteredParticipants = studentList.filter((s) => s.id !== currentUser?.id)
        setParticipants(filteredParticipants)
      } else {
        // For teachers, show all students, highlight teacher
        setParticipants(studentList)
      }
    })

    socket.on("private-message", (message) => {
      const otherUserId = message.senderId === currentUser?.id ? message.recipientId : message.senderId
      setPrivateConversations((prev) => {
        const updated = new Map(prev)
        if (!updated.has(otherUserId)) {
          updated.set(otherUserId, [])
        }
        updated.get(otherUserId).push(message)
        return updated
      })

      if (!isOpen || activePrivateChat !== otherUserId) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    socket.on("private-conversation", (data) => {
      setPrivateConversations((prev) => {
        const updated = new Map(prev)
        updated.set(data.participantId, data.messages)
        return updated
      })
    })

    // Get initial chat history
    socket.emit("get-chat-history")

    return () => {
      socket.off("new-message")
      socket.off("chat-history")
      socket.off("students-updated")
      socket.off("private-message")
      socket.off("private-conversation")
    }
  }, [socket, isOpen, activePrivateChat, currentUser, userType])

  useEffect(() => {
    scrollToBottom()
  }, [messages, privateConversations, activePrivateChat])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

    if (activePrivateChat) {
      socket.emit("send-message", {
        message: newMessage,
        type: "private",
        recipientId: activePrivateChat,
      })
    } else {
      socket.emit("send-message", {
        message: newMessage,
        type: userType === "teacher" ? "public" : "question",
      })
    }

    setNewMessage("")
  }

  const startPrivateChat = (participant) => {
    setActivePrivateChat(participant.id)
    setActiveTab("private")
    socket.emit("get-private-conversation", { participantId: participant.id })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getMessageTypeColor = (type) => {
    switch (type) {
      case "question":
        return "text-blue-600"
      case "notification":
        return "text-green-600"
      case "private":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const getCurrentMessages = () => {
    if (activePrivateChat) {
      return privateConversations.get(activePrivateChat) || []
    }
    return messages
  }

  const getActiveParticipantName = () => {
    if (!activePrivateChat) return ""
    const participant = participants.find((p) => p.id === activePrivateChat)
    return participant?.username || "Unknown"
  }

  const isTeacherMessage = (senderName) => {
    return senderName && (senderName === "Teacher" || senderName.includes("Teacher"))
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg relative"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px]">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {activeTab === "private" ? `Chat with ${getActiveParticipantName()}` : "Classroom Chat"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveTab("chat")
                setActivePrivateChat(null)
              }}
              className="text-xs"
            >
              Chat
            </Button>
            {userType === "student" && (
              <>
                <Button
                  variant={activeTab === "participants" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("participants")}
                  className="text-xs"
                >
                  <Users className="w-3 h-3 mr-1" />
                  People
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 pt-0">
          {activeTab === "participants" ? (
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="text-sm font-medium text-gray-600 mb-2">Participants ({participants.length + 1})</div>

              {/* Current user */}
              <div className={`flex items-center gap-2 p-2 ${userType === "teacher" ? "bg-blue-100 border-l-4 border-blue-500" : "bg-blue-50"} rounded-lg`}>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">You ({currentUser?.username})</span>
                {userType === "teacher" && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Teacher
                  </Badge>
                )}
              </div>

              {/* Other participants - only students for student users, all for teacher */}
              {participants
                .sort((a, b) => (a.isTeacher ? -1 : b.isTeacher ? 1 : 0))
                .map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${participant.isTeacher ? "bg-blue-50 border-l-4 border-blue-400" : ""}`}
                    onClick={() => userType === "student" && startPrivateChat(participant)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${participant.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                      <User className="w-4 h-4 text-gray-600" />
                      <span className={`text-sm ${participant.isTeacher ? "font-bold text-blue-700" : ""}`}>{participant.username}</span>
                      {participant.isTeacher && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 ml-2">
                          <Crown className="w-3 h-3 mr-1" />
                          Teacher
                        </Badge>
                      )}
                    </div>
                    {userType === "student" && !participant.isTeacher && (
                      <Button variant="ghost" size="sm" className="text-xs">
                        Chat
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {getCurrentMessages().map((message) => (
                  <div key={message.id} className="text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">
                            {message.senderId === "system" ? (
                              <Badge variant="secondary" className="text-xs">
                                <Bell className="w-3 h-3 mr-1" />
                                System
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className={isTeacherMessage(message.senderName) ? "text-blue-600 font-bold" : ""}>
                                  {message.senderName}
                                </span>
                                {isTeacherMessage(message.senderName) && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Teacher
                                  </Badge>
                                )}
                              </div>
                            )}
                          </span>
                          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                          {message.type !== "public" && (
                            <Badge variant="outline" className={`text-xs ${getMessageTypeColor(message.type)}`}>
                              {message.type}
                            </Badge>
                          )}
                        </div>
                        <div
                          className={`text-gray-700 break-words p-2 rounde-lg ${
                            isTeacherMessage(message.senderName)
                              ? "bg-blue-50 border-l-4 border-blue-400"
                              : "bg-gray-50"
                          }`}
                        >
                          {message.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={
                    activePrivateChat
                      ? "Type a private message..."
                      : userType === "teacher"
                        ? "Type a message..."
                        : "Ask a question..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="text-sm"
                />
                <Button onClick={sendMessage} size="sm" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
