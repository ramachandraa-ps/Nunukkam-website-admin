import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage } from '../components/shared/Toast';

// Types
export interface CoreSkill {
  id: string;
  name: string;
  courseMappedTo: string[];
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface AssessmentType {
  id: string;
  name: string;
  submissionInput: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  rubric?: { question: string; scale: string }[];
  type: 'mcq' | 'non-mcq';
}

export interface Assessment {
  id: string;
  title: string;
  kind: 'Pre-KBA' | 'Post-KBA';
  duration: number;
  type: string;
  questionType: 'mcq' | 'non-mcq';
  skills: string[];
  passingCutoff: number;
  expertPercentage: number;
  intermediatePercentage: number;
  novicePercentage: number;
  questions: Question[];
}

export interface Chapter {
  id: string;
  name: string;
  skills: string[];
  pptFile?: string;
  notesFile?: string;
  assessments: Assessment[];
  createdAt: Date;
}

export interface Module {
  id: string;
  title: string;
  chapters: string[];
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coreSkills: string[];
  durationDays: number;
  modules: Module[];
  status: 'Draft' | 'Published';
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  role: string;
  reportingManager: string;
  status: 'active' | 'deactivated';
  createdAt: Date;
}

export interface Role {
  id: string;
  title: string;
  permissions: string[];
  addedBy: string;
  addedOn: Date;
}

export interface Designation {
  id: string;
  title: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  department: string;
  batch: string;
  contactNumber: string;
  email: string;
  courseAssigned: string;
  trainer: string;
  batchStartDate: Date;
  batchEndDate: Date;
}

export interface College {
  id: string;
  name: string;
  university: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  pocName: string;
  pocNumber: string;
  programCoordinator: string;
  students: Student[];
  schedules: { date: Date; batch: string; chapter: string }[];
  assessmentDeadlines: { title: string; submissionDate: Date }[];
  createdAt: Date;
}

interface StoreState {
  // Data
  courses: Course[];
  coreSkills: CoreSkill[];
  skills: Skill[];
  assessmentTypes: AssessmentType[];
  chapters: Chapter[];
  users: User[];
  roles: Role[];
  designations: Designation[];
  colleges: College[];

  // Toast
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Courses CRUD
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Core Skills CRUD
  addCoreSkill: (name: string) => void;
  updateCoreSkill: (id: string, name: string) => void;
  deleteCoreSkill: (id: string) => void;

  // Skills CRUD
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  // Assessment Types CRUD
  addAssessmentType: (assessmentType: Omit<AssessmentType, 'id' | 'createdAt'>) => void;
  updateAssessmentType: (id: string, assessmentType: Partial<AssessmentType>) => void;
  deleteAssessmentType: (id: string) => void;

