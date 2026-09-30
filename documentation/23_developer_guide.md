# 23. Developer Contribution Guide

This guide outlines coding standards, naming conventions, Git workflows, and implementation checklists for developers contributing to the **XAMS** codebase.

---

## 23.1 Coding Standards & Conventions

### 1. Backend Code Conventions (Java)
* **Naming Styles**:
  * Classes / Interfaces: `PascalCase` (e.g., `AssignmentController`, `AuthService`).
  * Variables / Methods: `camelCase` (e.g., `studentService`, `saveSubmission`).
  * Database Tables: Pluralized `snake_case` (e.g., `assignments`, `teachers`).
  * Database Columns: Singularized `snake_case` (e.g., `due_date`, `passing_marks`).
* **Dependency Injection**: Use constructor injection via Lombok's `@RequiredArgsConstructor` on final fields. Avoid `@Autowired` on class fields.
* **Transaction Management**: Mark write operations with `@Transactional`. For read-only services, use `@Transactional(readOnly = true)`.

### 2. Frontend Code Conventions (TypeScript & React)
* **Naming Styles**:
  * Components / Layouts: `PascalCase` (e.g., `Sidebar.tsx`, `Badge.tsx`).
  * Custom Hooks / Helper Functions: `camelCase` (e.g., `useAuth()`, `formatDate()`).
  * Types / Interfaces: `PascalCase` (e.g., `Assignment`, `Submission`).
* **CSS & Styles**: Use utility classes from Tailwind CSS. Maintain consistent spacing, colors, and layout patterns.
* **TypeScript Usage**: Enforce strict type checking. Avoid using the `any` type to ensure type safety.

---

## 23.2 Git Branching & Commit Guidelines

### 1. Branch Naming Strategy
* **`main`**: Production-ready code only.
* **`dev`**: Integration branch for new features.
* **`feature/{feature-name}`**: Development branches for specific features (e.g., `feature/email-notifications`).
* **`bugfix/{bug-name}`**: Development branches for fixing issues (e.g., `bugfix/deadline-utc`).

### 2. Commit Message Formats
Follow the semantic commit message format:
* `feat: add assignment search and filter options`
* `fix: correct timezone calculations on student submissions`
* `docs: add setup guide to README`
* `refactor: clean up MapStruct mappings`

---

## 23.3 Step-by-Step Feature Addition Checklist
To add a new feature (e.g., **Adding an Assignment Category field**):

1. **Database Update**:
   * Add the field to the JPA entity (`Assignment.java`).
   * Hibernate's `ddl-auto=update` will update the PostgreSQL schema automatically.
2. **DTO Mapping**:
   * Add the field to `AssignmentRequest` and `AssignmentResponse`.
   * MapStruct will update mappings automatically during the next compilation.
3. **Business Logic Implementation**:
   * Update the service interfaces and implementation classes to handle the new field.
4. **API Controller**:
   * Update the request mapping in the controller class.
5. **Frontend Integration**:
   * Update the TypeScript interfaces in `src/types/index.ts`.
   * Add the field to the input form components (using React Hook Form and Zod schemas).
   * Update page displays to render the new field.
