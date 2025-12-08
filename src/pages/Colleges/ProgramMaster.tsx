import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProgramMaster: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/colleges/add')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-primary-500/30 flex items-center gap-2 text-lg"
                        >
                            <span>Create New College</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramMaster;
