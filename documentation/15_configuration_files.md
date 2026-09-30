# 15. Configuration Files Analysis

This section analyzes the key configuration files in both the frontend and backend of **XAMS**, explaining what each setting regulates.

---

## 15.1 Backend Configurations

### 1. `application.properties`
Configures the connection limits, DB drivers, security secrets, and third-party media keys:

* **Multipart Upload limits**:
  * `spring.servlet.multipart.max-file-size=50MB`: Restricts individual file uploads to 50 Megabytes.
  * `spring.servlet.multipart.max-request-size=50MB`: Restricts total HTTP multipart request size to 50 Megabytes.
* **PostgreSQL Connection**:
  * `spring.datasource.url=jdbc:postgresql://localhost:5432/assignment_db`: Points to the local PostgreSQL database server.
  * `spring.datasource.username=postgres` & `spring.datasource.password`: Database authentication credentials.
  * `spring.jpa.hibernate.ddl-auto=update`: Configures Hibernate to update the schema automatically on startup if modifications are made to JPA entities.
* **Redis Caching**:
  * `spring.data.redis.host=localhost` & `port=6379`: Points to the Redis caching server.
* **Security & JWT**:
  * `app.jwt.secret=404E6352...`: The 256-bit hexadecimal string key used to sign and verify HMAC-SHA256 JWT tokens.
  * `app.jwt.expiration-ms=86400000`: Sets token expiration to 24 hours (86,400,000 milliseconds).
* **Cloudinary Storage**:
  * `app.cloudinary.cloud-name`, `api-key`, `api-secret`: Configuration credentials mapping the backend service to the Cloudinary API.

### 2. Maven Project Object Model (`pom.xml`)
Defines the compilation targets, plugins, and dependencies:
* `java.version = 21`: Targets Java 21 compilation features.
* **Dependencies**:
  * `spring-boot-starter-web`: Pulls Tomcat, Spring MVC, and Jackson serialization packages.
  * `spring-boot-starter-security`: Restricts endpoints and secures session management.
  * `spring-boot-starter-data-jpa`: Links Hibernate and JPA repositories.
  * `spring-boot-starter-data-redis`: Imports connection factories for Redis.
  * `postgresql`: Installs PostgreSQL JDBC drivers.
  * `lombok`: Automates boilerplate getter/setter code generation.
  * `mapstruct`: Auto-generates mapping classes between Entities and DTOs during compilation.

---

## 15.2 Frontend Configurations

### 1. Vite Config (`vite.config.ts`)
* `plugins: [react()]`: Mounts the React compiler plugin.
* `server.proxy`: Configures a local development proxy. Any API requests matching the `/api` prefix are automatically forwarded to `http://localhost:8080`, bypassing CORS checks during frontend development.

### 2. Tailwind Config (`tailwind.config.js`)
Configures custom tokens, brand colors, fonts, and micro-animations:
* **Dark Mode**: `darkMode: 'class'` tells Tailwind to trigger dark-mode styles when the `.dark` class is present on the root HTML document element.
* **Custom Brand Palette**:
  * `brand.primary`: `#6C1D5F` (Plum purple color).
  * `brand.secondary`: `#84117C` (Violet/Purple color).
  * `brand.success`: `#01AC9F` (Teal color).
  * `accent.orange`: `#FF6200` (Accent color for active warnings or highlights).
* **Custom Animations**: Defines `fade-in`, `slide-up`, `slide-in`, and `shimmer` transitions to make the user interface feel alive.
* **Content Scoping**: Configures compiler sweeps across all JSX/TSX files under `/src` to tree-shake and bundle only the CSS rules used in active components.
