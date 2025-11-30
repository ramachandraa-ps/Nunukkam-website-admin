import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

type TabType = 'overview' | 'students' | 'courses' | 'colleges' | 'trainers';

const Reports: React.FC = () => {
  const { colleges, courses, users, chapters, coreSkills, skills, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [collegeFilter, setCollegeFilter] = useState('');

  // Calculate comprehensive metrics
  const totalStudents = colleges.reduce((acc, c) => acc + c.students.length, 0);
  const trainers = users.filter(u => u.role === 'Trainer' && u.status === 'active');
  const totalColleges = colleges.length;
  const publishedCourses = courses.filter(c => c.status === 'Published');
  const draftCourses = courses.filter(c => c.status === 'Draft');
  const totalAssessments = chapters.reduce((acc, ch) => acc + ch.assessments.length, 0);
  const totalSessions = colleges.reduce((acc, c) => acc + c.schedules.length, 0);
  const totalModules = courses.reduce((acc, c) => acc + c.modules.length, 0);

  // Get unique batches across all colleges
  const allBatches = colleges.flatMap(c => c.students.map(s => s.batch));
  const uniqueBatches = [...new Set(allBatches)];

  // Course distribution data
  const courseDistribution = courses.map(course => {
    const studentCount = colleges.reduce((acc, c) =>
      acc + c.students.filter(s => s.courseAssigned === course.title).length, 0
    );
    return { name: course.title, count: studentCount, status: course.status };
  });

  // College performance data
  const collegePerformance = colleges.map(college => ({
    id: college.id,
    name: college.name,
    university: college.university,
    city: college.city,
    students: college.students.length,
    sessions: college.schedules.length,
    batches: [...new Set(college.students.map(s => s.batch))].length,
    assessments: college.assessmentDeadlines.length,
    completion: college.schedules.length > 0 ? Math.min(100, Math.floor((college.schedules.length / 10) * 100)) : 0,
  }));

  // Trainer workload
  const trainerWorkload = trainers.map(trainer => {
    const assignedStudents = colleges.reduce((acc, c) =>
      acc + c.students.filter(s => s.trainer === trainer.name).length, 0
    );
    const assignedColleges = colleges.filter(c =>
      c.students.some(s => s.trainer === trainer.name)
    ).length;
    return {
      name: trainer.name,
      students: assignedStudents,
      colleges: assignedColleges,
      designation: trainer.designation,
    };
  });

  // Batch-wise student distribution
  const batchDistribution = uniqueBatches.map(batch => ({
    batch,
    count: colleges.reduce((acc, c) =>
      acc + c.students.filter(s => s.batch === batch).length, 0
    ),
  }));

  // Department distribution
  const allDepartments = colleges.flatMap(c => c.students.map(s => s.department));
  const departmentCounts = allDepartments.reduce((acc, dept) => {
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const departmentDistribution = Object.entries(departmentCounts).map(([dept, count]) => ({
    department: dept as string,
    count: count as number,
  }));

  // Get upcoming sessions across all colleges
  const allSessions = colleges.flatMap(c =>
    c.schedules.map(s => ({
      ...s,
      collegeName: c.name,
      collegeId: c.id
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get recent activity (simulated)
  const recentActivity = [
    { type: 'student', action: 'enrolled', detail: '2 students enrolled in Global Institute', time: '2 hours ago', icon: 'person_add' },
    { type: 'course', action: 'published', detail: 'Soft Skills Development published', time: '5 hours ago', icon: 'check_circle' },
    { type: 'session', action: 'completed', detail: 'Communication Basics session completed', time: '1 day ago', icon: 'event_available' },
    { type: 'assessment', action: 'created', detail: 'New MCQ assessment added', time: '2 days ago', icon: 'quiz' },
  ];

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    addToast('info', `Preparing ${format.toUpperCase()} export... Download will start shortly.`);
    // Simulate export delay
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
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );

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
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 text-sm flex items-center justify-center gap-2 transition-colors">
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
            <StatCard icon="school" iconBg="bg-blue-50" iconColor="text-blue-600" value={totalStudents} label="Students" trend={{ value: '12%', positive: true }} />
            <StatCard icon="apartment" iconBg="bg-purple-50" iconColor="text-purple-600" value={totalColleges} label="Colleges" />
            <StatCard icon="menu_book" iconBg="bg-green-50" iconColor="text-green-600" value={publishedCourses.length} label="Active Courses" />
            <StatCard icon="groups" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={trainers.length} label="Trainers" />
            <StatCard icon="assignment" iconBg="bg-red-50" iconColor="text-red-600" value={totalAssessments} label="Assessments" />
            <StatCard icon="event" iconBg="bg-indigo-50" iconColor="text-indigo-600" value={totalSessions} label="Sessions" />
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
                data={colleges.map(c => ({ label: c.name.split(' ')[0], value: c.students.length }))}
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
                    {trainers.length > 0 ? `1:${Math.round(totalStudents / trainers.length)}` : 'N/A'}
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
                  <p className="text-green-100 text-sm font-medium">Total Skills Covered</p>
                  <p className="text-3xl font-bold mt-2">{coreSkills.length + skills.length}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-green-200">psychology</span>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">Upcoming Sessions</h3>
                <span className="text-xs text-gray-400">Next 7 days</span>
              </div>
              {allSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                  <p>No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allSessions.slice(0, 4).map((session, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-100 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-primary-700">
                          {new Date(session.date).toLocaleDateString('en-US', { day: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-primary-600 uppercase">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{session.chapter}</p>
                        <p className="text-xs text-gray-500">{session.collegeName}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full">
                          {session.batch}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'student' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'course' ? 'bg-green-50 text-green-600' :
                      activity.type === 'session' ? 'bg-purple-50 text-purple-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      <span className="material-symbols-outlined text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.detail}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
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
            <StatCard icon="groups_3" iconBg="bg-purple-50" iconColor="text-purple-600" value={uniqueBatches.length} label="Active Batches" />
            <StatCard icon="account_tree" iconBg="bg-green-50" iconColor="text-green-600" value={departmentDistribution.length} label="Departments" />
            <StatCard icon="analytics" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={totalStudents > 0 && totalColleges > 0 ? Math.round(totalStudents / totalColleges) : 0} label="Avg per College" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Students by Batch</h3>
              {batchDistribution.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No batch data available</p>
              ) : (
                <div className="space-y-4">
                  {batchDistribution.map((item, idx) => {
                    const maxCount = Math.max(...batchDistribution.map(b => b.count), 1);
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'];
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.batch}</span>
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        </div>
                        <ProgressBar value={item.count} max={maxCount} color={colors[idx % colors.length]} />
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
                data={departmentDistribution.map(d => ({ label: String(d.department), value: Number(d.count) }))}
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
                  {courseDistribution.map((course, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{course.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          course.status === 'Published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.count}</td>
                      <td className="px-6 py-4 w-48">
                        <ProgressBar
                          value={course.count}
                          max={Math.max(...courseDistribution.map(c => c.count), 1)}
                          color="bg-primary-600"
                        />
                      </td>
                    </tr>
                  ))}
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
            <StatCard icon="auto_stories" iconBg="bg-blue-50" iconColor="text-blue-600" value={courses.length} label="Total Courses" />
            <StatCard icon="check_circle" iconBg="bg-green-50" iconColor="text-green-600" value={publishedCourses.length} label="Published" />
            <StatCard icon="edit_note" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={draftCourses.length} label="Drafts" />
            <StatCard icon="view_module" iconBg="bg-purple-50" iconColor="text-purple-600" value={totalModules} label="Total Modules" />
            <StatCard icon="menu_book" iconBg="bg-indigo-50" iconColor="text-indigo-600" value={chapters.length} label="Total Chapters" />
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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Modules</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Core Skills</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{course.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          course.status === 'Published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.durationDays} days</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                          {course.modules.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                          {course.coreSkills.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {colleges.reduce((acc, c) =>
                          acc + c.students.filter(s => s.courseAssigned === course.title).length, 0
                        )}
                      </td>
                    </tr>
                  ))}
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
                                value={college.completion}
                                max={100}
                                color={college.completion >= 70 ? 'bg-green-500' : college.completion >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{college.completion}%</span>
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
                data={[...new Set(colleges.map(c => c.city))].map((city: string) => ({
                  label: city,
                  value: colleges.filter(c => c.city === city).length,
                }))}
                colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']}
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Students by City</h3>
              <PieChart
                data={[...new Set(colleges.map(c => c.city))].map((city: string) => ({
                  label: city,
                  value: colleges.filter(c => c.city === city).reduce((acc, c) => acc + c.students.length, 0),
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
            <StatCard icon="person" iconBg="bg-blue-50" iconColor="text-blue-600" value={trainers.length} label="Active Trainers" />
            <StatCard icon="school" iconBg="bg-purple-50" iconColor="text-purple-600" value={totalStudents} label="Total Students" />
            <StatCard icon="balance" iconBg="bg-green-50" iconColor="text-green-600" value={trainers.length > 0 ? Math.round(totalStudents / trainers.length) : 0} label="Avg Students/Trainer" />
            <StatCard icon="apartment" iconBg="bg-yellow-50" iconColor="text-yellow-600" value={totalColleges} label="Colleges Covered" />
          </div>

          {/* Trainer Workload Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-6">Trainer Workload Comparison</h3>
            <BarChart
              data={trainerWorkload.map(t => ({ label: t.name.split(' ')[0], value: t.students }))}
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
                    trainerWorkload.map((trainer, idx) => {
                      const maxStudents = Math.max(...trainerWorkload.map(t => t.students), 1);
                      const workloadPercentage = (trainer.students / maxStudents) * 100;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{trainer.name}</p>
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
