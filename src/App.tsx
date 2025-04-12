import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Directory from './pages/Directory';
import Documents from './pages/Documents';
import Gallery from './pages/Gallery';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import { EventsProvider } from './contexts/EventsContext';
import { ComplaintProvider } from './contexts/ComplaintContext';

function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <ComplaintProvider>
          <Router>
            <div 
              className="min-h-screen bg-[#F9FAFB] flex flex-col" 
              style={{ '--header-height': '4rem' } as React.CSSProperties}
            >
              <Header />
              <main className="flex-grow pt-16">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/directory" element={<Directory />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/gallery" element={<Gallery />} />
                  </Route>
                  
                  {/* Admin only routes */}
                  <Route element={<PrivateRoute adminOnly />}>
                    {/* Add admin routes here */}
                  </Route>

                  {/* Catch-all 404 Route - MUST BE LAST */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster position="top-right" toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                icon: '✅',
                style: {
                  background: '#3b8132',
                },
              },
              error: {
                icon: '❌',
                style: {
                  background: '#e53e3e',
                },
              }
            }} />
          </Router>
        </ComplaintProvider>
      </EventsProvider>
    </AuthProvider>
  );
}

export default App;