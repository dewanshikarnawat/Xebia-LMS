package com.company.learningmanagement.mapper.assignment;

import com.company.learningmanagement.dto.assignment.response.SubmissionResponse;
import com.company.learningmanagement.entity.assignment.Submission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {

    @Mapping(target = "assignmentId", source = "assignment.id")
    @Mapping(target = "assignmentTitle", source = "assignment.title")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "studentEmail", source = "student.email")
    @Mapping(target = "studentEnrollment", expression = "java(\"ENR-\" + submission.getStudent().getId())")
    @Mapping(target = "studentBatchName", source = "student.batch.batchName")
    SubmissionResponse toResponse(Submission submission);

    List<SubmissionResponse> toResponseList(List<Submission> submissions);
}
