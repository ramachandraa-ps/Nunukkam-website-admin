# PRD vs Codebase Gap Analysis

## Nunukkam Admin Portal - Missing Functionalities

**Document Generated:** December 25, 2025
**Purpose:** Identify functionalities specified in PRD but missing or incomplete in the current codebase

---

## 1. COURSE MANAGEMENT

### 1.1 Create Course Section

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.1 | Empty state CTA "Create New Course" | ✅ Implemented | - |
| 1.2 | Course creation form with: Title, No of core skills selector, Select Core skills dropdown, Duration in days, Description | ⚠️ Partial | Missing "No of core skills" selector field - currently only has multi-select for core skills |
| 1.3 | On clicking course - display core skills as clickable tiles | ❌ Missing | Currently shows modules list, not core skills as tiles. PRD specifies core skills should appear as clickable tiles with design |
| 1.4 | Module management with table view (Sl no, modules, no of chapters, no of assessments, actions) | ⚠️ Partial | Table exists but missing "no of assessments" column in module listing |

### 1.2 Add Core Skills Section

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 2.1 | Empty state CTA "Add core skills" | ✅ Implemented | - |
| 2.2 | Core skill text input with CTA | ✅ Implemented | - |
| 2.3 | Table with columns: sno, core skill, course mapped to | ⚠️ Partial | Missing "course mapped to" column showing which course each core skill is linked to. Should show "not mapped" if unassigned |

### 1.3 Add Assessment Types Section

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 3.1 | Empty state CTA | ✅ Implemented | - |
| 3.2 | Form with: Assessment Type text input, Submission input dropdown (text input, radio buttons, checkboxes, video upload, picture upload) | ⚠️ Partial | Missing "Submission input" dropdown field specifying how students submit answers |
| 3.3 | List of added assessments with scroller | ✅ Implemented | - |

### 1.4 Add Chapters Section

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 4.1 | Empty state CTA "Add chapter" | ✅ Implemented | - |
| 4.2 | Chapter form with: Chapter name, Select skills dropdown, Upload PPT (ppt, pdf), Upload notes (ppt, pdf, word) | ❌ Missing | **Upload PPT** and **Upload Notes** file upload fields are NOT implemented |
| 4.3 | Assessment form with: Assessment kind (Pre-KBA, Post-KBA radio), Duration (hrs), Title, Assessment type dropdown, Skills dropdown, Passing cutoff (%), Proficiency definitions (Expert %, Intermediate %, Novice %) | ⚠️ Partial | Missing: **Pre-KBA/Post-KBA radio selection**, **Proficiency definitions (Expert/Intermediate/Novice percentages)** |
| 4.4 | MCQ Questions: Question, Options A-D, Correct Answer, Explanation | ⚠️ Partial | Missing **Explanation** field for MCQ questions |
| 4.5 | Non-MCQ Questions: Question stem, Rubric for grading, Rubric question, Scale definition (reflects as radio buttons on trainer portal) | ❌ Missing | **Rubric-based grading system** for non-MCQ questions not implemented. No rubric questions or scale definitions |
| 4.6 | "Add more" CTA to add more assessments | ✅ Implemented | - |
| 4.7 | Chapter table with: slno, chapter name, no of assessments, skills associated, actions | ⚠️ Partial | Table exists but verify all columns are present |

### 1.5 Add Skills Section

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 5.1 | Add skill text input, CTA, list with edit & delete | ✅ Implemented | - |

### 1.6 General Course Management Requirements

| Requirement | Status | Gap Description |
|-------------|--------|-----------------|
| Sort options for every list view | ❌ Missing | No sort functionality on list views (chapters, skills, core skills, etc.) |
| Warning when deleting mapped items: "Warning: skill mapped to an existing course" | ❌ Missing | No validation/warning when deleting skills, chapters, assessment types, or core skills that are mapped to existing courses |

---

## 2. PROGRAM MANAGEMENT

### 2.1 College Management

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.1 | Empty state CTA "Create new college" | ✅ Implemented | - |
| 1.2 | College form with: Name, University, City, State, Full address, Pincode, POC Name, POC Number, Program Coordinator dropdown | ⚠️ Partial | Missing **Pincode** field, **Full address** field. Program Coordinator dropdown may not be linked to user management employees |
| 1.3 | College table with: Slno, college name, university, POC name, POC number, program coordinator, City. CTA "Add students" per college | ⚠️ Partial | Missing **POC number** column and **Program Coordinator** column in table view |

### 2.2 Student Management

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.4 | Bulk upload with sample format download. Excel columns: Student name, Department, batch, college, university, batch start date, end date, trainer, course assigned, contact number, email ID | ⚠️ Partial | Bulk upload exists but verify sample format includes all specified columns (batch start/end dates, university) |
| 1.4 | Student table with: Slno, student name, batch, contact number, email ID, Course assigned, trainer name, batch start date, end date, Actions | ⚠️ Partial | Missing **batch start date** and **batch end date** columns in student table |
| 1.4 | Auto-create student user on file upload | ⚠️ Unverified | Need to verify student login credentials are auto-generated on bulk upload |
| 1.4 | Batch-wise filter dropdown | ✅ Implemented | - |

