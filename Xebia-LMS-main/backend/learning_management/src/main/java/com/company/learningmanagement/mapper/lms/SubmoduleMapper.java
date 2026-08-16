package com.company.learningmanagement.mapper.lms;

import com.company.learningmanagement.dto.lms.ContentResponseDTO;
import com.company.learningmanagement.dto.lms.ModuleResponseDTO;
import com.company.learningmanagement.dto.lms.SubmoduleRequestDTO;
import com.company.learningmanagement.dto.lms.SubmoduleResponseDTO;
import com.company.learningmanagement.entity.lms.learning.ModuleEntity;
import com.company.learningmanagement.entity.lms.learning.SubmoduleEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SubmoduleMapper {

    public static SubmoduleResponseDTO toResponseDTO(SubmoduleEntity entity) {
        if (entity == null) {
            return null;
        }

        ModuleResponseDTO moduleDTO = null;
        if (entity.getModule() != null) {
            moduleDTO = ModuleResponseDTO.builder()
                    .id(entity.getModule().getId())
                    .title(entity.getModule().getTitle())
                    .build();
        }

        return SubmoduleResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .metaTitle(entity.getMetaTitle())
                .metaDescription(entity.getMetaDescription())
                .canonicalUrl(entity.getCanonicalUrl())
                .ogTitle(entity.getOgTitle())
                .ogDescription(entity.getOgDescription())
                .ogImage(entity.getOgImage())
                .submoduleOrder(entity.getSubmoduleOrder())
                .isActive(entity.getIsActive())
                .slug(entity.getSlug())
                .logo(entity.getLogo())
                .banner(entity.getBanner())
                .backgroundImage(entity.getBackgroundImage())
                .thumbnail(entity.getThumbnail())
                .module(moduleDTO)
                .build();
    }

    public static SubmoduleResponseDTO toResponseDTOWithContents(SubmoduleEntity entity) {
        if (entity == null) {
            return null;
        }

        List<ContentResponseDTO> contentDTOs = null;
        if (entity.getContents() != null) {
            contentDTOs = entity.getContents().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.ContentEntity::getContentOrder))
                    .map(content -> ContentResponseDTO.builder()
                            .id(content.getId())
                            .type(content.getType())
                            .text(content.getText())
                            .code(content.getCode())
                            .language(content.getLanguage())
                            .videoUrl(content.getVideoUrl())
                            .imageUrl(content.getImageUrl())
                            .alt(content.getAlt())
                            .caption(content.getCaption())
                            .title(content.getTitle())
                            .headingLevel(content.getHeadingLevel())
                            .contentOrder(content.getContentOrder())
                            .isActive(content.getIsActive())
                            .build())
                    .collect(Collectors.toList());
        }

        return SubmoduleResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .contents(contentDTOs)
                .build();
    }

    public static SubmoduleEntity toEntity(SubmoduleRequestDTO dto, ModuleEntity module) {
        if (dto == null) {
            return null;
        }
        return SubmoduleEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .metaTitle(dto.getMetaTitle())
                .metaDescription(dto.getMetaDescription())
                .canonicalUrl(dto.getCanonicalUrl())
                .ogTitle(dto.getOgTitle())
                .ogDescription(dto.getOgDescription())
                .ogImage(dto.getOgImage())
                .submoduleOrder(dto.getSubmoduleOrder() != null ? dto.getSubmoduleOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .logo(dto.getLogo())
                .banner(dto.getBanner())
                .backgroundImage(dto.getBackgroundImage())
                .thumbnail(dto.getThumbnail())
                .module(module)
                .slug(dto.getSlug())
                .build();
    }

    public static void updateEntity(SubmoduleEntity entity, SubmoduleRequestDTO dto, ModuleEntity module) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setMetaTitle(dto.getMetaTitle());
        entity.setMetaDescription(dto.getMetaDescription());
        entity.setCanonicalUrl(dto.getCanonicalUrl());
        entity.setOgTitle(dto.getOgTitle());
        entity.setOgDescription(dto.getOgDescription());
        entity.setOgImage(dto.getOgImage());
        if (dto.getSubmoduleOrder() != null) {
            entity.setSubmoduleOrder(dto.getSubmoduleOrder());
        }
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        entity.setLogo(dto.getLogo());
        entity.setBanner(dto.getBanner());
        entity.setBackgroundImage(dto.getBackgroundImage());
        entity.setThumbnail(dto.getThumbnail());
        entity.setModule(module);
        entity.setSlug(dto.getSlug());
    }
}
