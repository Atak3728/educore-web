import React from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Financials from './pages/Financials.jsx'
import Students from './pages/Students.jsx'
import StudentDetail from './pages/StudentDetail.jsx'
import Courses from './pages/Courses.jsx'
import Notes from './pages/Notes.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Settings from './pages/Settings.jsx'
import Reports from './pages/Reports.jsx'
import Notifications from './pages/Notifications.jsx'

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

import { ToastProvider } from './context/ToastContext.jsx'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="*"
        element={
          <>
            <SignedIn>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="financials" element={<Financials />} />
                  <Route path="students" element={<Students />} />
                  <Route path="students/:id" element={<StudentDetail />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="courses/:id" element={<CourseDetail />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
