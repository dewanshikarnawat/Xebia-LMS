package com.company.learningmanagement.mapper.assignment;

import com.company.learningmanagement.dto.assignment.request.QuestionRequest;
import com.company.learningmanagement.dto.assignment.response.QuestionResponse;
import com.company.learningmanagement.entity.assignment.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(target = "assignmentId", source = "assignment.id")
    QuestionResponse toResponse(Question question);

    List<QuestionResponse> toResponseList(List<Question> questions);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "assignment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Question toEntity(QuestionRequest request);
}
