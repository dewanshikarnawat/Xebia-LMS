# 11. REST API Specifications

The **XAMS** APIs are organized as stateless REST endpoints protected by JWT and role authorization filters. Responses conform to a standard wrapper model (`ApiResponse<T>`).

---

## 11.1 Standard JSON Response Wrap
All REST endpoints return the following JSON structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "status": 200,
  "timestamp": "2026-07-07T07:35:00.123456"
}
```

---

## 11.2 Authentication Endpoint Mapping (`/api/auth`)

| HTTP Method | URL Path | Description | Role Required | Request Body (JSON) | Success Code |
|---|---|---|---|---|---|
| **POST** | `/api/auth/register/teacher` | Sign up teacher profile | Public | `TeacherRegisterRequest` | 200 OK |
| **POST** | `/api/auth/register/student` | Sign up student profile | Public | `StudentRegisterRequest` | 200 OK |
| **POST** | `/api/auth/login` | Login & set HTTP Cookie | Public | `LoginRequest` | 200 OK |
| **POST** | `/api/auth/logout` | Clear JWT Cookie sessions | Public | *None* | 200 OK |
| **GET** | `/api/auth/batches` | List batches for signup selection | Public | *None* | 200 OK |

### Request/Response Payload Models:
* **`LoginRequest`**:
  ```json
  {
    "email": "teacher@xebia.com",
    "password": "Password@123"
  }
  ```
* **`AuthResponse`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZWFjaGVyQG...",
    "email": "teacher@xebia.com",
    "fullName": "Instructor John",
    "role": "TEACHER"
  }
  ```

---

## 11.3 Teacher management Endpoints (`/api/teacher`)

These endpoints require the bearer token or HTTP Cookie authorization matching the `TEACHER` role authority.

| HTTP Method | URL Path | Description | Query Parameters / Headers | Request Body |
|---|---|---|---|---|
| **GET** | `/api/teacher/dashboard` | Fetch dashboard counts | *None* | *None* |
| **POST** | `/api/teacher/batches` | Create a student division | *None* | `BatchRequest` |
| **GET** | `/api/teacher/batches` | List teacher's batches | *None* | *None* |
| **GET** | `/api/teacher/batches/{id}/students` | Fetch students in batch | *None* | *None* |
| **POST** | `/api/teacher/students` | Enroll student in batch | *None* | `AddStudentRequest` |
| **DELETE** | `/api/teacher/students/{id}` | Remove student from batch | *None* | *None* |
| **POST** | `/api/teacher/assignments` | Post new homework task | `multipart/form-data` header | `AssignmentRequest` |
| **GET** | `/api/teacher/assignments` | Paginated assignments lists | `page=0`, `size=10` | *None* |
| **PUT** | `/api/teacher/assignments/{id}` | Modify task parameters | `multipart/form-data` header | `AssignmentRequest` |
| **DELETE** | `/api/teacher/assignments/{id}` | Delete assignment task | *None* | *None* |
| **GET** | `/api/teacher/assignments/{id}/submitted` | Fetch submissions for grading | *None* | *None* |
| **PUT** | `/api/teacher/submissions/{id}/review` | Grade and write feedback | *None* | `SubmissionReviewRequest` |

### Payload Models:
* **`AssignmentRequest`** (multipart/form-data):
  * `title`: "Spring Boot Tutorial 1"
  * `description`: "Read chapter 2 and do tasks."
  * `instructions`: "Upload code files only."
  * `assignmentType`: "FILE_UPLOAD"
  * `subject`: "Java Enterprise"
  * `topic`: "Spring JPA"
  * `batchId`: 1
  * `totalMarks`: 100
  * `passingMarks`: 40
  * `dueDate`: "2026-07-15"
  * `dueTime`: "18:00:00"
  * `lateSubmissionAllowed`: true
  * `file`: [Binary File Attachment]
* **`SubmissionReviewRequest`**:
  ```json
  {
    "marks": 90.0,
    "feedback": "Great work on database optimization!"
  }
  ```

---

## 11.4 Student Endpoints (`/api/student`)

These endpoints require token verification matching the `STUDENT` role authority.

| HTTP Method | URL Path | Description | Query Parameters | Request Body |
|---|---|---|---|---|
| **GET** | `/api/student/dashboard` | Dashboard metrics | *None* | *None* |
| **GET** | `/api/student/assignments` | View assigned batch homeworks | `page=0`, `size=10` | *None* |
| **GET** | `/api/student/assignments/{id}` | Fetch specific task detail | *None* | *None* |
| **POST** | `/api/student/assignments/{id}/submit` | Upload file solution | `multipart/form-data` header | `StudentSubmitRequest` |
| **GET** | `/api/student/submissions` | Paginated lists of user submissions | `page=0`, `size=10` | *None* |
| **GET** | `/api/student/submissions/{id}` | Fetch individual grading details | *None* | *None* |

### Payload Models:
* **`StudentSubmitRequest`** (multipart/form-data):
  * `comment`: "Here is my project code."
  * `file`: [Binary Submission File]
