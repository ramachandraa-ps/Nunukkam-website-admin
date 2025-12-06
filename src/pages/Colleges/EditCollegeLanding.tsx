import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const EditCollegeLanding: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { colleges } = useStore();
    const college = colleges.find(c => c.id === id);

    if (!college) {
        return <div>College not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-purple-600">Program Management</span>
                    <span className="text-gray-400">&rarr;</span>
                    <span
                        onClick={() => navigate('/colleges')}
                        className="text-purple-600 cursor-pointer hover:underline"
                    >
                        Colleges
                    </span>
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 shadow-sm min-h-[400px] flex items-center justify-center">
                <div className="max-w-2xl w-full space-y-8">

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-lg">To edit student database -</span>
                        <button
                            onClick={() => navigate(`/colleges/${id}/students`)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2 rounded-lg font-medium transition-colors w-40"
                        >
                            edit database
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-lg">To edit training calendar</span>
                        <button
                            onClick={() => navigate(`/colleges/${id}/schedule`)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2 rounded-lg font-medium transition-colors w-40"
                        >
                            edit schedule
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-lg">To edit assessment deadlines:</span>
                        <button
                            onClick={() => navigate(`/colleges/${id}/schedule?tab=deadlines`)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2 rounded-lg font-medium transition-colors w-40"
                        >
                            edit Deadlines
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditCollegeLanding;
