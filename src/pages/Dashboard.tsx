import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import ActionCards from '../components/sections/ActionCards';
import StatsGrid from '../components/sections/StatsGrid';
import ActivityList from '../components/sections/ActivityList';
import reportService from '../services/reportService';
import { DashboardStats } from '../types/reports';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await reportService.getDashboardStats();
        if (response.success && response.data) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = dashboardStats
    ? [
        { title: 'Total Students', value: dashboardStats.students.total.toLocaleString(), change: '+12%', icon: 'group' },
        { title: 'Active Courses', value: dashboardStats.courses.published.toString(), change: '+8%', icon: 'auto_stories' },
        { title: 'Total Assessments', value: dashboardStats.assessments.total.toString(), change: '+5', icon: 'quiz' },
      ]
    : [
        { title: 'Total Students', value: '-', change: '', icon: 'group' },
        { title: 'Active Courses', value: '-', change: '', icon: 'auto_stories' },
        { title: 'Total Assessments', value: '-', change: '', icon: 'quiz' },
      ];

  const cards = [
    {
      title: 'Manage Courses',
      subtitle: 'Create, edit, publish',
      count: dashboardStats?.courses.total.toString() || '-',
      subCount: `${dashboardStats?.courses.published || 0} Published`,
      icon: 'school',
      color: 'bg-green-100 text-green-700',
      path: '/courses',
    },
    {
      title: 'Program Management',
      subtitle: 'Manage colleges',
      count: dashboardStats?.colleges.total.toString() || '-',
      subCount: `${dashboardStats?.students.total || 0} Students`,
      icon: 'collections_bookmark',
      color: 'bg-purple-100 text-purple-700',
      path: '/colleges',
    },
    {
      title: 'User Management',
      subtitle: 'View and manage users',
      count: dashboardStats?.users.active.toString() || '-',
      subCount: 'Active Users',
      icon: 'group',
      color: 'bg-blue-100 text-blue-700',
      path: '/users',
    },
    {
      title: 'Reports',
      subtitle: 'View detailed analytics',
      link: 'View Reports →',
      icon: 'bar_chart',
      color: 'bg-orange-100 text-orange-700',
      path: '/reports',
    },
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
            <button onClick={() => navigate('/reports')} className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View All
            </button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
            </div>
          ) : (
            <StatsGrid stats={stats} />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Recent Activity</h3>
          <ActivityList courses={[]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
