# 7. Java Class Documentation

This section provides comprehensive details on the primary Java classes in the backend application, outlining annotations, public methods, parameters, return types, validations, and dependencies.

---

## 7.1 Controller Layer Classes

### 1. `AuthController`
* **Annotations**: `@RestController`, `@RequestMapping("/api/auth")`, `@RequiredArgsConstructor`
* **Dependencies**: `AuthService`
* **Purpose**: Coordinates access management (login, signup, logouts, batch queries).
* **Key Methods**:
  * `registerTeacher(@Valid @RequestBody TeacherRegisterRequest request, HttpServletResponse response)`: Registers a teacher, generates a JWT, sets it in an HTTP-only cookie, and returns `AuthResponse`.
  * `registerStudent(@Valid @RequestBody StudentRegisterRequest request, HttpServletResponse response)`: Registers a student and assigns them to a batch.
  * `login(@Valid @RequestBody LoginRequest request, HttpServletResponse response)`: Verifies user credentials (email/password) and sets the authentication cookie.
  * `logout(HttpServletResponse response)`: Clears the JWT cookie by setting its max age to zero.

### 2. `AssignmentController`
* **Annotations**: `@RestController`, `@RequestMapping("/api")`, `@RequiredArgsConstructor`
* **Dependencies**: `AssignmentService`
* **Purpose**: Maps URL routes for assignment creations, modifications, listings, and deletions.
* **Key Methods**:
  * `createAssignment(@Valid @ModelAttribute AssignmentRequest request)`: Handles multipart/form-data requests, parses fields, uploads attachment to Cloudinary, and saves the assignment.
  * `updateAssignment(@PathVariable Long id, @Valid @ModelAttribute AssignmentRequest request)`: Updates assignment parameters and handles file swaps.
  * `deleteAssignment(@PathVariable Long id)`: Removes the assignment and invalidates corresponding Redis caches.
  * `getStudentAssignments(...)`: Returns a page of assignments assigned to the calling student's batch.

### 3. `BatchController`
* **Annotations**: `@RestController`, `@RequestMapping("/api/teacher/batches")`, `@RequiredArgsConstructor`
* **Dependencies**: `BatchService`
* **Purpose**: Handles student cohort divisions.
* **Key Methods**:
  * `createBatch(@Valid @RequestBody BatchRequest request)`: Instantiates a new batch with name and description details.
  * `getAllBatches()`: Lists all batches managed by the calling teacher.
  * `getBatchStudents(@PathVariable Long id)`: Returns all students enrolled in a particular batch.

### 4. `SubmissionController`
* **Annotations**: `@RestController`, `@RequestMapping("/api")`, `@RequiredArgsConstructor`
* **Dependencies**: `SubmissionService`
* **Purpose**: Manages student submission reviews and scoring.
* **Key Methods**:
  * `submitAssignment(@PathVariable Long id, @Valid @ModelAttribute StudentSubmitRequest request)`: Uploads student submissions and maps comment text.
  * `reviewSubmission(@PathVariable Long id, @Valid @RequestBody SubmissionReviewRequest request)`: Allows teachers to write scoring grades and reviews.

---

## 7.2 Service Layer Implementations

### 1. `AuthServiceImpl`
* **Annotations**: `@Service`, `@RequiredArgsConstructor`, `@Transactional`
* **Dependencies**: `TeacherRepository`, `StudentRepository`, `BatchRepository`, `PasswordEncoder`, `JwtService`
* **Business Logic**:
  * Generates User entities, encrypts raw password entries using `BCryptPasswordEncoder`, matches enrollment ids, and produces JWT signatures.
  * Throws `BadRequestException` if user emails duplicate.

### 2. `AssignmentServiceImpl`
* **Annotations**: `@Service`, `@RequiredArgsConstructor`, `@Transactional`
* **Dependencies**: `AssignmentRepository`, `BatchRepository`, `TeacherRepository`, `CloudinaryService`, `AssignmentMapper`, `RedisService`
* **Business Logic**:
  * Validates batch and teacher associations.
  * Converts file streams to cloud URLs using the Cloudinary API.
  * Clears dashboard and assignment caches in Redis upon change operations.

### 3. `DashboardServiceImpl`
* **Annotations**: `@Service`, `@RequiredArgsConstructor`
* **Dependencies**: `AssignmentRepository`, `StudentRepository`, `SubmissionRepository`, `RedisService`
* **Business Logic**:
  * Computes system analytics.
  * Caches results in Redis using key formatting (`dashboard:teacher:{email}` or `dashboard:student:{email}`) with a 10-minute Time-to-Live (TTL).
