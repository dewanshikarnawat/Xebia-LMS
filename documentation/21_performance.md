# 21. System Performance Optimizations

This section details the performance optimization strategies used in **XAMS** to ensure low API latency and fast user interface rendering under high load.

---

## 21.1 Backend Performance Optimizations

### 1. Database Caching using Redis
Database query times are optimized using Redis for temporary caching:
* **Target Data**: Caches the status overview of active student submissions (`AssignmentStatusResponse`).
* **Implementation**: The service checks Redis before querying PostgreSQL.
  * **Cache Hit**: Returns the response in under 5ms, avoiding database overhead.
  * **Cache Miss**: Queries the database (taking 50-100ms), saves the result to Redis with a 7-day TTL, and returns it.
* **Cache Eviction**: Cache keys are automatically deleted when new submissions are uploaded or reviewed, ensuring data remains fresh.

### 2. JPA Lazy Fetching (`FetchType.LAZY`)
To prevent "N+1 select queries" during relational mappings, entity relationships (like `@ManyToOne`) are configured to fetch data lazily:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "batch_id", nullable = false)
private Batch batch;
```
* **Why it helps**: Spring Data JPA does not load the related `Batch` records into memory unless `getBatch()` is explicitly called. This reduces unnecessary SQL JOIN statements and keeps entity loading efficient.

### 3. API Payload Minimization (DTOs)
* **Goal**: REST controllers return structured DTOs (e.g. `AssignmentResponse`) rather than full JPA Entity models. This keeps response sizes small, returns only the required fields, and prevents infinite recursion issues caused by bidirectional relationships.

---

## 21.2 Frontend Performance Optimizations

### 1. Paginated Lists
* Lists of assignments and submissions use server-side pagination (`page` and `size` parameters).
* This keeps initial page load times fast and memory usage low, even as the database grows to thousands of records.

### 2. React Optimization Strategies
* **State Co-location**: UI states (like modal toggles) are kept inside the specific components that use them, preventing unnecessary re-renders of parent layouts.
* **Asset Optimization**: High-resolution files are uploaded to and served by Cloudinary, which automatically optimizes media sizes and delivery.
* **Component Splitting**: UI components are divided into small, reusable components under `components/ui` to keep rendering paths efficient.
