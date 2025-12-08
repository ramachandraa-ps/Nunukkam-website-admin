// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
    return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/';

// ----------------------------------------------------------------------

export const PATHS = {
    ROOT: ROOTS_DASHBOARD,
    AUTH: {
        LOGIN: '/login',
        RESET_PASSWORD: '/reset-password',
    },
    DASHBOARD: {
        ROOT: '/dashboard',
        USERS: {
            ROOT: '/users',
            ADD: '/users/add',
            EDIT: (id: string) => `/users/edit/${id}`,
            ROLES: '/users/roles',
            DESIGNATIONS: '/users/designations',
            DEACTIVATED: '/users/deactivated',
        },
        COURSES: {
            ROOT: '/courses',
            CREATE: '/courses/create',
            EDIT: (id: string) => `/courses/edit/${id}`,
            CORE_SKILLS: '/courses/core-skills',
            SKILLS: '/courses/skills',
            ASSESSMENT_TYPES: '/courses/assessment-types',
            CHAPTERS: {
                ROOT: '/courses/chapters',
                ADD: '/courses/chapters/add',
                EDIT: (id: string) => `/courses/chapters/edit/${id}`,
                ADD_ASSESSMENT: (chapterId: string) => `/courses/chapters/${chapterId}/assessments/add`,
            },
            ASSESSMENTS: {
                EDIT: (chapterId: string, assessmentId: string) => `/courses/chapters/${chapterId}/assessments/${assessmentId}/edit`,
                QUESTIONS: (chapterId: string, assessmentId: string) => `/courses/chapters/${chapterId}/assessments/${assessmentId}/questions`,
            },
            MODULES: {
                ROOT: (courseId: string) => `/courses/${courseId}/modules`,
                ADD: (courseId: string) => `/courses/${courseId}/modules/add`,
            },
            COURSE_CORE_SKILLS: (courseId: string) => `/courses/${courseId}/core-skills`,
        },
        PROGRAM: {
            ROOT: '/colleges',
            MASTER: '/colleges/master',
            ADD: '/colleges/add',
            EDIT: (id: string) => `/colleges/edit/${id}`,
            STUDENTS: (collegeId: string) => `/colleges/${collegeId}/students`,
            SCHEDULE: (collegeId: string) => `/colleges/${collegeId}/schedule`,
        },
        REPORTS: '/reports',
        SETTINGS: '/settings',
        NOTIFICATIONS: '/notifications',
    },
};
