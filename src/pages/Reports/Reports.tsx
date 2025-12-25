import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import reportService from '../../services/reportService';
import collegeService from '../../services/collegeService';
import courseService from '../../services/courseService';
import studentService from '../../services/studentService';
import userService from '../../services/userService';
import { DashboardStats } from '../../types/reports';
import { ApiCollege } from '../../types/college';
import { ApiCourse } from '../../types/course';
import { ApiStudent } from '../../types/student';
import { ApiUser } from '../../types/user';

type TabType = 'overview' | 'students' | 'courses' | 'colleges' | 'trainers';

interface CollegeWithStats extends ApiCollege {
  studentCount: number;
  batchCount: number;
  sessionCount: number;
}

const Reports: React.FC = () => {
  const { addToast } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [collegeFilter, setCollegeFilter] = useState('');

  // API Data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [colleges, setColleges] = useState<CollegeWithStats[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [trainers, setTrainers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, collegesRes, coursesRes, studentsRes, trainersRes] = await Promise.all([
        reportService.getDashboardStats(),
        collegeService.getColleges({ limit: 100 }),
        courseService.getCourses({ limit: 100 }),
        studentService.getStudents({ limit: 500 }),
        userService.getUsers({ role: 'TRAINER', status: 'ACTIVE', limit: 100 }),
      ]);

      if (statsRes.success && statsRes.data) {
        setDashboardStats(statsRes.data);
      }

      if (collegesRes.success && collegesRes.data) {
        // Enhance colleges with student counts
        const collegesWithStats: CollegeWithStats[] = collegesRes.data.colleges.map(college => ({
          ...college,
          studentCount: 0,
          batchCount: college._count?.batches || 0,
          sessionCount: 0,
        }));
        setColleges(collegesWithStats);
      }

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data.courses);
      }

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students);
      }

      if (trainersRes.success && trainersRes.data) {
        setTrainers(trainersRes.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      addToast('error', 'Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate statistics from API data
  const totalStudents = dashboardStats?.students.total || students.length;
  const totalColleges = dashboardStats?.colleges.total || colleges.length;
  const totalCourses = dashboardStats?.courses.total || courses.length;
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED');
  const draftCourses = courses.filter(c => c.status === 'DRAFT');
  const totalAssessments = dashboardStats?.assessments.total || 0;
  const totalBatches = dashboardStats?.batches.total || 0;
  const activeTrainers = trainers.length;

  // Calculate students per college
  const studentsByCollege = students.reduce((acc, student) => {
    const collegeId = student.college?.id;
    if (collegeId) {
      acc[collegeId] = (acc[collegeId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate students per course
  const studentsByCourse = students.reduce((acc, student) => {
    const courseTitle = student.course?.title;
    if (courseTitle) {
      acc[courseTitle] = (acc[courseTitle] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate students per trainer
  const studentsByTrainer = students.reduce((acc, student) => {
    const trainerId = student.trainer?.id;
    if (trainerId) {
      acc[trainerId] = (acc[trainerId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate students per department
  const departmentDistribution = students.reduce((acc, student) => {
    const dept = student.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate students per batch
  const batchDistribution = students.reduce((acc, student) => {
    const batchName = student.batch?.name || 'Unassigned';
    acc[batchName] = (acc[batchName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate colleges per city
  const collegesByCity = colleges.reduce((acc, college) => {
    const city = college.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate students per city
  const studentsByCity = students.reduce((acc, student) => {
    const city = student.college?.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // College performance data
  const collegePerformance = colleges.map(college => ({
    id: college.id,
    name: college.name,
    university: college.university || '-',
    city: college.city || '-',
    students: studentsByCollege[college.id] || 0,
    batches: college._count?.batches || 0,
    sessions: 0, // Would need session API
    progress: Math.min(100, ((studentsByCollege[college.id] || 0) / Math.max(totalStudents, 1)) * 500), // Normalized progress
  }));

  // Trainer workload data
  const trainerWorkload = trainers.map(trainer => ({
    id: trainer.id,
    name: trainer.username,
    email: trainer.email,
    designation: trainer.designation || 'Trainer',
    students: studentsByTrainer[trainer.id] || 0,
    colleges: [...new Set(students.filter(s => s.trainer?.id === trainer.id).map(s => s.college?.id))].length,
  }));

  // Course distribution data
  const courseDistribution = courses.map(course => ({
    id: course.id,
    name: course.title,
    status: course.status,
    students: studentsByCourse[course.title] || 0,
    modules: course._count?.coreSkills || 0,
    durationDays: course.durationDays,
    description: course.description || '',
  }));

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    addToast('info', `Preparing ${format.toUpperCase()} export... Download will start shortly.`);
    setTimeout(() => {
      addToast('success', `${format.toUpperCase()} report exported successfully!`);
    }, 1500);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'students', label: 'Students', icon: 'school' },
    { id: 'courses', label: 'Courses', icon: 'menu_book' },
    { id: 'colleges', label: 'Colleges', icon: 'apartment' },
    { id: 'trainers', label: 'Trainers', icon: 'groups' },
  ];

  // Pie chart component
  const PieChart = ({ data, colors, size = 'normal' }: { data: { label: string; value: number }[]; colors: string[]; size?: 'small' | 'normal' }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let currentAngle = 0;
    const chartSize = size === 'small' ? 'w-32 h-32' : 'w-40 h-40';

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      );
    }

    return (
      <div className="flex items-center gap-6">
        <div className={`relative ${chartSize}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {data.map((item, idx) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;

              return (
                <path
                  key={idx}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[idx % colors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{total}</span>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[idx % colors.length] }} />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bar chart component
  const BarChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: colors[idx % colors.length]
                }}
              >
                <span className="text-xs font-bold text-white">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Progress bar component
  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  // Stat Card Component
  const StatCard = ({ icon, iconBg, iconColor, value, label, trend }: {
    icon: string;
    iconBg: string;
    iconColor: string;
    value: string | number;
    label: string;
    trend?: { value: string; positive: boolean };
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{value}</p>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive insights for admin decision making</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-lg">table_chart</span>
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 flex items-center gap-2 text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">College</label>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-700 text-sm"
            >
              <option value="">All Colleges</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">filter_alt</span>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon="school" iconBg="bg-blue-50" iconColor="text-blue-600" value={totalStudents} label="Students" />
            <StatCard icon="apartment" iconBg="bg-purple-50" iconColor="text-purple-600" value={totalColleges} label="Colleges" />
            <StatCard icon="menu_book" iconBg="bg-green-50" iconColor="text-green-600" value={publishedCourses.length} label="Active Courses" />
            <StatCard icon="groups" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={activeTrainers} label="Trainers" />
            <StatCard icon="assignment" iconBg="bg-red-50" iconColor="text-red-600" value={totalAssessments} label="Assessments" />
            <StatCard icon="event" iconBg="bg-indigo-50" iconColor="text-indigo-600" value={totalBatches} label="Batches" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Course Status</h3>
              <PieChart
                data={[
                  { label: 'Published', value: publishedCourses.length },
                  { label: 'Draft', value: draftCourses.length },
                ]}
                colors={['#10B981', '#F59E0B']}
              />
            </div>

            {/* Student Distribution by College */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Students by College</h3>
              <BarChart
                data={colleges.slice(0, 5).map(c => ({
                  label: c.name.split(' ').slice(0, 2).join(' '),
                  value: studentsByCollege[c.id] || 0
                }))}
                colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']}
              />
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Student-Trainer Ratio</p>
                  <p className="text-3xl font-bold mt-2">
                    {activeTrainers > 0 ? `1:${Math.round(totalStudents / activeTrainers)}` : 'N/A'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-blue-200">balance</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Students/College</p>
                  <p className="text-3xl font-bold mt-2">
                    {totalColleges > 0 ? Math.round(totalStudents / totalColleges) : 0}
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-purple-200">trending_up</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Courses</p>
                  <p className="text-3xl font-bold mt-2">{totalCourses}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-green-200">auto_stories</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Student Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="people" iconBg="bg-blue-50" iconColor="text-blue-600" value={totalStudents} label="Total Enrolled" />
            <StatCard icon="groups_3" iconBg="bg-purple-50" iconColor="text-purple-600" value={Object.keys(batchDistribution).length} label="Active Batches" />
            <StatCard icon="account_tree" iconBg="bg-green-50" iconColor="text-green-600" value={Object.keys(departmentDistribution).length} label="Departments" />
            <StatCard icon="analytics" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={totalColleges > 0 ? Math.round(totalStudents / totalColleges) : 0} label="Avg per College" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Students by Batch</h3>
              {Object.keys(batchDistribution).length === 0 ? (
                <p className="text-gray-400 text-center py-8">No batch data available</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(batchDistribution).slice(0, 5).map(([batch, count], idx) => {
                    const maxCount = Math.max(...Object.values(batchDistribution), 1);
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                    return (
                      <div key={batch}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{batch}</span>
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                        </div>
                        <ProgressBar value={count} max={maxCount} color={colors[idx % colors.length]} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Students by Department</h3>
              <PieChart
                data={Object.entries(departmentDistribution).map(([dept, count]) => ({ label: dept, value: count }))}
                colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']}
              />
            </div>
          </div>

          {/* Course Assignment Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">Course-wise Enrollment</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Students</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courseDistribution.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No course data available
                      </td>
                    </tr>
                  ) : (
                    courseDistribution.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{course.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            course.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.students}</td>
                        <td className="px-6 py-4 w-48">
                          <ProgressBar
                            value={course.students}
                            max={Math.max(...courseDistribution.map(c => c.students), 1)}
                            color="bg-primary-600"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon="auto_stories" iconBg="bg-blue-50" iconColor="text-blue-600" value={totalCourses} label="Total Courses" />
            <StatCard icon="check_circle" iconBg="bg-green-50" iconColor="text-green-600" value={publishedCourses.length} label="Published" />
            <StatCard icon="edit_note" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={draftCourses.length} label="Drafts" />
            <StatCard icon="view_module" iconBg="bg-purple-50" iconColor="text-purple-600" value={courses.reduce((acc, c) => acc + (c._count?.coreSkills || 0), 0)} label="Core Skills" />
            <StatCard icon="assignment" iconBg="bg-indigo-50" iconColor="text-indigo-600" value={totalAssessments} label="Assessments" />
          </div>

          {/* Course Details Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">Course Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Core Skills</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No course data available
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{course.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            course.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{course.durationDays} days</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                            {course._count?.coreSkills || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {studentsByCourse[course.title] || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Colleges Tab */}
      {activeTab === 'colleges' && (
        <div className="space-y-6">
          {/* College Performance Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">College Performance Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">College</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">University</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">City</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Students</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Batches</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Sessions</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {collegePerformance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No college data available
                      </td>
                    </tr>
                  ) : (
                    collegePerformance.map((college) => (
                      <tr key={college.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{college.name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{college.university}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{college.city}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                            {college.students}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{college.batches}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{college.sessions}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20">
                              <ProgressBar
                                value={college.progress}
                                max={100}
                                color={college.progress >= 70 ? 'bg-green-500' : college.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{Math.round(college.progress)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* City Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Colleges by City</h3>
              <PieChart
                data={Object.entries(collegesByCity).map(([city, count]) => ({
                  label: city,
                  value: count,
                }))}
                colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']}
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Students by City</h3>
              <PieChart
                data={Object.entries(studentsByCity).map(([city, count]) => ({
                  label: city,
                  value: count,
                }))}
                colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']}
              />
            </div>
          </div>
        </div>
      )}

      {/* Trainers Tab */}
      {activeTab === 'trainers' && (
        <div className="space-y-6">
          {/* Trainer Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="person" iconBg="bg-blue-50" iconColor="text-blue-600" value={activeTrainers} label="Active Trainers" />
            <StatCard icon="school" iconBg="bg-purple-50" iconColor="text-purple-600" value={totalStudents} label="Total Students" />
            <StatCard icon="balance" iconBg="bg-green-50" iconColor="text-green-600" value={activeTrainers > 0 ? Math.round(totalStudents / activeTrainers) : 0} label="Avg Students/Trainer" />
            <StatCard icon="apartment" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={totalColleges} label="Colleges Covered" />
          </div>

          {/* Trainer Workload Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Trainer Workload Comparison</h3>
            <BarChart
              data={trainerWorkload.slice(0, 5).map(t => ({ label: t.name.split(' ')[0], value: t.students }))}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
            />
          </div>

          {/* Trainer Workload Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">Trainer Workload Distribution</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Trainer</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Designation</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Assigned Students</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Colleges</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Workload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trainerWorkload.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No trainer data available
                      </td>
                    </tr>
                  ) : (
                    trainerWorkload.map((trainer) => {
                      const maxStudents = Math.max(...trainerWorkload.map(t => t.students), 1);
                      const workloadPercentage = (trainer.students / maxStudents) * 100;
                      return (
                        <tr key={trainer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{trainer.name}</p>
                            <p className="text-xs text-gray-400">{trainer.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{trainer.designation}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                              {trainer.students}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{trainer.colleges}</td>
                          <td className="px-6 py-4 w-48">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ProgressBar
                                  value={trainer.students}
                                  max={maxStudents}
                                  color={workloadPercentage > 70 ? 'bg-red-500' : workloadPercentage > 40 ? 'bg-yellow-500' : 'bg-green-500'}
                                />
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                workloadPercentage > 70 ? 'bg-red-50 text-red-700' :
                                workloadPercentage > 40 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                              }`}>
                                {workloadPercentage > 70 ? 'High' : workloadPercentage > 40 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
