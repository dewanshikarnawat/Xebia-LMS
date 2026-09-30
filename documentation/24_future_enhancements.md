# 24. Future Project Roadmap

This section outlines proposed enhancements to expand the features, security, and scalability of **XAMS**.

---

## 24.1 AI-Powered Enhancements

### 1. Automated Grading Assistant
* **Implementation**: Integrate the **Gemini API** in the backend service layer.
* **Workflow**: When a student uploads a submission, the grading assistant compares the submission text/code against the assignment rubrics. It generates a suggested score and draft feedback for the teacher to review and approve, reducing grading time by up to 50%.

### 2. Smart Plagiarism Checker
* **Implementation**: Integrate a plagiarism detection engine (e.g., MOSS for code files, or similarity checker APIs for document uploads).
* **Workflow**: The system compares new submissions against all existing peer files in the database, flagging matching code lines or text paragraphs to ensure academic integrity.

---

## 24.2 Real-Time Notifications & Collaboration

### 1. Email Notifications (Spring Mail / SendGrid)
* **Goal**: Send automated email notifications:
  * To Students: When a teacher publishes a new assignment or completes grading.
  * To Teachers: When a student submits an assignment late.

### 2. Real-Time Alerts using WebSockets
* **Goal**: Implement live, browser-based notifications.
* **Workflow**: Integrate Spring WebSockets and STOMP protocols to push real-time alerts to active student and teacher dashboards without requiring page refreshes.

---

## 24.3 Advanced Metrics & Reporting

### 1. Interactive Performance Reports
* **Features**: Add export options (CSV, Excel, PDF) to the Teacher Dashboard to generate batch report cards.
* **Charts**: Expand progress charts with interactive filters to show grade distributions, pass/fail ratios, and student performance comparisons.

### 2. Code Execution Sandbox
* **Goal**: Allow students to test coding submissions directly in the browser.
* **Workflow**: Implement a secure Docker execution sandbox in the backend to compile, run, and verify programming code submissions against unit test cases.
