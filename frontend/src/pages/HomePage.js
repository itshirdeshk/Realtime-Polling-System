"use client"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Users, UserCheck, BarChart3, Clock } from "lucide-react"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Classroom Polling System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Engage your students with real-time polls and interactive learning experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Teacher Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Create polls, manage students, and view real-time results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  <span>Real-time poll results</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Configurable poll timers</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span>Student management</span>
                </div>
              </div>
              <Button
                onClick={() => navigate("/teacher")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                Enter as Teacher
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Student Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Join polls, submit answers, and see live results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>60-second response window</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  <span>Live result updates</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Interactive participation</span>
                </div>
              </div>
              <Button
                onClick={() => navigate("/student")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
              >
                Join as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600">See results update instantly as students respond</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visual Analytics</h3>
              <p className="text-sm text-gray-600">Beautiful charts and graphs for poll results</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Management</h3>
              <p className="text-sm text-gray-600">Simple tools for managing students and polls</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
