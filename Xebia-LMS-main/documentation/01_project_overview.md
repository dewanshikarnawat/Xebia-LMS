# 1. Project Overview

## 1.1 Project Name
The project is officially named the **Xebia Assignment Management System (XAMS)**.

## 1.2 Introduction
In academic environments, assignment management is a core process that influences student learning and faculty evaluation. The **Xebia Assignment Management System (XAMS)** is a modern, enterprise-grade, full-stack web application designed to digitize, streamline, and optimize the lifecycle of academic assignments. 

Built using a high-performance **Spring Boot** backend and a responsive, state-driven **React** frontend, XAMS provides a role-based collaborative platform for Teachers and Students. It integrates database persistence (PostgreSQL), cloud-based media storage (Cloudinary), speed-optimized caching (Redis), and stateless session handling (JSON Web Tokens).

## 1.3 Problem Statement
Traditional academic institutions rely on legacy portals, email threads, or physical paper submissions for handling student homework, coding tasks, and project reports. This approach introduces major structural inefficiencies:
* **Fragmented Channels**: Teachers use emails, chat channels, or spreadsheets to distribute assignments, leading to missed deadlines and untracked submissions.
* **Lack of Visibility**: Students do not have a unified interface displaying active deadlines, passing thresholds, status updates, or graded feedback.
* **Manual grading tracking**: Teachers struggle to view all submissions for a particular batch, download attachments individually, record grades manually, and calculate batch averages.
* **Resource Waste**: Storing files locally on university hard drives creates memory bottlenecks, while lack of proper validation allows students to upload invalid or oversized documents.

## 1.4 Existing System
The existing system relies either on manual coordination (paper/email submission) or basic Learning Management Systems (LMS) that treat assignments as generic file posts. 

### Limitations of the Existing System:
1. **Inefficient file management**: Files are stored in unstructured local folders, creating risks of loss or unauthorized alterations.
2. **Poor deadline enforcement**: Checking if a submission was late requires teachers to manually compare file properties or email timestamps.
3. **No real-time analytics**: Administrators and instructors cannot easily see batch performance metrics, submission ratios, or failure rates.
4. **Weak session security**: Basic session-based logins make portals vulnerable to Cross-Site Request Forgery (CSRF) and session hijacking.
5. **No caching mechanism**: Submitting dashboard requests hits the database repeatedly, causing performance degradation under high load.

## 1.5 Proposed System
The proposed **Xebia Assignment Management System (XAMS)** resolves these issues by implementing a dedicated database structure and modern web practices:
* **Batch-Scoped Assignments**: Teachers create assignments mapped to specific student batches, ensuring that only enrolled students receive the tasks.
* **Cloud Storage Integration**: Submissions and instructions are automatically uploaded to Cloudinary, ensuring highly available, secure cloud access.
* **Stateless Token Authentication**: Implements JSON Web Tokens (JWT) stored in HTTP-Only cookies to secure APIs and manage roles.
* **Redis Caching**: Caches user dashboards and batch statistics to reduce PostgreSQL database load by up to 80%.
* **Rich UI Dashboards**: Provides interactive screens showing pending submissions, grades, deadlines, and charts.

## 1.6 Objectives
* **Automation**: Automate assignment distribution, status updates, and grading workflows.
* **Security**: Enforce role-based access control, preventing students from editing assignments or viewing peers' submissions.
* **Performance**: Maintain low latency (sub-100ms) for dashboard queries using Redis caching.
* **Scalability**: Design a decoupled system where the React client and Spring Boot server communicate entirely over JSON REST APIs.

## 1.7 Scope
The scope of XAMS covers the complete assignment workflow:
1. **Authentication**: Sign up and secure login for Teachers and Students.
2. **Batch Management**: Teachers create batches and enroll students.
3. **Assignment Lifecycle**: Creation, publication, editing, submission, grading, and status transition.
4. **Cloud Media Management**: Automated secure uploads of PDFs, images, and text files.
5. **Insights**: Dashboards showing metrics (e.g., submission rates, pass/fail counters).

## 1.8 Key Features
* **Role-Based Access**: Dedicated dashboards for Teachers (manage batches, assign homework, score submissions) and Students (view tasks, upload files, read grades).
* **Flexible Assignments**: Supports various formats (code file upload, links, text comments) with configurable deadlines and point systems.
* **Automated Status Checking**: Real-time evaluation of deadlines (marking late submissions if allowed, blocking if disabled).
* **Interactive Dashboard Widgets**: Visual progress bars, color-coded badges, and summary cards.

## 1.9 Benefits
* **For Teachers**: Reduced administration time, organized submissions, central grading console, and simple batch monitoring.
* **For Students**: Clear deadlines, transparent grading metrics, immediate feedback, and simple upload features.
* **For Institutions**: Centralized records, paperless workflows, high security, and low operational overhead.

## 1.10 Technologies Used

### Frontend Stack:
* **UI Library**: React 19 (Vite-based compilation)
* **Language**: TypeScript (strict type checking)
* **Styling**: Tailwind CSS (responsive layouts)
* **State Management**: Redux Toolkit (global state slices)
* **Routing**: React Router DOM v7
* **Form & Validation**: React Hook Form with Zod schema verification
* **HTTP Client**: Axios (with credentials and header interceptors)

### Backend Stack:
* **Core Framework**: Spring Boot 3.3.1 (Java 21)
* **Security**: Spring Security & JSON Web Tokens (JJWT)
* **Data Access**: Spring Data JPA with Hibernate
* **Mapping Utility**: MapStruct 1.5.5.Final
* **Boilerplate Reduction**: Project Lombok 1.18.30
* **Caching Layer**: Spring Data Redis
* **Database**: PostgreSQL
* **Media Provider**: Cloudinary SDK

## 1.11 System Requirements

### Software Requirements:
* **Operating System**: Windows 10/11, macOS, or Linux (Ubuntu 20.04+)
* **Java Development Kit (JDK)**: JDK 21
* **Node.js Environment**: Node.js v18+ & npm v10+
* **Database Systems**: PostgreSQL 15+, Redis 7+
* **Build Systems**: Apache Maven 3.9+, Vite 8+
* **Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge

### Hardware Requirements (Development / Deployment):
* **CPU**: Dual-Core Core i5 / AMD Ryzen 5 or higher
* **RAM**: 8 GB minimum (16 GB recommended for running Backend + Database + Redis + Frontend locally)
* **Disk Space**: 500 MB for source code; additional gigabytes for database growth
* **Network**: Broadband internet connection for CDN assets and Cloudinary file transfers
