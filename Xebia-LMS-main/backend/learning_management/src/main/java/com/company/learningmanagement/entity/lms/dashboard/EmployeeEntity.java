package com.company.learningmanagement.entity.lms.dashboard;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeCode;

    @Column(nullable = false)
    private String name;

    private String email;
    private String region;
    private String location;
    private String businessUnit;
    private String department;
    private String project;
    private String practice;
    private String employeeGrade;
    private LocalDateTime joiningDate;

    @Builder.Default
    private Boolean active = true;
}
