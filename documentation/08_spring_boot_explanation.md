# 8. Spring Boot Framework Architecture

This section explains how the **XAMS** backend leverages the Spring Boot ecosystem, including dependency injection, persistence mapping, transaction controls, and validation rules. It also details the roles of every standard annotation used in the project.

---

## 8.1 Core Framework Components

### 1. Spring Boot & Dependency Injection (IoC)
XAMS uses Spring’s Inversion of Control (IoC) container to manage Java classes. Rather than manually initializing classes using the `new` keyword, dependencies are injected at runtime.
* The codebase uses **Constructor Injection** via Lombok's `@RequiredArgsConstructor` annotation. This approach is preferred over field-based injection (`@Autowired`) because it enables class immutability (declaring attributes as `private final`) and makes unit testing easier.

### 2. Spring Security
Stateless session management is handled by Spring Security:
* Integrates a custom `OncePerRequestFilter` (`JwtAuthenticationFilter`) that checks incoming requests for a JWT cookie or Authorization header.
* Uses custom user detail models and BCrypt password encryption to secure database passwords.

### 3. Spring Data JPA & Hibernate
* Database queries are abstracted using Spring Data JPA. By extending `JpaRepository`, repositories inherit boilerplate CRUD query functions.
* Hibernate serves as the underlying Object-Relational Mapping (ORM) engine, translating Java objects into PostgreSQL-compatible SQL queries at runtime.

---

## 8.2 Spring Annotation Directory

Here is the functional dictionary of annotations used throughout the project:

### Stereotype Annotations:
* **`@SpringBootApplication`**: Configures configuration scans, component scans, and class auto-configurations. Used on `AssignmentManagementApplication`.
* **`@RestController`**: Combines `@Controller` and `@ResponseBody`. Tells Spring to serialize method return values directly into JSON HTTP response bodies.
* **`@Service`**: Marks a class as a business service component. It registers the class in the application context.
* **`@Repository`**: Registers database repository components, handling database exceptions and mapping them to Spring's data exception hierarchy.
* **`@Component`**: Indicated general-purpose Spring beans (e.g. `JwtAuthenticationFilter`).

### Mapping & Request Annotations:
* **`@RequestMapping(url)`**: Maps URL prefixes to controllers or methods.
* **`@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping`**: Specialized route mappings for HTTP methods (GET, POST, PUT, DELETE).
* **`@RequestBody`**: Configures Spring to deserialize incoming JSON request bodies into Java DTOs.
* **`@ModelAttribute`**: Maps incoming form data (which may include multipart files) to DTO fields.
* **`@PathVariable`**: Binds URL path parameters (e.g., `/api/student/assignments/{id}`) to Java method arguments.
* **`@RequestParam`**: Binds URL query strings (e.g. `?page=0&size=10`) to method arguments.
* **`@Valid`**: Triggers JSR-380 validation checks (e.g., checking for `@NotBlank` or `@Size` on DTO attributes) before controller execution.

### Persistence (JPA / Hibernate) Annotations:
* **`@Entity`**: Declares a class as a persistent database entity.
* **`@Table(name)`**: Explicitly names the PostgreSQL table mapped to the annotated entity.
* **`@Id`**: Specifies the primary key of the entity.
* **`@GeneratedValue`**: Configures primary key generation strategies (e.g., `GenerationType.IDENTITY` for serial auto-incrementation).
* **`@Column`**: Maps a Java property to a specific table column, defining nullability, length, and unique constraints.
* **`@ManyToOne`**: Defines a N:1 relationship (e.g., multiple Assignments pointing to one Batch).
* **`@OneToMany(mappedBy)`**: Defines a 1:N relationship (e.g., one Student having multiple Submissions).
* **`@JoinColumn`**: Configures the foreign key column name linking the entities.
* **`@Enumerated(EnumType.STRING)`**: Saves enum variables as their string names in the database, preventing indexing errors if the enum order changes.
* **`@CreationTimestamp` / `@UpdateTimestamp`**: Automatically records timestamps when database rows are created or modified.

### Configuration & Utilities:
* **`@Configuration`**: Registers configuration classes containing `@Bean` definitions in the Spring context.
* **`@Bean`**: Registers third-party classes or custom initializers as Spring-managed beans.
* **`@Transactional`**: Wraps method execution in database transactions, automatically executing rollbacks if a runtime exception is thrown.
* **`@Value`**: Binds external values from properties files (e.g., `${app.jwt.secret}`) to class fields.