### 2.3 Schedule Sessions

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.5 | Training schedule bulk upload with sample download. Columns: Date, batch, chapter | ⚠️ Partial | Manual session creation exists, bulk upload may not be fully implemented |
| 1.5 | Assessment deadlines bulk upload with sample download. Columns: Assessment title, submission date | ⚠️ Partial | Assessment deadlines page exists but bulk upload functionality may be missing |
| 1.5 | Calendar view of schedules | ❌ Missing | No **calendar view** for session schedules - only list/table view |
| 1.5 | List of assessments underneath calendar with edit buttons | ⚠️ Partial | Assessment deadlines in separate page, not integrated with schedule view |

### 2.4 College Edit Options

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.6 | On clicking edit - 3 CTAs: Edit database, Edit schedule, Edit assessment deadlines | ❌ Missing | Currently single edit form. No separate CTAs for editing database vs schedule vs deadlines |

### 2.5 Data Validation

| Requirement | Status | Gap Description |
|-------------|--------|-----------------|
| Validate trainer name, course name, module name consistency | ❌ Missing | No validation for data consistency (e.g., "trainer does not exist" error) |
| Error file generation with highlighted error columns | ❌ Missing | No error file download with highlighted issues on bulk upload failures |
| Validate all rows with same batch have identical trainer/dates | ❌ Missing | No batch-level validation for trainer/date consistency |

---

## 3. USER MANAGEMENT

### 3.1 Add Users

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.1 | Empty state CTA "Add user" | ✅ Implemented | - |
| 1.2 | User form: Username, Designation dropdown, Role dropdown, Reporting manager dropdown, Phone number, Email ID | ⚠️ Partial | Missing **Reporting Manager** dropdown field |
| 1.3 | User table: slno, username, designation, reporting manager, user ID, role, actions | ⚠️ Partial | Missing **Reporting Manager** column. **User ID should be system generated** - verify implementation |
| 1.3 | Edit only allows changing designation and reporting manager | ❌ Missing | Currently all fields editable - should restrict to only designation and reporting manager |
| 1.3 | Filter by designation, role, or reporting manager | ⚠️ Partial | Role filter exists, missing **designation filter** and **reporting manager filter** |
| 1.3 | Bulk upload option for users | ❌ Missing | No bulk upload for users (PRD marks this as debatable) |

### 3.2 Add Designations

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.4 | Designation title text box, CTA, list with edit/delete | ✅ Implemented | - |

### 3.3 Add Roles

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.5 | Role title text box | ✅ Implemented | - |
| 1.5 | Access permission checkboxes for section-wise functions | ✅ Implemented | - |
| 1.5 | Role table: Slno, role, added by, added on, edit/delete actions | ⚠️ Partial | Missing **added by** and **added on** columns in roles table |

### 3.4 Deactivated Users

| FR No | PRD Requirement | Status | Gap Description |
|-------|-----------------|--------|-----------------|
| 1.6 | List of deactivated users with reactivate option | ✅ Implemented | - |

### 3.5 Deletion Warnings

| Requirement | Status | Gap Description |
|-------------|--------|-----------------|
| Warning when deleting role/designation mapped to user: "Warning: role mapped to an existing user" | ❌ Missing | No validation/warning when deleting roles or designations that are assigned to users |

---

## SUMMARY OF CRITICAL MISSING FEATURES

### High Priority (Core Functionality Gaps)

1. **Chapter Content Uploads** - PPT and Notes file upload functionality
2. **Proficiency Definitions** - Expert/Intermediate/Novice percentage thresholds for assessments
3. **Pre-KBA/Post-KBA Assessment Types** - Radio selection for assessment kind
4. **Rubric-based Grading** - For non-MCQ questions with scale definitions
5. **Calendar View** - For session schedules
6. **Reporting Manager** - Field in user management
7. **Course Mapped To** - Column in core skills showing course association

### Medium Priority (Enhancement Gaps)

8. **Sort Options** - On all list views
9. **Deletion Warnings** - For mapped items (skills, roles, designations, etc.)
10. **MCQ Explanation Field** - For question answers
11. **Bulk Upload Validation** - Error file generation with highlighted columns
12. **Data Consistency Checks** - Trainer/course name validation on bulk uploads
13. **College Edit Split** - Separate CTAs for database/schedule/deadlines editing
14. **Added By/Added On** - Audit columns in roles table

### Low Priority (Minor Gaps)

15. **No of Core Skills Selector** - In course creation form
16. **Pincode Field** - In college form
17. **Full Address Field** - In college form
18. **POC Number Column** - In college table
19. **Batch Start/End Date Columns** - In student table
20. **Designation Filter** - In user management
21. **Submission Input Type** - In assessment types

---

## RECOMMENDATIONS

1. **Phase 1** - Implement High Priority items as they affect core course delivery workflow
2. **Phase 2** - Add Medium Priority items for better user experience and data integrity
3. **Phase 3** - Complete Low Priority items for full PRD compliance

---

*This document should be updated as features are implemented.*
