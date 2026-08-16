package com.company.learningmanagement.config;

import com.company.learningmanagement.entity.assignment.Subject;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.repository.assignment.SubjectRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail("teacher@example.com");
        Teacher teacher;
        if (teacherOpt.isEmpty()) {
            teacher = Teacher.builder()
                    .fullName("Seed Teacher")
                    .email("teacher@example.com")
                    .password(passwordEncoder.encode("Password@123"))
                    .role(Role.TEACHER)
                    .build();
            teacher = teacherRepository.save(teacher);
        } else {
            teacher = teacherOpt.get();
        }

        // Create a seed student if not present
        Optional<Student> studentOpt = studentRepository.findByEmail("student@example.com");
        if (studentOpt.isEmpty()) {
            Student student = Student.builder()
                    .fullName("Seed Student")
                    .email("student@example.com")
                    .password(passwordEncoder.encode("Password@123"))
                    .role(Role.STUDENT)
                    .build();
            studentRepository.save(student);
        }

        if (studentRepository.findByEmail("aarav.sharma@xebia.com").isEmpty()) {
            Student aarav = Student.builder()
                    .fullName("Aarav Sharma")
                    .email("aarav.sharma@xebia.com")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .build();
            studentRepository.save(aarav);
        }

        // Seed LMS mock users
        if (teacherRepository.findByEmail("admin@xebia.com").isEmpty() && studentRepository.findByEmail("admin@xebia.com").isEmpty()) {
            Teacher admin = Teacher.builder()
                    .fullName("Sarah Chen")
                    .email("admin@xebia.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            teacherRepository.save(admin);
        }

        if (teacherRepository.findByEmail("instructor@xebia.com").isEmpty() && studentRepository.findByEmail("instructor@xebia.com").isEmpty()) {
            Teacher instructor = Teacher.builder()
                    .fullName("Priya Sharma")
                    .email("instructor@xebia.com")
                    .password(passwordEncoder.encode("instructor123"))
                    .role(Role.TEACHER)
                    .build();
            teacherRepository.save(instructor);
        }

        List<Subject> subjectsToSeed = List.of(
                Subject.builder().subjectCode("CS301").subjectName("Database Management System").semester("Semester 5").department("Computer Science").build(),
                Subject.builder().subjectCode("CS302").subjectName("Operating System").semester("Semester 4").department("Computer Science").build(),
                Subject.builder().subjectCode("CS303").subjectName("Computer Networks").semester("Semester 5").department("Computer Science").build(),
                Subject.builder().subjectCode("CS304").subjectName("Software Engineering").semester("Semester 4").department("Computer Science").build(),
                Subject.builder().subjectCode("CS305").subjectName("Data Structures and Algorithms").semester("Semester 3").department("Computer Science").build(),
                Subject.builder().subjectCode("CS306").subjectName("Artificial Intelligence").semester("Semester 7").department("Computer Science").build(),
                Subject.builder().subjectCode("CS307").subjectName("Machine Learning").semester("Semester 7").department("Computer Science").build(),
                Subject.builder().subjectCode("CS308").subjectName("Java Programming").semester("Semester 3").department("Computer Science").build(),
                Subject.builder().subjectCode("CS309").subjectName("Python Programming").semester("Semester 2").department("Computer Science").build(),
                Subject.builder().subjectCode("CS310").subjectName("Web Development").semester("Semester 5").department("Computer Science").build(),
                Subject.builder().subjectCode("CS311").subjectName("Compiler Design").semester("Semester 6").department("Computer Science").build(),
                Subject.builder().subjectCode("CS312").subjectName("Cloud Computing").semester("Semester 6").department("Computer Science").build()
        );

        List<Subject> teacherSubjects = new ArrayList<>(teacher.getSubjects());
        boolean modified = false;

        for (Subject sSeed : subjectsToSeed) {
            Optional<Subject> existingOpt = subjectRepository.findBySubjectCode(sSeed.getSubjectCode());
            Subject subject;
            if (existingOpt.isEmpty()) {
                subject = subjectRepository.save(sSeed);
            } else {
                subject = existingOpt.get();
            }

            if (!teacherSubjects.contains(subject)) {
                teacherSubjects.add(subject);
                modified = true;
            }
        }

        if (modified) {
            teacher.setSubjects(teacherSubjects);
            teacherRepository.save(teacher);
        }
    }
}
