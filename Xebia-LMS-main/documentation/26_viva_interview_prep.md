# 26. Viva & Interview Preparation Hub

This section compiles essential viva exam and technical interview questions and answers based on the architecture, stack, and codebase of **XAMS**.

---

## 26.1 Academic Viva / Project Defense Questions

### Q1: What is the core purpose of the Xebia Assignment Management System (XAMS)?
**Answer**: XAMS is a web-based learning portal designed to automate the assignment lifecycle in academic environments. It allows teachers to create batches, enroll students, publish assignments, and grade submissions. Students can view active deadlines, download reference files, upload their solutions, and review their scores.

### Q2: What is the architecture pattern of the application?
**Answer**: The system uses a decoupled **Client-Server Architecture** with a layered backend. The frontend is a React Single Page Application (SPA), and the backend is a stateless Spring Boot REST API. They communicate using HTTP JSON requests and responses.

### Q3: Why did you use PostgreSQL as the primary database?
**Answer**: PostgreSQL is an enterprise-grade, open-source relational database (RDBMS) that provides robust transaction support (ACID compliance), foreign key constraints, and relational mappings, ensuring data integrity for batches, assignments, and submissions.

### Q4: What is the role of Redis in your project?
**Answer**: Redis is used as an in-memory caching layer. It caches the status of student submissions to avoid querying the PostgreSQL database repeatedly, reducing API response times.

### Q5: How do you handle file uploads?
**Answer**: Reference files and student submissions are uploaded to **Cloudinary** (a cloud-based media manager) using its Java SDK. The database stores only the secure HTTPS URL, saving local server storage space.

### Q6: How does the system handle assignment deadlines?
**Answer**: When a student submits a file, the `SubmissionServiceImpl` compares the current time against the assignment's `dueDate` and `dueTime`. If the deadline has passed, the submission is rejected unless the assignment has `lateSubmissionAllowed` set to `true`.

### Q7: What annotations are used to configure JPA relationships?
**Answer**:
* `@ManyToOne` (with `FetchType.LAZY`) represents the parent relationships (e.g. Assignment pointing to a Batch).
* `@OneToMany` represents child collections (e.g. Student pointing to a list of Submissions).
* `@JoinColumn` defines the foreign key column mapping.

### Q8: How are DTOs mapped to Entities in the backend?
**Answer**: We use **MapStruct**. It generates object mapping code at compile time, copying values between JPA entities and DTOs (Data Transfer Objects), which is faster and cleaner than manual getters/setters or reflection-based library mappings.

### Q9: How is security handled in the REST APIs?
**Answer**: We use **Spring Security** with **JSON Web Tokens (JWT)**. When users log in, the backend generates a signed JWT and returns it in an HTTP-Only cookie. Subsequent requests carry this cookie, which is intercepted and validated by our custom `JwtAuthenticationFilter`.

### Q10: How do you handle validation errors in the backend?
**Answer**: We use Spring's `@Valid` annotation in controllers to trigger JSR-380 validation checks on DTOs. If validation fails, Spring throws a `MethodArgumentNotValidException`, which is caught by our `GlobalExceptionHandler` to return a clean JSON error response to the client.

---

## 26.2 Full-Stack Technical Interview Questions

### Q11: Why are JWTs stored in HTTP-Only cookies instead of localStorage?
**Answer**: Storing tokens in `localStorage` makes them vulnerable to Cross-Site Scripting (XSS) attacks, where malicious scripts can read the token. `HTTP-Only` cookies cannot be accessed by client-side JavaScript, protecting the system from token theft.

### Q12: Why is CSRF disabled in your Spring Security configuration?
**Answer**: CSRF protection is typically required for session-based web applications that rely on browsers automatically attaching session cookies. Because our backend is designed to be stateless and does not maintain sessions in memory, CSRF can be safely disabled.

### Q13: What does the `@Transactional` annotation do in Spring Boot?
**Answer**: It tells Spring to execute the annotated method within a database transaction. If the method completes successfully, the transaction commits. If a runtime exception is thrown, the transaction rolls back automatically, preserving database integrity.

### Q14: How does Redux Toolkit manage state in the React frontend?
**Answer**: Redux Toolkit provides a centralized store for global application state. It uses slices (like `batchSlice`) to define the initial state, reducers to modify the state, and asynchronous thunks (`createAsyncThunk`) to handle API requests and update the store.

### Q15: What is the purpose of Axios interceptors in the frontend?
**Answer**: Interceptors allow you to run code before requests are sent or after responses are received. In our project, we use a response interceptor to check for `401 Unauthorized` errors. If a 401 is received (indicating the user's session has expired), it automatically clears the local user state and redirects them to the login page.
