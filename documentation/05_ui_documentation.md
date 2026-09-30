# 5. UI & Component Breakdown

The User Interface (UI) of XAMS features clean design guidelines with dark-mode support, micro-animations (transitions, hover effects), and fluid responsive adjustments for desktop, tablet, and mobile displays.

---

## 5.1 Shared & Layout Components

### 1. Sidebar (`Sidebar.tsx`)
* **Purpose**: Serves as the primary navigation bar. Lists paths based on roles.
* **Responsive Control**: Uses conditional Tailwind styles (`md:translate-x-0 -translate-x-full`) controlled by a state toggle. It slides out on mobile viewports.
* **Elements**: Features logo, list of links with Lucide icon markers, and a Logout button at the base.

### 2. Header (`Header.tsx`)
* **Purpose**: Renders the context header bar at the top of the screens.
* **Features**: Hamburger menu button (mobile-only), Page Title display, Dark Mode toggle button, user greeting, and user initials avatar.

### 3. Pagination Control (`Pagination.tsx`)
* **Purpose**: Divides large lists (assignments, students, submissions) into pages.
* **Props**: `currentPage`, `totalPages`, `onPageChange`.
* **Flow**: Renders numbered circles, "Prev" and "Next" buttons, disabling them on boundary pages.

### 4. Primitive Atoms (`/components/ui/`)
* **`Button.tsx`**: Flexible container wrapping HTML buttons. Supports `primary`, `secondary`, `danger`, and `outline` sizes with loading spinner state overlays.
* **`Card.tsx`**: Basic white/dark-neutral box wrapping borders. Provides standard padding structures.
* **`Badge.tsx`**: Small pills used for displaying status. Dynamically changes colors based on value:
  * Green for `reviewed` / `ACTIVE`
  * Orange/Yellow for `submitted` / `PENDING`
  * Gray/Red for `not_submitted` / `LATE`
* **`Modal.tsx`**: Backdrop overlay focusing portal content. Closes on backdrop click or ESC escape keys.

---

## 5.2 Teacher Interface Pages

### 1. Teacher Dashboard (`TeacherDashboard.tsx`)
* **Purpose**: Consolidated analytics viewport.
* **Widgets**:
  * Total Assignments Count Card.
  * Active Assignments Card.
  * Submitted Assignments Count (unreviewed metrics trigger orange accents).
  * Enrolled Students Count Card.
* **Interactive Elements**: Dropdown selection allowing filters to update stats based on selected active Batch.

### 2. Batch Management (`BatchManagement.tsx`)
* **Purpose**: Allows teachers to organize class divisions.
* **UI Structure**:
  * Left side: List of existing batches.
  * Right side: Batch Creation form (Zod validation for `batchName` and `description`).
  * Action modals: Lists students enrolled inside a selected batch.

### 3. Create & Edit Assignment (`CreateAssignment.tsx`)
* **Purpose**: Comprehensive form to design homework tasks.
* **Fields**:
  * Text inputs: Title, Subject, Topic, Instructions, Description.
  * Numbers: Total Marks, Passing Marks.
  * Dates & Times: Due Date calendar picker and Due Time field.
  * Checkboxes: Allow Late Submission.
  * File uploads: Drag-and-drop file uploader (PDF/Image/Document) interacting with the backend media service.
* **Validation**: Custom validation checks ensuring that `passingMarks` does not exceed `totalMarks`.

---

## 5.3 Student Interface Pages

### 1. Student Dashboard (`StudentDashboard.tsx`)
* **Purpose**: Central student workspace.
* **Widgets**:
  * Assignment Status Circle Progress Widget.
  * Pending Task List (prioritized by closest due dates).
  * Recent Grades Summary Panel.

### 2. Assignment Details & Submission (`AssignmentDetail.tsx`)
* **Purpose**: View instructions, download attachments, and upload submissions.
* **Layout**:
  * Left Column: Detailed description, instructions, max score limits, passing margins, and reference file download link.
  * Right Column: Submission box. Shows remaining time countdown. If not submitted, renders file upload field with text comment box. If submitted, displays file details, timestamp, grading score, and teacher feedback.

### 3. Learning Progress (`LearningProgress.tsx`)
* **Purpose**: Visual analytics showing grade history and performance over time.
* **UI Elements**:
  * Line Chart: Renders individual assignment scores against the batch averages.
  * Subject Summary Table: Displays subject-wise pass rates and average grades.
