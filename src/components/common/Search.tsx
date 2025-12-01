import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    category: 'course' | 'user' | 'college' | 'chapter' | 'skill';
    icon: string;
    path: string;
}

const Search: React.FC = () => {
    const navigate = useNavigate();
    const { courses, users, colleges, chapters, skills } = useStore();
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search functionality
    const searchResults = useMemo<SearchResult[]>(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // Search courses
        courses.forEach(course => {
            if (course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query)) {
                results.push({
                    id: course.id,
                    title: course.title,
                    subtitle: `Course - ${course.status}`,
                    category: 'course',
                    icon: 'auto_stories',
                    path: `/courses/edit/${course.id}`,
                });
            }
        });

        // Search users
        users.filter(u => u.status === 'active').forEach(user => {
            if (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) {
                results.push({
                    id: user.id,
                    title: user.name,
                    subtitle: `${user.role} - ${user.designation}`,
                    category: 'user',
                    icon: 'person',
                    path: `/users/edit/${user.id}`,
                });
            }
        });

        // Search colleges
        colleges.forEach(college => {
            if (college.name.toLowerCase().includes(query) || college.city.toLowerCase().includes(query)) {
                results.push({
                    id: college.id,
                    title: college.name,
                    subtitle: `${college.city}, ${college.state}`,
                    category: 'college',
                    icon: 'school',
                    path: `/colleges/edit/${college.id}`,
                });
            }
        });

        // Search chapters
        chapters.forEach(chapter => {
            if (chapter.name.toLowerCase().includes(query)) {
                results.push({
                    id: chapter.id,
                    title: chapter.name,
                    subtitle: 'Chapter',
                    category: 'chapter',
                    icon: 'menu_book',
                    path: `/courses/chapters/edit/${chapter.id}`,
                });
            }
        });

        // Search skills
        skills.forEach(skill => {
            if (skill.name.toLowerCase().includes(query)) {
                results.push({
                    id: skill.id,
                    title: skill.name,
                    subtitle: skill.description || 'Skill',
                    category: 'skill',
                    icon: 'psychology',
                    path: '/courses/skills',
                });
            }
        });

        return results.slice(0, 8); // Limit to 8 results
    }, [searchQuery, courses, users, colleges, chapters, skills]);

    const handleSearchSelect = (result: SearchResult) => {
        navigate(result.path);
        setSearchQuery('');
        setShowSearchResults(false);
        setIsSearchExpanded(false);
    };

    const getCategoryColor = (category: SearchResult['category']) => {
        switch (category) {
            case 'course': return 'bg-purple-100 text-purple-700';
            case 'user': return 'bg-blue-100 text-blue-700';
            case 'college': return 'bg-green-100 text-green-700';
            case 'chapter': return 'bg-yellow-100 text-yellow-700';
            case 'skill': return 'bg-pink-100 text-pink-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div ref={searchRef} className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full md:w-80' : 'w-10'}`}>
            <div className={`
          flex items-center rounded-lg overflow-hidden
          ${isSearchExpanded ? 'bg-gray-50 border border-gray-200' : 'bg-transparent'}
      `}>
                <button
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="p-2.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                    <span className="material-symbols-outlined">search</span>
                </button>
                <input
                    type="text"
                    placeholder="Search courses, users, colleges..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(true);
                    }}
                    onFocus={() => {
                        setIsSearchExpanded(true);
                        if (searchQuery) setShowSearchResults(true);
                    }}
                    className={`
            bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 w-full pr-3 py-2
            ${isSearchExpanded ? 'block' : 'hidden'}
          `}
                />
                {searchQuery && isSearchExpanded && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setShowSearchResults(false);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && isSearchExpanded && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchResults.length === 0 ? (
                        <div className="p-4 text-center">
                            <span className="material-symbols-outlined text-3xl text-gray-300 mb-2 block">search_off</span>
                            <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {searchResults.map((result) => (
                                <button
                                    key={`${result.category}-${result.id}`}
                                    onClick={() => handleSearchSelect(result)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(result.category)}`}>
                                        <span className="material-symbols-outlined">{result.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getCategoryColor(result.category)}`}>
                                        {result.category}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