  // Chapters CRUD
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt'>) => void;
  updateChapter: (id: string, chapter: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;

  // Users CRUD
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'status'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  reactivateUser: (id: string) => void;

  // Roles CRUD
  addRole: (role: Omit<Role, 'id' | 'addedOn'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => void;

  // Designations CRUD
  addDesignation: (title: string) => void;
  updateDesignation: (id: string, title: string) => void;
  deleteDesignation: (id: string) => void;

  // Colleges CRUD
  addCollege: (college: Omit<College, 'id' | 'createdAt' | 'students' | 'schedules' | 'assessmentDeadlines'>) => void;
  updateCollege: (id: string, college: Partial<College>) => void;
  deleteCollege: (id: string) => void;
  addStudentToCollege: (collegeId: string, student: Omit<Student, 'id'>) => void;
  updateStudent: (collegeId: string, studentId: string, student: Partial<Student>) => void;
  deleteStudent: (collegeId: string, studentId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial Data
const initialCoreSkills: CoreSkill[] = [
  { id: '1', name: 'Communication', courseMappedTo: ['1'], createdAt: new Date() },
  { id: '2', name: 'Leadership', courseMappedTo: [], createdAt: new Date() },
  { id: '3', name: 'Problem Solving', courseMappedTo: ['1'], createdAt: new Date() },
];

const initialSkills: Skill[] = [
  { id: '1', name: 'Public Speaking', description: 'Ability to speak in front of audience', createdAt: new Date() },
  { id: '2', name: 'Written Communication', description: 'Clear written expression', createdAt: new Date() },
  { id: '3', name: 'Active Listening', description: 'Understanding others effectively', createdAt: new Date() },
];

const initialAssessmentTypes: AssessmentType[] = [
  { id: '1', name: 'Multiple Choice Questions', submissionInput: 'Radio Buttons', createdAt: new Date() },
  { id: '2', name: 'Video Presentation', submissionInput: 'Video Upload', createdAt: new Date() },
  { id: '3', name: 'Written Essay', submissionInput: 'Text Input', createdAt: new Date() },
];

const initialChapters: Chapter[] = [
  { id: '1', name: 'Introduction to Communication', skills: ['1', '3'], assessments: [], createdAt: new Date() },
  { id: '2', name: 'Non-verbal Communication', skills: ['1'], assessments: [], createdAt: new Date() },
];

const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Soft Skills Development',
    description: 'Comprehensive course on developing essential soft skills for career growth',
    coreSkills: ['1', '3'],
    durationDays: 30,
    modules: [
      { id: 'm1', title: 'Communication Basics', chapters: ['1', '2'], createdAt: new Date() },
    ],
    status: 'Published',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Leadership Excellence',
    description: 'Master leadership skills to lead teams effectively',
    coreSkills: ['2'],
    durationDays: 45,
    modules: [],
    status: 'Draft',
    createdAt: new Date(),
  },
];

const initialDesignations: Designation[] = [
  { id: '1', title: 'Software Engineer', createdAt: new Date() },
  { id: '2', title: 'UX Designer', createdAt: new Date() },
  { id: '3', title: 'Product Manager', createdAt: new Date() },
  { id: '4', title: 'Trainer', createdAt: new Date() },
  { id: '5', title: 'Program Coordinator', createdAt: new Date() },
];

const initialRoles: Role[] = [
  { id: '1', title: 'Admin', permissions: ['all'], addedBy: 'System', addedOn: new Date() },
  { id: '2', title: 'Trainer', permissions: ['courses.view', 'students.view', 'assessments.grade'], addedBy: 'Admin', addedOn: new Date() },
];

const initialUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@nunukkam.com', phone: '9876543210', designation: 'Software Engineer', role: 'Admin', reportingManager: 'N/A', status: 'active', createdAt: new Date() },
  { id: '2', name: 'Alice Johnson', email: 'alice@nunukkam.com', phone: '9876543211', designation: 'Trainer', role: 'Trainer', reportingManager: 'John Doe', status: 'active', createdAt: new Date() },
  { id: '3', name: 'Bob Williams', email: 'bob@nunukkam.com', phone: '9876543212', designation: 'Trainer', role: 'Trainer', reportingManager: 'John Doe', status: 'active', createdAt: new Date() },
];

const initialColleges: College[] = [
  {
    id: '1',
    name: 'Global Institute of Technology',
    university: 'Anna University',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '123 Main Street, Velachery',
    pincode: '600042',
    pocName: 'Dr. Anitha Selvan',
    pocNumber: '9876543210',
    programCoordinator: 'Bob Williams',
    students: [
      { id: 's1', name: 'Rahul Kumar', department: 'CSE', batch: 'Batch A', contactNumber: '9876543213', email: 'rahul@email.com', courseAssigned: 'Soft Skills Development', trainer: 'Alice Johnson', batchStartDate: new Date('2024-01-15'), batchEndDate: new Date('2024-02-15') },
      { id: 's2', name: 'Priya Sharma', department: 'ECE', batch: 'Batch A', contactNumber: '9876543214', email: 'priya@email.com', courseAssigned: 'Soft Skills Development', trainer: 'Alice Johnson', batchStartDate: new Date('2024-01-15'), batchEndDate: new Date('2024-02-15') },
    ],
    schedules: [
      { date: new Date('2024-01-16'), batch: 'Batch A', chapter: 'Introduction to Communication' },
      { date: new Date('2024-01-18'), batch: 'Batch A', chapter: 'Non-verbal Communication' },
    ],
    assessmentDeadlines: [
      { title: 'Communication Assessment 1', submissionDate: new Date('2024-01-25') },
    ],
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'National College of Arts',
    university: 'Bharathiar University',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '456 College Road, RS Puram',
    pincode: '641002',
    pocName: 'Mr. Suresh Menon',
    pocNumber: '9876543220',
    programCoordinator: 'Bob Williams',
    students: [],
    schedules: [],
    assessmentDeadlines: [],
    createdAt: new Date(),
  },
];

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [coreSkills, setCoreSkills] = useState<CoreSkill[]>(initialCoreSkills);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>(initialAssessmentTypes);
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [designations, setDesignations] = useState<Designation[]>(initialDesignations);
  const [colleges, setColleges] = useState<College[]>(initialColleges);

