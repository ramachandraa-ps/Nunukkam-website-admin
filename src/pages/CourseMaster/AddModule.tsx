import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const AddModule: React.FC = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { courses, chapters, updateCourse, addToast } = useStore();
    const course = courses.find(c => c.id === courseId);

    const [title, setTitle] = useState('');
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!course) {
        return <div>Course not found</div>;
    }

    const toggleChapter = (chapterId: string) => {
        setSelectedChapters(prev =>
            prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        );
    };

    const getChapterName = (id: string) => chapters.find(c => c.id === id)?.name || id;

    const handleSubmit = () => {
        if (!title.trim()) return;

        const newModule = {
            id: Math.random().toString(36).substr(2, 9),
            title: title.trim(),
            chapters: selectedChapters,
            createdAt: new Date(),
        };

        const newModules = [...course.modules, newModule];
        updateCourse(course.id, { modules: newModules });
        addToast('success', 'Module created successfully');
        navigate(`/courses/${courseId}/modules`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(`/courses/${courseId}/modules`)} className="text-gray-500 hover:text-primary-700">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module</h1>
                    <p className="text-sm text-gray-500 mt-1">Add a new module to {course.title}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                    {/* Module Title */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Module Title:</label>
                        <div className="md:col-span-3">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter module title"
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* No of Chapters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">No of chapters:</label>
                        <div className="md:col-span-3">
                            <span className="text-xl font-bold text-primary-600">
                                {selectedChapters.length}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">(Auto-calculated based on selection)</span>
                        </div>
                    </div>

                    {/* Add Chapters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 pt-3">Add Chapters:</label>
                        <div className="md:col-span-3 relative">
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 cursor-pointer flex justify-between items-center hover:border-primary-500 transition-all"
                            >
                                <span className={selectedChapters.length === 0 ? "text-gray-400" : "text-gray-800 dark:text-white"}>
                                    {selectedChapters.length > 0
                                        ? `${selectedChapters.length} Selected`
                                        : 'Select chapters'}
                                </span>
                                <span className="material-symbols-outlined text-gray-400">arrow_drop_down</span>
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto p-2">
                                    {chapters.length === 0 ? (
                                        <p className="p-2 text-sm text-gray-500 text-center">No chapters available</p>
                                    ) : (
                                        chapters.map(chapter => (
                                            <div
                                                key={chapter.id}
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedChapters.includes(chapter.id) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                                                    {selectedChapters.includes(chapter.id) && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-200">{chapter.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Selected Tags Preview (Optional, for better UX) */}
                            {selectedChapters.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {selectedChapters.map(id => (
                                        <span key={id} className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                            {getChapterName(id)}
                                            <button onClick={() => toggleChapter(id)} className="hover:text-primary-900">
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="px-8 py-3 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 shadow-lg shadow-purple-200 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Create Module
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddModule;
