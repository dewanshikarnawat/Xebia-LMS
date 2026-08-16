# 3. Folder Structure Rationale

This section details the physical layout of the **Xebia Assignment Management System (XAMS)** repository. It explains the responsibilities, dependencies, and best practices associated with each folder and key configuration files.

---

## 3.1 Overall Repository Layout
At the root level, the project is divided into two main subdirectories:
* **`Backend`**: Contains the Spring Boot Java source code, tests, and Maven configuration.
* **`frontend`**: Contains the React, TypeScript, Vite, and Tailwind CSS source code.
* **`documentation`**: Holds the comprehensive system documentation files.

---

## 3.2 Backend Directory Structure (`/Backend`)

The backend follows the Spring Boot standard folder conventions:

```text
Backend/
├── pom.xml                                 # Maven dependencies and build configuration
└── src/
    ├── main/
    │   ├── java/com/assignment/
    │   │   ├── AssignmentManagementApplication.java # Spring Boot entry application
    │   │   ├── config/                     # Configuration classes (Security, JWT, Redis, Cloudinary)
    │   │   ├── controller/                 # REST Controllers (Endpoints)
    │   │   ├── dto/                        # Data Transfer Objects (Requests & Responses)
    │   │   ├── entity/                     # JPA Entities (PostgreSQL mapping)
    │   │   ├── enums/                      # Enum types (Role, Status)
    │   │   ├── exception/                  # Custom Exceptions & Global Exception Handler
    │   │   ├── mapper/                     # MapStruct interfaces for Entity-DTO conversion
    │   │   ├── repository/                 # Spring Data JPA Repository interfaces
    │   │   ├── security/                   # Custom UserDetails Service
    │   │   └── service/                    # Business Logic Interfaces and Implementations
    │   └── resources/
    │       └── application.properties       # Database, Redis, JWT & Cloudinary settings
    └── test/
        └── java/com/assignment/
            └── AssignmentManagementApplicationTests.java # Context loading tests
```

### Folder Breakdown & Responsibilities:
1. **`config/`**:
   * *Purpose*: Configures system middleware and security filters.
   * *Dependencies*: Spring Core, Spring Security, Redis, Cloudinary SDK.
   * *Best Practices*: Keep configuration modular. E.g., separate Redis caching settings from REST API security configuration.
2. **`controller/`**:
   * *Purpose*: Exposes REST end-points and maps HTTP operations.
   * *Dependencies*: DTOs, Services, Spring Web annotations.
   * *Best Practices*: Do not write business logic here. Delegate immediately to the service layer.
3. **`dto/`**:
   * *Purpose*: Defines simple data containers for request payloads and response structures.
   * *Best Practices*: Separate request payloads (e.g., `LoginRequest`) from response payloads (e.g., `AuthResponse`) to prevent model pollution.
4. **`entity/`**:
   * *Purpose*: Defines database tables mapping to Hibernate.
   * *Best Practices*: Define table and column names explicitly using `@Table` and `@Column` annotations to avoid system default mapping errors.
5. **`exception/`**:
   * *Purpose*: Centralized error tracking, translating native exceptions to clean HTTP 4xx/5xx responses.
   * *Best Practices*: Create a generic `CustomException` parent, extending it for specific issues like `ResourceNotFoundException`.
6. **`mapper/`**:
   * *Purpose*: Auto-generates mapping logic between DTOs and database Entities.
   * *Dependencies*: MapStruct annotation processor.
7. **`repository/`**:
   * *Purpose*: Performs CRUD database operations.
   * *Dependencies*: JPA Entities.
8. **`service/`**:
   * *Purpose*: Implements core logic and coordinates database transactions.
   * *Best Practices*: Program to interfaces. Keep interfaces inside `service/` and concrete classes inside `service/impl/`.

---

## 3.3 Frontend Directory Structure (`/frontend`)

The frontend conforms to modern React + Vite layouts:

```text
frontend/
├── package.json                            # Scripts, dependencies, and build specs
├── tsconfig.json                           # TypeScript compiler guidelines
├── vite.config.ts                          # Vite build-bundler configurations
├── tailwind.config.js                      # Tailwind design configurations
├── index.html                              # Root HTML anchor page
└── src/
    ├── main.tsx                            # Root script bootstrapping React DOM
    ├── App.tsx                             # Main router and global contexts provider
    ├── index.css                           # Global styles and Tailwind base imports
    ├── assets/                             # Local images and icons
    ├── components/
    │   ├── layout/                         # Structural frames (Header, Sidebar, Layout wrapper)
    │   ├── shared/                         # Reusable components (Pagination, ProtectedRoutes, Loaders)
    │   └── ui/                             # Primitive styling controls (Badge, Button, Card, Modal)
    ├── contexts/                           # React Context API states (AuthContext, ThemeContext)
    ├── pages/
    │   ├── auth/                           # Student and Teacher login portals
    │   ├── student/                        # Student-specific screens
    │   └── teacher/                        # Teacher-specific management portals
    ├── services/                           # Axios api wrappers
    ├── store/                              # Redux slices and store configs
    ├── types/                              # TypeScript interfaces for entity mapping
    └── utils/                              # Shared helper and date-formatting routines
```

### Folder Breakdown & Responsibilities:
1. **`components/ui/`**:
   * *Purpose*: Atom components (buttons, badges, inputs) that are completely reusable across any page. They do not know about APIs or global state.
2. **`components/layout/`**:
   * *Purpose*: Controls UI layouts, providing responsive navigation bars and toggleable side panels.
3. **`contexts/`**:
   * *Purpose*: Manages light state values like theme modes or quick authentication pointers.
4. **`pages/`**:
   * *Purpose*: Contains page-level components that pull data from services, trigger Redux events, and render structures using UI and Layout folders.
5. **`services/`**:
   * *Purpose*: Houses Axios clients, handling server API calls. It handles errors and token forwarding.
6. **`store/`**:
   * *Purpose*: Redux store managing complex states (e.g., active batches).
7. **`utils/`**:
   * *Purpose*: Shared utility tools, such as converting ISO dates to friendly representations.
