import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { courses, colleges, chapters } = useStore();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on dashboard - REMOVED per requirement to show "Dashboard" title
    // if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    //     return null; 
    // }

    // If we are on dashboard, ensure "Dashboard" is in the pathnames or handled
    const isDashboard = pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard');
    const displayPathnames = isDashboard ? ['dashboard'] : pathnames;

    const resolveBreadcrumb = (name: string, index: number, pathArray: string[]) => {
        const fullPath = `/${pathArray.slice(0, index + 1).join('/')}`;
        const parentPath = `/${pathArray.slice(0, index).join('/')}`;

        // 1. Check if it's an entity ID
        const course = courses.find(c => c.id === name);
        if (course) return { name: course.title, path: `/courses/${course.id}/core-skills`, isClickable: true };

        const college = colleges.find(c => c.id === name);
        if (college) return { name: college.name, path: `/colleges/${college.id}/students`, isClickable: true };

        const chapter = chapters.find(c => c.id === name);
        if (chapter) return { name: chapter.name, path: `/courses/chapters/edit/${chapter.id}`, isClickable: true };

        const assessment = chapters.flatMap(c => c.assessments).find(a => a.id === name);
        if (assessment) {
            // Robust check: get chapter ID from URL if possible, otherwise search store
            let chapterId = pathnames[pathnames.indexOf('chapters') + 1];
            if (!chapterId || chapterId === 'add' || chapterId === 'edit') {
                const parentChapter = chapters.find(c => c.assessments.some(a => a.id === assessment.id));
                chapterId = parentChapter?.id || '';
            }

            if (chapterId) {
                return { name: assessment.title, path: `/courses/chapters/${chapterId}/assessments/${assessment.id}/edit`, isClickable: true };
            }
            // Fallback if chapter not found but assessment exists (rare)
            return { name: assessment.title, path: ``, isClickable: false };
        }

        // 2. URL-based Fallback for IDs when Store is empty (e.g. after reload)
        // If the *current* segment looks like an ID (long string) but wasn't found in store
        if (name.length > 5 && !['dashboard', 'courses', 'colleges', 'chapters', 'assessments', 'questions', 'users', 'add', 'edit'].includes(name)) {
            // Heuristic: Check context from previous segment
            const prevSegment = pathnames[index - 1];
            if (prevSegment === 'chapters') {
                return { name: 'Chapter', path: fullPath.replace('edit/', ''), isClickable: false }; // Can't easily link to edit without ID if URL is weird, but usually fullPath is fine.
            }
            if (prevSegment === 'assessments') {
                // If we are here, we likely have a structure like .../assessments/:id/...
                // Try to reconstruct edit path if we are deeper (like on questions page)
                if (pathnames.includes('questions')) {
                    // We are on questions page, this ID segment should link to edit
                    // Need chapter ID.
                    const chapterIdIndex = pathnames.indexOf('chapters');
                    if (chapterIdIndex !== -1 && pathnames.length > chapterIdIndex + 1) {
                        const chapterId = pathnames[chapterIdIndex + 1];
                        return { name: 'Assessment', path: `/courses/chapters/${chapterId}/assessments/${name}/edit`, isClickable: true };
                    }
                }
                return { name: 'Assessment', path: ``, isClickable: false };
            }
        }

        // 3. Formatting common static routes
        let formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Manual interactions or "Smart" redirections for static paths if needed
        let pathToUse = fullPath;
        let isClickable = true;

        const nonClickableSegments = ['edit', 'add', 'assessments', 'questions', 'modules'];
        if (nonClickableSegments.includes(name.toLowerCase())) {
            isClickable = false;
        }

        // Parent specific overrides
        if (parentPath === '/courses' && name === 'chapters') {
            formattedName = "Chapters";
        }

        return { name: formattedName, path: pathToUse, isClickable };
    };

    return (
        <div className="flex items-center space-x-2 text-sm">
            <span
                className="text-gray-500 hover:text-primary-700 cursor-pointer flex items-center gap-1 transition-colors"
                onClick={() => navigate('/dashboard')}
            >
                <span className="material-symbols-outlined text-lg">home</span>
                Home
            </span>
            {displayPathnames.map((name, index) => {
                const { name: displayName, path, isClickable } = resolveBreadcrumb(name, index, displayPathnames);
                const isLast = index === displayPathnames.length - 1;

                return (
                    <React.Fragment key={index}>
                        <span className="text-gray-300">/</span>
                        <span
                            className={`
                                transition-colors
                                ${isLast
                                    ? 'text-gray-900 font-semibold'
                                    : isClickable
                                        ? 'text-gray-500 hover:text-primary-700 cursor-pointer font-medium'
                                        : 'text-gray-400 cursor-default'}
                            `}
                            onClick={() => {
                                if (!isLast && isClickable && path) {
                                    navigate(path);
                                }
                            }}
                        >
                            {displayName}
                        </span>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Breadcrumbs;
