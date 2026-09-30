package com.company.learningmanagement.mapper.assignment;

import com.company.learningmanagement.dto.assignment.response.SubjectResponse;
import com.company.learningmanagement.entity.assignment.Subject;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubjectMapper {
    SubjectResponse toResponse(Subject subject);
    List<SubjectResponse> toResponseList(List<Subject> subjects);
}
