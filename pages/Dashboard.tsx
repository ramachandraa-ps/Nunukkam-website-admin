import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { courses, colleges, users, chapters } = useStore();

  const activeUsers = users.filter(u => u.status === 'active');
  const publishedCourses = courses.filter(c => c.status === 'Published');
  const totalStudents = colleges.reduce((sum, c) => sum + c.students.length, 0);

  const stats = [
    { title: 'Total Students', value: totalStudents.toLocaleString(), change: '+12%', icon: 'group' },
    { title: 'Active Courses', value: publishedCourses.length.toString(), change: '+8%', icon: 'auto_stories' },
    { title: 'Total Chapters', value: chapters.length.toString(), change: '+5', icon: 'menu_book' },
  ];

  const cards = [
    { title: 'Manage Courses', subtitle: 'Create, edit, publish', count: courses.length.toString(), subCount: `${publishedCourses.length} Published`, icon: 'school', color: 'bg-green-100 text-green-700', path: '/courses' },
    { title: 'Program Management', subtitle: 'Manage colleges', count: colleges.length.toString(), subCount: `${totalStudents} Students`, icon: 'collections_bookmark', color: 'bg-purple-100 text-purple-700', path: '/colleges' },
    { title: 'User Management', subtitle: 'View and manage users', count: activeUsers.length.toString(), subCount: 'Active Users', icon: 'group', color: 'bg-blue-100 text-blue-700', path: '/users' },
    { title: 'Reports', subtitle: 'View detailed analytics', link: 'View Reports →', icon: 'bar_chart', color: 'bg-orange-100 text-orange-700', path: '/reports' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-800 p-8 shadow-lg shadow-purple-200 text-white">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, Admin!</h2>
                <p className="text-white/80 text-sm md:text-base max-w-xl">Manage your courses, programs, and users efficiently with the new dashboard.</p>
                <button
                  onClick={() => navigate('/reports')}
                  className="mt-6 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors text-sm"
                >
                    View Analytics
                </button>
            </div>
            {/* Glassmorphism Stats Panel */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 min-w-[240px]">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wide">System Status</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-lg font-bold">All Systems Operational</span>
                </div>
            </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-xl"></div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.path)}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color} bg-opacity-50`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
                {card.count && <span className="text-3xl font-bold text-gray-900 dark:text-white">{card.count}</span>}
                {card.subCount && <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>{card.subCount}</span>}
                {card.link && <span className="text-primary-600 font-semibold text-sm group-hover:underline">{card.link}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Quick Stats</h3>
                <button onClick={() => navigate('/reports')} className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary-600">{stat.icon}</span>
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-400">{stat.title}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {courses.slice(0, 3).map((course, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                            <span className="material-symbols-outlined text-sm">{course.status === 'Published' ? 'check_circle' : 'edit'}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-200">
                                <span className="font-bold text-gray-900 dark:text-white">Course</span> "{course.title}" {course.status === 'Published' ? 'was published' : 'is in draft'}.
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">{course.modules.length} modules</p>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;