  // Toast functions
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Course CRUD
  const addCourse = useCallback((course: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse = { ...course, id: generateId(), createdAt: new Date() };
    setCourses((prev) => [...prev, newCourse]);
    addToast('success', 'Course created successfully');
  }, [addToast]);

  const updateCourse = useCallback((id: string, course: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...course } : c)));
    addToast('success', 'Course updated successfully');
  }, [addToast]);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    addToast('success', 'Course deleted successfully');
  }, [addToast]);

  // Core Skills CRUD
  const addCoreSkill = useCallback((name: string) => {
    const newSkill = { id: generateId(), name, courseMappedTo: [], createdAt: new Date() };
    setCoreSkills((prev) => [...prev, newSkill]);
    addToast('success', 'Core skill added successfully');
  }, [addToast]);

  const updateCoreSkill = useCallback((id: string, name: string) => {
    setCoreSkills((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    addToast('success', 'Core skill updated successfully');
  }, [addToast]);

  const deleteCoreSkill = useCallback((id: string) => {
    const skill = coreSkills.find((s) => s.id === id);
    if (skill && skill.courseMappedTo.length > 0) {
      addToast('warning', 'Warning: Core skill is mapped to an existing course');
      return;
    }
    setCoreSkills((prev) => prev.filter((s) => s.id !== id));
    addToast('success', 'Core skill deleted successfully');
  }, [addToast, coreSkills]);

  // Skills CRUD
  const addSkill = useCallback((skill: Omit<Skill, 'id' | 'createdAt'>) => {
    const newSkill = { ...skill, id: generateId(), createdAt: new Date() };
    setSkills((prev) => [...prev, newSkill]);
    addToast('success', 'Skill added successfully');
  }, [addToast]);

  const updateSkill = useCallback((id: string, skill: Partial<Skill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...skill } : s)));
    addToast('success', 'Skill updated successfully');
  }, [addToast]);

  const deleteSkill = useCallback((id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    addToast('success', 'Skill deleted successfully');
  }, [addToast]);

  // Assessment Types CRUD
  const addAssessmentType = useCallback((assessmentType: Omit<AssessmentType, 'id' | 'createdAt'>) => {
    const newType = { ...assessmentType, id: generateId(), createdAt: new Date() };
    setAssessmentTypes((prev) => [...prev, newType]);
    addToast('success', 'Assessment type added successfully');
  }, [addToast]);

  const updateAssessmentType = useCallback((id: string, assessmentType: Partial<AssessmentType>) => {
    setAssessmentTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...assessmentType } : t)));
    addToast('success', 'Assessment type updated successfully');
  }, [addToast]);

  const deleteAssessmentType = useCallback((id: string) => {
    setAssessmentTypes((prev) => prev.filter((t) => t.id !== id));
    addToast('success', 'Assessment type deleted successfully');
  }, [addToast]);

  // Chapters CRUD
  const addChapter = useCallback((chapter: Omit<Chapter, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newChapter = { ...chapter, id, createdAt: new Date() };
    setChapters((prev) => [...prev, newChapter]);
    addToast('success', 'Chapter added successfully');
    return id; // Return ID for navigation
  }, [addToast]);

  const updateChapter = useCallback((id: string, chapter: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...chapter } : c)));
    addToast('success', 'Chapter updated successfully');
  }, [addToast]);

  const deleteChapter = useCallback((id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
    addToast('success', 'Chapter deleted successfully');
  }, [addToast]);

  // Users CRUD
  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt' | 'status'>) => {
    const newUser = { ...user, id: generateId(), createdAt: new Date(), status: 'active' as const };
    setUsers((prev) => [...prev, newUser]);
    addToast('success', 'User added successfully');
  }, [addToast]);

  const updateUser = useCallback((id: string, user: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));
    addToast('success', 'User updated successfully');
  }, [addToast]);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'deactivated' } : u)));
    addToast('success', 'User deactivated successfully');
  }, [addToast]);

  const reactivateUser = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u)));
    addToast('success', 'User reactivated successfully');
  }, [addToast]);

  // Roles CRUD
  const addRole = useCallback((role: Omit<Role, 'id' | 'addedOn'>) => {
    const newRole = { ...role, id: generateId(), addedOn: new Date() };
    setRoles((prev) => [...prev, newRole]);
    addToast('success', 'Role added successfully');
  }, [addToast]);

  const updateRole = useCallback((id: string, role: Partial<Role>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...role } : r)));
    addToast('success', 'Role updated successfully');
  }, [addToast]);

  const deleteRole = useCallback((id: string) => {
    const role = roles.find((r) => r.id === id);
    const usersWithRole = users.filter((u) => u.role === role?.title);
    if (usersWithRole.length > 0) {
      addToast('warning', 'Warning: Role is mapped to an existing user');
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== id));
    addToast('success', 'Role deleted successfully');
  }, [addToast, roles, users]);

  // Designations CRUD
  const addDesignation = useCallback((title: string) => {
    const newDesignation = { id: generateId(), title, createdAt: new Date() };
    setDesignations((prev) => [...prev, newDesignation]);
    addToast('success', 'Designation added successfully');
  }, [addToast]);

  const updateDesignation = useCallback((id: string, title: string) => {
    setDesignations((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)));
    addToast('success', 'Designation updated successfully');
  }, [addToast]);

  const deleteDesignation = useCallback((id: string) => {
    const designation = designations.find((d) => d.id === id);
    const usersWithDesignation = users.filter((u) => u.designation === designation?.title);
    if (usersWithDesignation.length > 0) {
      addToast('warning', 'Warning: Designation is mapped to an existing user');
      return;
    }
    setDesignations((prev) => prev.filter((d) => d.id !== id));
    addToast('success', 'Designation deleted successfully');
  }, [addToast, designations, users]);

  // Colleges CRUD
  const addCollege = useCallback((college: Omit<College, 'id' | 'createdAt' | 'students' | 'schedules' | 'assessmentDeadlines'>) => {
    const newCollege = { ...college, id: generateId(), createdAt: new Date(), students: [], schedules: [], assessmentDeadlines: [] };
    setColleges((prev) => [...prev, newCollege]);
    addToast('success', 'College added successfully');
  }, [addToast]);

  const updateCollege = useCallback((id: string, college: Partial<College>) => {
    setColleges((prev) => prev.map((c) => (c.id === id ? { ...c, ...college } : c)));
    addToast('success', 'College updated successfully');
  }, [addToast]);

  const deleteCollege = useCallback((id: string) => {
    setColleges((prev) => prev.filter((c) => c.id !== id));
    addToast('success', 'College deleted successfully');
  }, [addToast]);

  const addStudentToCollege = useCallback((collegeId: string, student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: generateId() };
    setColleges((prev) => prev.map((c) => (c.id === collegeId ? { ...c, students: [...c.students, newStudent] } : c)));
    addToast('success', 'Student added successfully');
  }, [addToast]);

  const updateStudent = useCallback((collegeId: string, studentId: string, student: Partial<Student>) => {
    setColleges((prev) => prev.map((c) => {
      if (c.id === collegeId) {
        return { ...c, students: c.students.map((s) => (s.id === studentId ? { ...s, ...student } : s)) };
      }
      return c;
    }));
    addToast('success', 'Student updated successfully');
  }, [addToast]);

  const deleteStudent = useCallback((collegeId: string, studentId: string) => {
    setColleges((prev) => prev.map((c) => {
      if (c.id === collegeId) {
        return { ...c, students: c.students.filter((s) => s.id !== studentId) };
      }
      return c;
    }));
    addToast('success', 'Student deleted successfully');
  }, [addToast]);

  const value: StoreState = {
    courses,
    coreSkills,
    skills,
    assessmentTypes,
    chapters,
    users,
    roles,
    designations,
    colleges,
    toasts,
    addToast,
    removeToast,
    addCourse,
    updateCourse,
    deleteCourse,
    addCoreSkill,
    updateCoreSkill,
    deleteCoreSkill,
    addSkill,
    updateSkill,
    deleteSkill,
    addAssessmentType,
    updateAssessmentType,
    deleteAssessmentType,
    addChapter,
    updateChapter,
    deleteChapter,
    addUser,
    updateUser,
    deleteUser,
    reactivateUser,
    addRole,
    updateRole,
    deleteRole,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    addCollege,
    updateCollege,
    deleteCollege,
    addStudentToCollege,
    updateStudent,
    deleteStudent,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
