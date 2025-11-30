# Course Management

Course Management: ( [https://whimsical.com/course-management-D9xFe4fo1LCYN4wTbS6kXQ](https://whimsical.com/course-management-D9xFe4fo1LCYN4wTbS6kXQ) )

In this section the admin must be able to create/edit/update and delete courses and the subsequent elements of the course.

# **Flow:**

Create Course→ Create Core Skil→ Create Modules→ Create Chapters→ Upload PPT→ Upload notes→ Add assessments→ Add scoring logic→ Add associated skills.

# **Definitions:**

**Course-** A set of pillars which are designed to accomplish an outcome.  
**Core Skill-** An umbrella of various skills of the same nature.  
**Module-** A set of chapters which are designed to help the student learn a particular skill.  
**Chapter-** An individual chapter which focuses on helping the student learn all the subskills to make up for a skill.  
**Assessments-** A test either text, video, audio or MCQs designed to assess the student’s competency levels.

#  **Create Course:**

| FR no | Requirement Description |
| ----- | ----- |
| 1.1 | On the landing page in empty state- there will be CTA\_ Create New course. Course master → Add core skills, Add assessment types, add chapters, add skills. Bread crumb- Coursemanager→ Courses  |
| 1.2 | On clicking create a new course, the user will have to fill a form. Course title- Text input No of core skills- Selector Select Core skills-\> Drop down (defined in add core skills section) Course duration in days-\> Selector Course description- text input CTA- create course All the fields must be mandatory. Outcome- Created new course will be a clickable tile on the landing page. Landing page will continue to have CTA create new course |
| 1.3 | \-On clicking on the course- The core skills will be displayed. These are obtained from the tagging done in the previous step. \- Core skills appear as clickable tiles again. \- The tile must have a design. \- Bread Crumb- Course management→ Courses→ Core Skills |
| 1.4 | Onclicking the module tile- On empty state- the user will have the CTA\_ Add modules. On clicking add modules- User will have to fill a form.  Form fields are as follows: A. Module Title \- Text input B. No of chapters- Selector C- Add chapters- Drop down (defined later in the add chapters section) CTA- create module Breadcrumb- Course Management⟶ Courses⟶ Core Skills⟶ Modules After adding modules, on clicking the module tile- users will see a table. Table columns- Sl no, modules, no of chapters, no of assessments, actions. Actions include edit and delete options. CTA- Add more modules  |

# **Add core skills:**

Functionality- Create core skills to be mapped under the courses.

| FR no | Requirement Description |
| ----- | ----- |
| 2.1  | On clicking add core skills- on empty state- CTA- add core skills Breadcrumb- Course Management-\> Core Skills |
| 2.2 | On clicking add core skills user will be directed to the core skills page. Enter core skill- text input CTA \- Add core skilll |
| 2.3 | Every added core skill will reflect below the text input button in a table. Table columns- sno, core skill, coure mapped to. If the core skill is not mapped to any core skill yet- display not mapped in the course mapped to section. As soon as the course is mapped under the create course section. The data should reflect here. |

# **Add assessment types:**

Functionality- Only add the various assessment types to be used in the courses. The input given here will be used in add chapters page.

| FR no | Requirement Description |
| ----- | ----- |
| 3.1 | On empty state- CTA\_ add assessment types Breadcrumb- Course master→ Add  Assessments |
| 3.2 | On clicking add assessments the user must fill the form. Assessment Type- text input Submission input- drop down. Dropdown options- text input, radio buttons,check boxes, video upload, picture upload CTA- Add assessment type. Breadcrumbs- Course master→ Add  Assessments Drop down options can be hardcoded for now.  |
| 3.3 | List of added assessments to be displayed beneath the form. With a scroller if applicable |

# **Add chapters:**

Functionality- define the chapters- content and the assessments to be mapped to the modules in the create course section.

| FR no | Requirement Description |
| ----- | ----- |
| 4.1  | On empty state- CTA- add chapter. Breadcrumb- Course master→ Add chapters |
| 4.2 | On clicking add chapters- user must again fill a form. Form fields are as follows: A. Chapter name- text input B. Select skills- Dropdown (list defined in the add skills section) C. Upload PPT- file upload (ppt, pdf) D. Upload notes- notes upload (ppt,pdf, word) CTA- Add assessments  |
| 4.3 | On clicking add assessments- user will be taken to the add assessment page.  Assessment 1- will be the default option. The user will have to fill a form.  The form fields are as follows: Assessment kind: radio buttons (Pre-KBA, Post- KBA) Add duration (in hrs): text input Title : text input Assessment type: Dropdown (defined in the add assessments section) Skills: dropdown (as defined in the add skills section) Passing cutoff (%)- Number input Proficiency definition: Expert (%)- Number input Intermediate(%)- number input Novice (%)- number input CTA- Add questions The sure cannot submit the assessment without adding questions in it. On clicking add assessments- the flow should be different for MCQ and non MCQ questions. Breadcrumbs-Course master→ Add chapters⟶Add Assessments. |
| 4.4 | For MCQs: Bread crumbs- Course master→ Add chapters⟶ Add Asessments→ Add Questions 7 textboxes Question Option A Option B Option C Option D Correct Answer Explanation CTA- Add next question Final CTA- Add assessment |
| 4.5 | For non MCQs Same breadcrumb as above Fields Question stem Rubric for grading Rubric question Scale definition(this scale will reflect as radio buttons on the trainer portal for the trainers to grade the assessment) CTA- Add next question Final CTA- add assessment |
| 4.6 | After adding the assessment, user will go back to page **Course master→ Add chapters⟶Add Assessments**  and click submit. On this page ther will be CTA: Add more to add assessments if needed. On clicking submit- The chapter will be created. |
| 4.7 | After adding the first chaper- the landing page will have a table. Columns- slno, chapter name, no of assessments, skills associated, actions Edit button against each chapter. On clicking edit the user will go back to the add chapter form, |

 

# **Add skill:**

Functionality- This is a repository of skills along with their definitions in the system.

| FR no | Requirement Description |
| ----- | ----- |
| 5.1 | On clicking add skills- The user will add the skills and view the already added skills. Add skill- Text input CTA Add skill List of skills added to be displayed below with an edit & Delete option. |

**Sort options to be provided for every list view**

**If the user tries to delete a skill, chapter, assessment type or core skill mapped to a an existing course throw the error message in the template- “ Warning: skill mapped to an existing course”**

# Program Management

Program Management: ( [https://whimsical.com/program-management-RdsicZGMTXuTkgmZyVwA6B](https://whimsical.com/program-management-RdsicZGMTXuTkgmZyVwA6B) )

In this section the admin must be able to create/edit/update and delete colleges and students under the college.

| FR no | Requirement Description |
| ----- | ----- |
| 1.1 | On clicking program management- on empty state the landing page will have only one CTA- Create new college. Breadcrumb- Program Management⟶ Colleges   |
| 1.2 | On clicking create new college- The user will have to fill a form. Form fields are as follows: A. Name of the college- Text input B. Affiliated university- Text input C. City- text input D. State- text input E. Full address- text input F. Pincode- text input G. POC Name- text input H- POC number- Phone number input I- Program Coordinator- Dropdown. (List of employees added in the user management section) CTA- create college |
| 1.3 | Once a college is created, Add college landing page/ program management to be the list of colleges in a table format. Table columns include- Slno, college name, university, POC name, POC number, program coordinator, City CTA button per college- Add students. An edit button against each college. The edit button will lead to the college form.  |
| 1.4  | On clicking add students Program Management⟶ Colleges⟶VIT  \- Breadcrumbs Upload student data base- CTA- Bulk upload A download button with legend- (Download sample format) The format is an Excel format. The user will enter the data in the given format to upload the data. Sample excel columns- Student name, Department, batch(for nunukkam sessions as per the college’s alignment), college, university, batch start date, end date, trainer (will be created under the user management section), course assigned (as per the course name in the course management section), contact number, email ID. On bulk uploading , the student will display beneath in a table. Table columns- Slno, studen’s name, batch, contact number and email ID, Course assigned, trainer name, batch start date, end date. Actions.  Actions include edit and delete. CTA-  add student (to add leftover students after the bulk upload is done or mid course enrollments) CTA-  schedule session- schedule the sessions for this college. A batch wise filter dropdown option on top of the page. The student user will be auto created on uploading the file. |
| 1.5 | On clicking schedule sessions-  Upload training schedule-: Bulk upload button A download button with legend- download sample Sample format will be an excel sheet where the user must add the schedule and upload here. Columns in the sample format- Date, batch, chapter.  This input must be used for attendance and schedules. Upload assessments: Bulk upload button A download button with legend- Download sample Sample format will again be in excel sheet. Columns in sample format- Assessment title, submission date This must considered for the deadlines for assessments in the student portal. Once uploaded- there must be a calendar view of the schedules and the list of assessments underneath. With edit buttons to edit the schedule/ assessment deadlines if need be. |
| 1.6 | On clicking edit button for a college. The landing page will have 3 CTAs Edit database Edit schedule Edit assessment deadlines They must directed to the respective pages as per the direction given on whimsicals. |

If there is any information like the trainer name, course name, module name, anything that is defined in the admin portal- if there is any inconsistency like name mismatch- system must throw an error message- “ Data inconsistent (or) format mismatch (or) trainer does not exist and give an error file to the user to cross-verify. The error should have the column with the error highlighted.  
System validates all rows with same batch name must have identical trainer/dates, throws error if not

# User Management

User management: ( [https://whimsical.com/user-management-VyLgxicXDv25Fq2VJpwbuD](https://whimsical.com/user-management-VyLgxicXDv25Fq2VJpwbuD) )

In this section the admin must be able to create/edit/update and delete users and their access in nunukkam’s systems

User master:  
Add users  
Add roles  
Add designations  
Deactivated users

| FR no | Requirement Description |
| ----- | ----- |
| 1.1 | This will be default landing page on clicking user management Breadcrumbs- User management→ Add users On empty state- CTA- Add user |
| 1.2 | On clicking add user the admin will have to fill the form. Form fields are as follows User name- text input Designations- dropdown (defined in the add designations section) Role- drop down (defined in the add designations section) Reporting manager- dropdown- pick from the existing list of users ( In case no users, NA) Phone number- number input Email ID CTA- Add user |
| 1.3 | Once a user is added, the landing page will have user list in a table Table columns- slno , user name, designation, reporting manager, user ID- role, actions.  Actions include edit and delete On editing admin can edit only the designation and the reporting manager. User ID should be system generated On clicking delete, the user will be moved to the deactivated users. A filter with a dropdown to filter designation wise, role wise or reporting manager wise here. **A bulk upload option- Let’s debate on this if it is essential.** |
| 1.4 | On clicking add designations A text box for “Designation title” CTA- add designation List of added designations to be displayed below with edit and delete options. |
| 1.5 | On clicking add role A text box for “role title” Access permission: There should be a check box of section wise functions for the user to select what to display to whom here. CTA Add role. On clicking add role- the user can see a table Table columns- Slno role, added by, added on- edit and delete actions On clicking edit- the user can add/remove permissions. |
| 1.6 | On clicking deactivated users The admin can see the list of deactivated users with a reactivate option. |

**If the user tries to delete a role ,designation \-“ Warning: role mapped to an existing user”**

