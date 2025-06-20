import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentPortal from "./pages/StudentPortal"
import { SocketProvider } from "./contexts/SocketContext"
import "./App.css"

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentPortal />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  )
}

export default App
