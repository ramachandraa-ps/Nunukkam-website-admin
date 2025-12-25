import React, { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { PATHS } from './paths';

// ----------------------------------------------------------------------

const Loadable = (Component: React.LazyExoticComponent<any>) => (props: any) => {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <Component {...props} />
        </Suspense>
    );
};

// ----------------------------------------------------------------------

// Auth
const Login = Loadable(lazy(() => import('../pages/Auth/Login')));
const ResetPassword = Loadable(lazy(() => import('../pages/Auth/ResetPassword')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../pages/Dashboard')));

// User Management
const UserManagement = Loadable(lazy(() => import('../pages/UserManagement/UserManagement')));
const AddUser = Loadable(lazy(() => import('../pages/UserManagement/AddUser')));
const Roles = Loadable(lazy(() => import('../pages/UserManagement/Roles')));
const Designations = Loadable(lazy(() => import('../pages/UserManagement/Designations')));
const DeactivatedUsers = Loadable(lazy(() => import('../pages/UserManagement/DeactivatedUsers')));

// Course Master
const Courses = Loadable(lazy(() => import('../pages/CourseMaster/Courses')));
const CreateCourse = Loadable(lazy(() => import('../pages/CourseMaster/CreateCourse')));
const CoreSkills = Loadable(lazy(() => import('../pages/CourseMaster/CoreSkills')));
const Skills = Loadable(lazy(() => import('../pages/CourseMaster/Skills')));
const AssessmentTypes = Loadable(lazy(() => import('../pages/CourseMaster/AssessmentTypes')));
const Chapters = Loadable(lazy(() => import('../pages/CourseMaster/Chapters')));
const AddChapter = Loadable(lazy(() => import('../pages/CourseMaster/AddChapter')));
const CourseModules = Loadable(lazy(() => import('../pages/CourseMaster/CourseModules')));
const AddAssessment = Loadable(lazy(() => import('../pages/CourseMaster/AddAssessment')));
const AddQuestions = Loadable(lazy(() => import('../pages/CourseMaster/AddQuestions')));
const AddModule = Loadable(lazy(() => import('../pages/CourseMaster/AddModule')));
const Assessments = Loadable(lazy(() => import('../pages/CourseMaster/Assessments')));
const AssessmentDeadlines = Loadable(lazy(() => import('../pages/CourseMaster/AssessmentDeadlines')));

// Grading
const Grading = Loadable(lazy(() => import('../pages/Grading')));

// Program Management (Colleges)
const Colleges = Loadable(lazy(() => import('../pages/Colleges/Colleges')));
const ProgramMaster = Loadable(lazy(() => import('../pages/Colleges/ProgramMaster')));
const AddCollege = Loadable(lazy(() => import('../pages/Colleges/AddCollege')));
const CollegeStudents = Loadable(lazy(() => import('../pages/Colleges/CollegeStudents')));
const BulkUploadStudents = Loadable(lazy(() => import('../pages/Colleges/BulkUploadStudents')));
const ScheduleSessions = Loadable(lazy(() => import('../pages/Colleges/ScheduleSessions')));
const ManageBatches = Loadable(lazy(() => import('../pages/Colleges/ManageBatches')));
const SessionAttendance = Loadable(lazy(() => import('../pages/Colleges/SessionAttendance')));
const BatchAttendanceSummary = Loadable(lazy(() => import('../pages/Colleges/BatchAttendanceSummary')));

// Reports
const Reports = Loadable(lazy(() => import('../pages/Reports/Reports')));

// Settings
const Settings = Loadable(lazy(() => import('../pages/Settings/Settings')));

// Notifications
const Notifications = Loadable(lazy(() => import('../pages/Notifications/Notifications')));

// Error
const NotFound = Loadable(lazy(() => import('../pages/NotFound')));

// ----------------------------------------------------------------------

export default function Router() {
    return useRoutes([
        {
            path: PATHS.AUTH.LOGIN,
            element: <Login />,
        },
        {
            path: PATHS.AUTH.RESET_PASSWORD,
            element: <ResetPassword />,
        },
        {
            path: PATHS.AUTH.RESET_PASSWORD_TOKEN,
            element: <ResetPassword />,
        },
        {
            element: (
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            ),
            children: [
                { element: <Navigate to={PATHS.DASHBOARD.ROOT} replace />, index: true },
                { path: PATHS.DASHBOARD.ROOT, element: <Dashboard /> },

                // User Management
                { path: PATHS.DASHBOARD.USERS.ROOT, element: <UserManagement /> },
                { path: PATHS.DASHBOARD.USERS.ADD, element: <AddUser /> },
                { path: '/users/edit/:id', element: <AddUser /> },
                { path: PATHS.DASHBOARD.USERS.ROLES, element: <Roles /> },
                { path: PATHS.DASHBOARD.USERS.DESIGNATIONS, element: <Designations /> },
                { path: PATHS.DASHBOARD.USERS.DEACTIVATED, element: <DeactivatedUsers /> },

                // Course Master
                { path: PATHS.DASHBOARD.COURSES.ROOT, element: <Courses /> },
                { path: PATHS.DASHBOARD.COURSES.CREATE, element: <CreateCourse /> },
                { path: '/courses/edit/:id', element: <CreateCourse /> },
                { path: '/courses/:courseId/core-skills', element: <CoreSkills /> },
                { path: '/courses/:courseId/modules', element: <CourseModules /> },
                { path: '/courses/:courseId/modules/add', element: <AddModule /> },
                { path: PATHS.DASHBOARD.COURSES.CORE_SKILLS, element: <CoreSkills /> },
                { path: PATHS.DASHBOARD.COURSES.SKILLS, element: <Skills /> },
                { path: PATHS.DASHBOARD.COURSES.ASSESSMENT_TYPES, element: <AssessmentTypes /> },
                { path: PATHS.DASHBOARD.COURSES.CHAPTERS.ROOT, element: <Chapters /> },
                { path: PATHS.DASHBOARD.COURSES.CHAPTERS.ADD, element: <AddChapter /> },
                { path: '/courses/chapters/edit/:id', element: <AddChapter /> },
                { path: '/courses/chapters/:chapterId/assessments/add', element: <AddAssessment /> },
                { path: '/courses/chapters/:chapterId/assessments/:assessmentId/edit', element: <AddAssessment /> },
                { path: '/courses/chapters/:chapterId/assessments/:assessmentId/questions', element: <AddQuestions /> },
                { path: PATHS.DASHBOARD.COURSES.ASSESSMENTS.ROOT, element: <Assessments /> },
                { path: PATHS.DASHBOARD.COURSES.ASSESSMENTS.DEADLINES, element: <AssessmentDeadlines /> },

                // Grading
                { path: PATHS.DASHBOARD.GRADING.ROOT, element: <Grading /> },

                // Program Management
                { path: PATHS.DASHBOARD.PROGRAM.ROOT, element: <Colleges /> },
                { path: PATHS.DASHBOARD.PROGRAM.MASTER, element: <ProgramMaster /> },
                { path: PATHS.DASHBOARD.PROGRAM.ADD, element: <AddCollege /> },
                { path: '/colleges/edit/:id', element: <AddCollege /> },
                { path: '/colleges/:collegeId/students', element: <CollegeStudents /> },
                { path: '/colleges/:collegeId/students/bulk-upload', element: <BulkUploadStudents /> },
                { path: '/colleges/:collegeId/batches', element: <ManageBatches /> },
                { path: '/colleges/:collegeId/schedule', element: <ScheduleSessions /> },

                // Attendance
                { path: '/attendance/session/:sessionId', element: <SessionAttendance /> },
                { path: '/attendance/batch/:batchId', element: <BatchAttendanceSummary /> },

                // Reports
                { path: PATHS.DASHBOARD.REPORTS, element: <Reports /> },

                // Settings
                { path: PATHS.DASHBOARD.SETTINGS, element: <Settings /> },

                // Notifications
                { path: PATHS.DASHBOARD.NOTIFICATIONS, element: <Notifications /> },
            ],
        },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
    ]);
}
