import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Auth/Login';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';

// User Management
import UserManagement from './pages/UserManagement/UserManagement';
import AddUser from './pages/UserManagement/AddUser';
import Roles from './pages/UserManagement/Roles';
import Designations from './pages/UserManagement/Designations';
import DeactivatedUsers from './pages/UserManagement/DeactivatedUsers';

// Course Master
import Courses from './pages/CourseMaster/Courses';
import CreateCourse from './pages/CourseMaster/CreateCourse';
import CoreSkills from './pages/CourseMaster/CoreSkills';
import Skills from './pages/CourseMaster/Skills';
import AssessmentTypes from './pages/CourseMaster/AssessmentTypes';
import Chapters from './pages/CourseMaster/Chapters';
import AddChapter from './pages/CourseMaster/AddChapter';
import CourseModules from './pages/CourseMaster/CourseModules';
import AddAssessment from './pages/CourseMaster/AddAssessment';
import AddQuestions from './pages/CourseMaster/AddQuestions';

// Program Management (Colleges)
import Colleges from './pages/Colleges/Colleges';
import AddCollege from './pages/Colleges/AddCollege';
import CollegeStudents from './pages/Colleges/CollegeStudents';
import ScheduleSessions from './pages/Colleges/ScheduleSessions';

// Reports
import Reports from './pages/Reports/Reports';

// Settings
import Settings from './pages/Settings/Settings';

// Notifications
import Notifications from './pages/Notifications/Notifications';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />

            {/* User Management */}
            <Route path="users" element={<UserManagement />} />
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/edit/:id" element={<AddUser />} />
            <Route path="users/roles" element={<Roles />} />
            <Route path="users/designations" element={<Designations />} />
            <Route path="users/deactivated" element={<DeactivatedUsers />} />

            {/* Course Master */}
            <Route path="courses" element={<Courses />} />
            <Route path="courses/create" element={<CreateCourse />} />
            <Route path="courses/edit/:id" element={<CreateCourse />} />
            <Route path="courses/:courseId/core-skills" element={<CoreSkills />} />
            <Route path="courses/:courseId/modules" element={<CourseModules />} />
            <Route path="courses/core-skills" element={<CoreSkills />} />
            <Route path="courses/skills" element={<Skills />} />
            <Route path="courses/assessment-types" element={<AssessmentTypes />} />
            <Route path="courses/chapters" element={<Chapters />} />
            <Route path="courses/chapters/add" element={<AddChapter />} />
            <Route path="courses/chapters/edit/:id" element={<AddChapter />} />
            <Route path="courses/chapters/:chapterId/assessments/add" element={<AddAssessment />} />
            <Route path="courses/assessments/:assessmentId/questions" element={<AddQuestions />} />

            {/* Program Management */}
            <Route path="colleges" element={<Colleges />} />
            <Route path="colleges/add" element={<AddCollege />} />
            <Route path="colleges/edit/:id" element={<AddCollege />} />
            <Route path="colleges/:collegeId/students" element={<CollegeStudents />} />
            <Route path="colleges/:collegeId/schedule" element={<ScheduleSessions />} />

            {/* Reports */}
            <Route path="reports" element={<Reports />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Notifications */}
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
