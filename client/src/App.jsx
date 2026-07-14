import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NoticeBoard from './pages/NoticeBoard.jsx'
import MyComplaints from './pages/MyComplaints.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ComplaintDetails from './pages/ComplaintDetails.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/notices" element={<NoticeBoard />} />
      <Route path="/complaints" element={<MyComplaints />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/complaints/:id" element={<ComplaintDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
