package com.company.learningmanagement.mapper.assignment;

import com.company.learningmanagement.dto.assignment.response.CertificateResponse;
import com.company.learningmanagement.entity.assignment.Certificate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CertificateMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "assignmentId", source = "assignment.id")
    @Mapping(target = "assignmentTitle", source = "assignment.title")
    @Mapping(target = "quizId", source = "quiz.id")
    @Mapping(target = "quizTitle", source = "quiz.title")
    CertificateResponse toResponse(Certificate certificate);

    List<CertificateResponse> toResponseList(List<Certificate> certificates);
}
