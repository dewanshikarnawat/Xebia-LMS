package com.company.learningmanagement.mapper.lms;

import com.company.learningmanagement.dto.lms.ContentRequestDTO;
import com.company.learningmanagement.dto.lms.ContentResponseDTO;
import com.company.learningmanagement.dto.lms.SubmoduleResponseDTO;
import com.company.learningmanagement.entity.lms.learning.ContentEntity;
import com.company.learningmanagement.entity.lms.learning.SubmoduleEntity;

public class ContentMapper {

    public static ContentResponseDTO toResponseDTO(ContentEntity entity) {
        if (entity == null) {
            return null;
        }

        SubmoduleResponseDTO submoduleDTO = null;
        if (entity.getSubmodule() != null) {
            submoduleDTO = SubmoduleResponseDTO.builder()
                    .id(entity.getSubmodule().getId())
                    .title(entity.getSubmodule().getTitle())
                    .build();
        }

        return ContentResponseDTO.builder()
                .id(entity.getId())
                .type(entity.getType())
                .text(entity.getText())
                .code(entity.getCode())
                .language(entity.getLanguage())
                .videoUrl(entity.getVideoUrl())
                .imageUrl(entity.getImageUrl())
                .alt(entity.getAlt())
                .caption(entity.getCaption())
                .title(entity.getTitle())
                .headingLevel(entity.getHeadingLevel())
                .contentOrder(entity.getContentOrder())
                .isActive(entity.getIsActive())
                .submodule(submoduleDTO)
                .build();
    }

    public static ContentEntity toEntity(ContentRequestDTO dto, SubmoduleEntity submodule) {
        if (dto == null) {
            return null;
        }
        return ContentEntity.builder()
                .type(dto.getType())
                .text(dto.getText())
                .code(dto.getCode())
                .language(dto.getLanguage())
                .videoUrl(dto.getVideoUrl())
                .imageUrl(dto.getImageUrl())
                .alt(dto.getAlt())
                .caption(dto.getCaption())
                .title(dto.getTitle())
                .headingLevel(dto.getHeadingLevel())
                .contentOrder(dto.getContentOrder() != null ? dto.getContentOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .submodule(submodule)
                .build();
    }

    public static void updateEntity(ContentEntity entity, ContentRequestDTO dto, SubmoduleEntity submodule) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setType(dto.getType());
        entity.setText(dto.getText());
        entity.setCode(dto.getCode());
        entity.setLanguage(dto.getLanguage());
        entity.setVideoUrl(dto.getVideoUrl());
        entity.setImageUrl(dto.getImageUrl());
        entity.setAlt(dto.getAlt());
        entity.setCaption(dto.getCaption());
        entity.setTitle(dto.getTitle());
        entity.setHeadingLevel(dto.getHeadingLevel());
        if (dto.getContentOrder() != null) {
            entity.setContentOrder(dto.getContentOrder());
        }
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        entity.setSubmodule(submodule);
    }
}
