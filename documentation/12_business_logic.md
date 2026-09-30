# 12. Core Business Logic Workflows

This section outlines the business logic algorithms implemented in the service layer (`com.assignment.service.impl`) of the **XAMS** application.

---

## 12.1 User Registration & Batch Assignment
When a Student registers via `/api/auth/register/student`:
1. **Password Encryption**: The raw password is encrypted using BCrypt.
2. **Batch Association**: The system verifies the selected `batchId` against the `batches` table. If the batch does not exist, it throws a `ResourceNotFoundException`.
3. **Database Write**: A new `Student` record is saved, mapping the foreign key `batch_id`.
4. **JWT Generation**: Generates a stateless authentication token containing the role claim `STUDENT`.

---

## 12.2 Assignment Creation & Resource Upload
When a Teacher publishes a new assignment:
1. **Validation Checks**:
   * Asserts the creator exists as a Teacher.
   * Asserts that `passingMarks` is less than or equal to `totalMarks`. If invalid, it throws a `BadRequestException`.
   * Asserts that the target Batch exists and belongs to the calling Teacher.
2. **Media Management**: If a reference file is uploaded, the service calls `CloudinaryService` to upload the file. It saves the secure URL returned by the cloud provider into the `resource_url` field of the assignment.
3. **Cache Eviction**: Since a new assignment changes dashboards, the service calls the `RedisService` to evict cached data keys matching the pattern:
   * `dashboard:teacher:{email}`
   * `dashboard:student:*` (all student dashboards are cleared to reflect the new assignment).

---

## 12.3 Student Submission & Deadline Verification
When a student uploads a solution:
1. **Assignment Checks**: Verifies that the assignment exists and is active.
2. **Enrollment Verification**: Ensures the student belongs to the batch target for the assignment.
3. **File Size Validation**: Checks that the uploaded file size does not exceed the assignment's `maxFileSize` limit.
4. **Deadline Verification**: Compares the current timestamp against the assignment's `dueDate` and `dueTime`.
   * If the current time is past the deadline and `lateSubmissionAllowed` is `false`, it throws a `BadRequestException` blocking the submission.
   * If `lateSubmissionAllowed` is `true`, it flags the submission as late, records the current timestamp, and uploads the file to Cloudinary.
5. **Database Write**: Creates a new `Submission` record with status `SUBMITTED`.
6. **Cache Eviction**: Evicts the student's dashboard cache and the teacher's dashboard cache.

---

## 12.4 Submission Grading & Feedback
When a teacher grades a submission:
1. **Ownership Check**: Verifies that the submission belongs to an assignment created by the calling teacher.
2. **Score Range Validation**: Checks that the assigned `marks` are non-negative and do not exceed the assignment's `totalMarks` limit.
3. **Status Update**: Sets the submission status to `REVIEWED`, records the marks and feedback comment, and sets the `reviewedAt` timestamp.
4. **Cache Eviction**: Evicts the student's dashboard cache to reflect the new grade.
