# Assignment Management System Project Documentation

Welcome to the official, complete system documentation for the **Xebia Assignment Management System** (a full-stack web application with a Spring Boot backend and React + TypeScript frontend).

This documentation is designed to serve as a comprehensive reference for university project submissions, internship portfolios, developer onboarding, and production system handovers. It is divided into 26 detailed sections:

## Table of Contents

### 1. Project Introduction & Planning
1. **[Project Overview](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/01_project_overview.md)** - Introduction, Problem Statement, Objectives, Scope, and System Requirements.
2. **[Project Architecture](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/02_project_architecture.md)** - MVC pattern, Layered Architecture, Client-Server communication, and data flows with Mermaid diagrams.
3. **[Folder Structure Rationale](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/03_folder_structure.md)** - Explanation of folder architecture, responsibility mappings, and configuration files.

### 2. Frontend Specifications
4. **[Frontend Documentation](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/04_frontend_documentation.md)** - Detailed analysis of components, pages, layouts, state management (Redux), custom hooks, routing, and APIs.
5. **[UI & Component Breakdown](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/05_ui_documentation.md)** - Visual components, page user-flows, card designs, dashboards, layouts, forms, and responsive design guidelines.

### 3. Backend Specifications
6. **[Backend Package Structure](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/06_backend_documentation.md)** - Roles of Controller, Service, Repository, DTO, Config, Mapper, and Exception packages.
7. **[Java Class Documentation](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/07_java_class_documentation.md)** - Comprehensive breakdown of every single Java class, its methods, dependencies, constructors, and annotations.
8. **[Spring Boot & Hibernate Framework usage](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/08_spring_boot_explanation.md)** - DI, bean cycles, JPA/Hibernate mapping, transaction management, and standard annotation guides.

### 4. Security & Database Design
9. **[Authentication & Authorization](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/09_auth_and_auth.md)** - JWT token lifecycle, Spring Security filter chain, HTTP-only cookies, and Role-Based Access Control (RBAC).
10. **[Database Schema Design](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/10_database_documentation.md)** - Entity-Relationship model, tables structure, indices, foreign/primary keys, and database constraints.
11. **[REST API Specifications](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/11_api_documentation.md)** - Complete REST endpoint mapping table with parameters, authentication details, headers, body structures, and example response payloads.

### 5. Workflows & Core Processes
12. **[Core Business Logic Workflows](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/12_business_logic.md)** - Logic trace of student stats calculation, assignment distribution, status updates, grading, and caching.
13. **[End-to-End Request Lifecycle](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/13_request_lifecycle.md)** - Step-by-step trace of how data flows from a browser UI click down to a PostgreSQL database transaction.
14. **[System Error Handling](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/14_error_handling.md)** - Validation handlers, global REST controller advice, custom exception hierarchy, and API response structures.

### 6. Configurations & Technical Details
15. **[Configuration Files Analysis](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/15_configuration_files.md)** - Deep dive into properties, XML pom files, TypeScript and Tailwind configurations.
16. **[Security Configurations & Measures](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/16_security.md)** - CORS, CSRF explanation, BCrypt hashing strength, and filter chain order.
17. **[Code Implementation Walkthrough](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/17_code_walkthrough.md)** - Deep walkthrough of complex code implementations (JWT extraction, Redis caching decorator pattern, data mapping).

### 7. Diagnostics, Verification & Operations
18. **[UML Diagrams](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/18_uml_diagrams.md)** - Use Case, Class, Sequence, Activity, Component, and Deployment diagrams rendered in Mermaid.
19. **[System Testing Strategy](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/19_testing.md)** - Unit test cases, API endpoint tests, manual testing walkthroughs, and boundary validation.
20. **[Deployment & Environment Setup Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/20_deployment.md)** - Detailed instructions for local setup, environment variables, build tasks, and production packaging.
21. **[System Performance Optimizations](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/21_performance.md)** - Bundle splitting, Redis cache invalidation policy, lazy fetching in JPA, and asset size configuration.

### 8. Guides & Roadmaps
22. **[End-User Manual](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/22_user_guide.md)** - Step-by-step user manuals with page layout descriptions for both Teachers and Students.
23. **[Developer Contribution Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/23_developer_guide.md)** - Code style rules, Git workflow patterns, branch names, and feature extension walkthroughs.
24. **[Future Project Enhancements](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/24_future_enhancements.md)** - Next steps roadmap (AI grading helper, plagiarism checking, real-time push alerts, offline support).
25. **[GitHub Repository Landing Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/25_readme_guide.md)** - Overview of repository README layout, license structure, and contribution credits.
26. **[Viva & Interview Preparation Hub](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/26_viva_interview_prep.md)** - 100+ project viva questions and answers, and 100+ full-stack Spring Boot/React interview questions.
