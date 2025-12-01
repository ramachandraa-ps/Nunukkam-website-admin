import React from 'react';

interface Course {
    title: string;
    status: string;
    modules: any[];
}

interface ActivityListProps {
    courses: Course[];
}

const ActivityList: React.FC<ActivityListProps> = ({ courses }) => {
    return (
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
    );
};

export default ActivityList;
