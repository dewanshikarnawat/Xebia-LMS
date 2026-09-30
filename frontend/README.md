# Assignment Management System - Frontend

This is the client-side web application of the Assignment Management System, built using **React.js (v18)**, **Vite**, **TypeScript**, and **Redux Toolkit** for global state management.

---

## 📂 Folder Structure & Key Paths

*   **`src/components/layout/`**: Core layout structures including sidebar, header, and themes.
*   **`src/components/ui/`**: Reusable atomic UI components (e.g., `Button`, `Modal`, `Input`, `Badge`, `Select`, `Card`).
*   **`src/components/shared/`**: Common cross-page utilities like `EmptyState`, `Pagination`, and loading skeletons.
*   **`src/pages/auth/`**: Login and Registration forms for both student and teacher portals.
*   **`src/pages/teacher/`**:
    *   `TeacherAssignments.tsx`: List and manage assignments.
    *   `TeacherQuizzes.tsx`: Online quiz creator workspace, import questions from Excel, draft saving, and multiple batch assignment.
    *   `SubmittedAssignments.tsx`: Submissions list and grading interface.
*   **`src/pages/student/`**:
    *   `StudentAssignments.tsx`: List of assignments and file submission workspace.
    *   `StudentQuizzes.tsx`: Attempt online quizzes, review scores, and download completion certificates.
    *   `QuizAttempt.tsx` & `QuizReview.tsx`: Dynamic quiz interfaces.
*   **`src/store/`**: Redux state configuration containing slices for authentication (`authSlice`), batches (`batchSlice`), and submissions.
*   **`src/services/`**: REST client services wrapper using Axios. Includes `teacherService`, `studentService`, `certificateService`, and `api`.

---

## 🎨 Theme & Styling System

The application utilizes vanilla CSS variables and Tailwind utilities for styling.
*   Supports full **Dark Mode** and **Light Mode** matching system defaults or user toggles.
*   Customized theme configurations are defined in `src/index.css` under `--brand-*` variables.

---

## 🚀 Key Implemented Workflows

### 1. Quiz Draft Creator Workspace (`TeacherQuizzes.tsx`)
*   **Optional Batch Selection**: While creating a quiz, teachers can choose not to select a batch (defaulting to "Save as Draft").
*   **Draft Filter**: Quizzes list displays status tabs/filters supporting `Draft`, `Assigned`, and `Published`.
*   **Assign Batch Modal**: Draft quizzes present a purple "Plus" action button. Clicking it opens a modal allowing teachers to select one or multiple checkboxes (batches) to assign the quiz.

### 2. Student Certificate Retriability & Downloads
*   **Bulk Loading Optimization**: On mounting `StudentAssignments` and `StudentQuizzes`, the frontend performs a single bulk fetch using `certificateService.getMyCertificates()` to cache earned certificates.
*   **Award Actions**:
    *   In the Assignments list and cards, an `Award` badge/button is displayed next to reviewed assignments, linking directly to the Cloudinary certificate URL.
    *   In the Quizzes list, a "Certificate" button is displayed alongside the "View Review" action for successfully completed quizzes.
