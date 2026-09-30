# 4. Frontend Documentation

The client-side of the XAMS portal is implemented as a single-page application (SPA) using React 19, TypeScript, Redux Toolkit, React Router DOM, and Tailwind CSS. It focuses on modular components, stateless component rendering, and custom React hooks.

---

## 4.1 Frontend Tech Stack & Architecture

* **React 19**: Serves as the core view engine. It utilizes the virtual DOM for rendering and handles components' lifecycles.
* **Redux Toolkit (RTK)**: Manages global asynchronous state variables (specifically academic batches and selection).
* **React Router DOM v7**: Directs user routing, dividing page modules into Public, Student, and Teacher sections.
* **Axios**: Executes HTTP calls. Configured with a response interceptor to handle session timeouts and authentication failures (status `401`).
* **React Hook Form & Zod**: Handles user input collections (e.g. signup, login, grading) with real-time validation schemas.

---

## 4.2 State Management & Store

Global states are organized using Redux slices. The main store compiles slices to expose clean dispatch hooks.

### Redux Slices:
1. **`batchSlice.ts`**:
   * *State Model*:
     * `batchList`: Array of batches mapped with student count.
     * `selectedBatch`: Currently active batch filtered in dashboard contexts.
     * `loading` & `error`: Status placeholders for asynchronous operation metrics.
   * *Thunk Methods*:
     * `getAllBatches()`: Fetches teacher-scoped batches and hits student API to retrieve batch sizes.
     * `getPublicBatches()`: Fetches batches available for public sign-up registration.
     * `createBatch()`: Posts new batch credentials to backend endpoints.
     * `deleteBatch()`: Dispatches delete REST calls, purging local store caches.

---

## 4.3 Context APIs

### 1. AuthContext (`AuthContext.tsx`)
Provides authentication state to children nodes, handling session caches via `localStorage` alongside HTTP-only cookies.
* *States*:
  * `user`: Profile fields (`fullName`, `email`, `role`, `enrollmentNumber`).
  * `isAuthenticated`: Boolean checks.
  * `loading`: Defer route checks during startup initialization.
* *Methods*:
  * `login(role, credentials)`: Standard login router. Calls `authService.login()`, saves details, and sets states.
  * `logout()`: Clears security context, calls backend logout APIs to clear the cookie, and redirects user to landing.

### 2. ThemeContext (`ThemeContext.tsx`)
Manages dark/light theme options, writing the active class configurations directly to the HTML document element root.
* *States*:
  * `theme`: `dark` | `light` options.
* *Methods*:
  * `toggleTheme()`: Swaps system visual flags and stores preferred modes in local settings.

---

## 4.4 Client Services Layer (API wrappers)

Axios routes are mapped to modular client wrappers under `/src/services`:

| File Name | Exposed Client Methods | Interacts With (Backend Envs) |
|---|---|---|
| `auth.service.ts` | `teacherLogin`, `teacherRegister`, `studentLogin`, `studentRegister`, `logout`, `getMe` | `/api/auth/*` |
| `batch.service.ts` | `getAllBatches`, `getBatchById`, `createBatch`, `updateBatch`, `deleteBatch`, `getPublicBatches` | `/api/teacher/batches/*` |
| `student.service.ts` | `getDashboardStats`, `getAssignments`, `getAssignmentById`, `submitAssignment`, `getLearningProgress` | `/api/student/*` |
| `teacher.service.ts` | `getDashboardStats`, `getAssignments`, `createAssignment`, `updateAssignment`, `deleteAssignment`, `getSubmissions` | `/api/teacher/*` |

---

## 4.5 Navigation & Guarded Routes

Guarded routes protect internal portals against unauthorized access:
* **`ProtectedRoute`**: Inspects user authorization rules. If the user's role is not validated (e.g. Student tries accessing `/teacher/*`), it redirects them to their respective home screen. If not authenticated, redirects to `/`.
* **`PublicRoute`**: Prevents logged-in sessions from loading auth screens, immediately forwarding active sessions to their specific role-based dashboards.
