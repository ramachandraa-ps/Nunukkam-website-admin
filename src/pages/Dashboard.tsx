import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import HeroSection from '../components/sections/HeroSection';
import ActionCards from '../components/sections/ActionCards';
import StatsGrid from '../components/sections/StatsGrid';
import ActivityList from '../components/sections/ActivityList';

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
      <HeroSection />

      {/* Action Cards */}
      <ActionCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Quick Stats</h3>
            <button onClick={() => navigate('/reports')} className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
          </div>
          <StatsGrid stats={stats} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Recent Activity</h3>
          <ActivityList courses={courses} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;