"use client"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { X, Clock, Users, CheckCircle, BarChart3 } from "lucide-react"

export default function PollHistoryModal({ poll, onClose }) {
  if (!poll) return null

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getResponsePercentage = (optionIndex) => {
    if (!poll.totalResponses) return 0
    return ((poll.responses[optionIndex] || 0) / poll.totalResponses) * 100
  }

  const isCorrectAnswer = (optionIndex) => {
    return poll.correctAnswers && poll.correctAnswers.includes(optionIndex)
  }

  const getCorrectResponsesCount = () => {
    if (!poll.correctAnswers || !poll.responses) return 0
    return poll.correctAnswers.reduce((count, correctIndex) => {
      return count + (poll.responses[correctIndex] || 0)
    }, 0)
  }

  const getAccuracyPercentage = () => {
    if (!poll.totalResponses || !poll.correctAnswers || poll.correctAnswers.length === 0) return 0
    return (getCorrectResponsesCount() / poll.totalResponses) * 100
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Poll Details
              </CardTitle>
              <CardDescription>Complete poll analysis and results</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Poll Question */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration: {formatTime(poll.duration)}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {poll.totalResponses} Responses
              </Badge>
              {poll.correctAnswers && poll.correctAnswers.length > 0 && poll.totalResponses > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  {getAccuracyPercentage().toFixed(1)}% Accuracy
                </Badge>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Created:</span>
              <p>{formatDate(poll.createdAt)}</p>
            </div>
            {poll.startedAt && (
              <div>
                <span className="font-medium text-gray-600">Started:</span>
                <p>{formatDate(poll.startedAt)}</p>
              </div>
            )}
            {poll.endedAt && (
              <div>
                <span className="font-medium text-gray-600">Ended:</span>
                <p>{formatDate(poll.endedAt)}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <p>
                <Badge variant={poll.isActive ? "default" : "secondary"}>
                  {poll.isActive ? "Active" : "Completed"}
                </Badge>
              </p>
            </div>
          </div>

          {/* Response Analysis */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Response Analysis
            </h4>
            <div className="space-y-4">
              {poll.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{option}</span>
                      {isCorrectAnswer(index) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{poll.responses[index] || 0} votes</span>
                      <span className="text-sm text-gray-500 ml-2">({getResponsePercentage(index).toFixed(1)}%)</span>
                    </div>
                  </div>
                  <Progress
                    value={getResponsePercentage(index)}
                    className={`h-3 ${isCorrectAnswer(index) ? "bg-green-100" : ""}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          {poll.correctAnswers && poll.correctAnswers.length > 0 && poll.totalResponses > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Performance Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Correct Responses:</span>
                  <p className="font-semibold text-green-600">
                    {getCorrectResponsesCount()} / {poll.totalResponses}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Accuracy Rate:</span>
                  <p className="font-semibold text-green-600">{getAccuracyPercentage().toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Incorrect Responses:</span>
                  <p className="font-semibold text-red-600">
                    {poll.totalResponses - getCorrectResponsesCount()} / {poll.totalResponses}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Response Rate:</span>
                  <p className="font-semibold">{poll.totalResponses > 0 ? "100%" : "0%"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Stats */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Additional Information</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Poll ID:</span>
                <span className="font-mono text-xs">{poll.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Remaining:</span>
                <span>{formatTime(poll.timeRemaining)}</span>
              </div>
              {poll.startedAt && poll.endedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Duration:</span>
                  <span>{Math.round((new Date(poll.endedAt) - new Date(poll.startedAt)) / 1000)} seconds</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
