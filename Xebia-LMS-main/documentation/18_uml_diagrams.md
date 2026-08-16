# 18. UML Diagrams

This section presents the Unified Modeling Language (UML) specifications mapping structural elements, actors, deployment topologies, and workflows in the **XAMS** portal, rendered using Mermaid.

---

## 18.1 Use Case Diagram

Defines the interactions between Student and Teacher actors and the system's core features:

```mermaid
left-to-right-direction
graph TD
    Teacher((Teacher Actor))
    Student((Student Actor))

    subgraph Authentication_Module
        UC_Register[Register Account]
        UC_Login[Login Portal]
        UC_Profile[Manage Profile]
    end

    subgraph Teacher_Workspace
        UC_CreateBatch[Create Batch]
        UC_AddStudent[Enroll Student]
        UC_CreateAssignment[Create Assignment]
        UC_GradeSubmission[Review & Grade Submission]
    end

    subgraph Student_Workspace
        UC_ViewAssignments[View Assigned Tasks]
        UC_SubmitAssignment[Submit File Solution]
        UC_ViewProgress[View Progress & Grades]
    end

    Teacher --> UC_Register
    Teacher --> UC_Login
    Teacher --> UC_Profile
    Teacher --> UC_CreateBatch
    Teacher --> UC_AddStudent
    Teacher --> UC_CreateAssignment
    Teacher --> UC_GradeSubmission

    Student --> UC_Register
    Student --> UC_Login
    Student --> UC_Profile
    Student --> UC_ViewAssignments
    Student --> UC_SubmitAssignment
    Student --> UC_ViewProgress
```

---

## 18.2 Class Diagram

Represents the core entity model in the database layer and their properties:

```mermaid
classDiagram
    class Teacher {
        +Long id
        +String fullName
        +String email
        +String password
        +String phone
        +Role role
        +List~Batch~ batches
        +List~Assignment~ assignments
    }

    class Student {
        +Long id
        +String fullName
        +String email
        +String password
        +String phone
        +Role role
        +Batch batch
        +List~Submission~ submissions
    }

    class Batch {
        +Long id
        +String batchName
        +String description
        +Teacher teacher
        +List~Student~ students
    }

    class Assignment {
        +Long id
        +String title
        +String description
        +String instructions
        +AssignmentType assignmentType
        +String subject
        +String topic
        +Batch batch
        +Teacher teacher
        +String resourceUrl
        +Double totalMarks
        +Double passingMarks
        +LocalDate dueDate
        +LocalTime dueTime
        +Boolean lateSubmissionAllowed
        +Long maxFileSize
        +AssignmentStatus status
        +List~Submission~ submissions
    }

    class Submission {
        +Long id
        +Assignment assignment
        +Student student
        +String submissionUrl
        +String comment
        +LocalDateTime submittedAt
        +Double marks
        +String feedback
        +SubmissionStatus status
        +LocalDateTime reviewedAt
    }

    Teacher "1" --o "*" Batch : creates
    Teacher "1" --o "*" Assignment : publishes
    Batch "1" --o "*" Student : contains
    Batch "1" --o "*" Assignment : receives
    Student "1" --o "*" Submission : uploads
    Assignment "1" --o "*" Submission : holds
```

---

## 18.3 Activity Diagram (Submission Lifecycle)

Illustrates the flow of checking deadlines, validations, and status updates:

```mermaid
stateDiagram-v2
    [*] --> Student_Portal : Logged In
    Student_Portal --> View_Assignments
    View_Assignments --> Select_Assignment
    
    state Check_Deadline <<choice>>
    Select_Assignment --> Check_Deadline : Current Time Check
    
    Check_Deadline --> Upload_Blocked : Time > DueDate AND LateAllowed == False
    Check_Deadline --> Open_Uploader : Time <= DueDate OR LateAllowed == True
    
    state File_Validation <<choice>>
    Open_Uploader --> File_Selection
    File_Selection --> File_Validation : Upload Triggered
    
    File_Validation --> Show_Error : File Size > MaxFileSize Limit
    File_Validation --> Cloud_Upload : Validation Passed
    
    Cloud_Upload --> Database_Insert : Upload Success
    Database_Insert --> [*] : Status = SUBMITTED
    Upload_Blocked --> [*]
```

---

## 18.4 Component Diagram

Maps the structural components and third-party integrations:

```mermaid
graph LR
    subgraph Client_Side
        ReactApp[React SPA]
        ReduxStore[Redux Slices]
        AxiosClient[Axios API Client]
        ReactApp --> ReduxStore
        ReactApp --> AxiosClient
    end

    subgraph Backend_Server
        SpringSec[Spring Security]
        RestController[REST Controllers]
        Services[Business Services]
        Repos[JPA Repositories]
        
        SpringSec --> RestController
        RestController --> Services
        Services --> Repos
    end

    subgraph Infrastructure
        Postgres[(PostgreSQL DB)]
        Redis[(Redis Caching)]
        Cloudinary[Cloudinary API]
    end

    AxiosClient -->|HTTPS JSON| SpringSec
    Repos -->|SQL JDBC| Postgres
    Services -->|Cache Keys| Redis
    Services -->|Multipart Upload| Cloudinary
```
