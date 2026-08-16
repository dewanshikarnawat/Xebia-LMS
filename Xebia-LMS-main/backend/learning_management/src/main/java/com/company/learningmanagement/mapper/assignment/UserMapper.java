package com.company.learningmanagement.mapper.assignment;

import com.company.learningmanagement.dto.assignment.response.StudentResponse;
import com.company.learningmanagement.dto.assignment.response.TeacherResponse;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    TeacherResponse toTeacherResponse(Teacher teacher);

    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchName", source = "batch.batchName")
    StudentResponse toStudentResponse(Student student);

    List<StudentResponse> toStudentResponseList(List<Student> students);
}
