package com.company.learningmanagement.mapper.lms;

import com.company.learningmanagement.dto.lms.CourseResponseDTO;
import com.company.learningmanagement.dto.lms.ModuleRequestDTO;
import com.company.learningmanagement.dto.lms.ModuleResponseDTO;
import com.company.learningmanagement.dto.lms.SubmoduleResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import com.company.learningmanagement.entity.lms.learning.ModuleEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ModuleMapper {

    public static ModuleResponseDTO toResponseDTO(ModuleEntity entity) {
        if (entity == null) {
            return null;
        }

        CourseResponseDTO courseDTO = null;
        if (entity.getCourse() != null) {
            courseDTO = CourseResponseDTO.builder()
                    .id(entity.getCourse().getId())
                    .title(entity.getCourse().getTitle())
                    .build();
        }

        return ModuleResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .moduleOrder(entity.getModuleOrder())
                .isActive(entity.getIsActive())
                .logo(entity.getLogo())
                .banner(entity.getBanner())
                .backgroundImage(entity.getBackgroundImage())
                .thumbnail(entity.getThumbnail())
                .course(courseDTO)
                .build();
    }

    public static ModuleResponseDTO toResponseDTOWithSubmodules(ModuleEntity entity) {
        if (entity == null) {
            return null;
        }

        List<SubmoduleResponseDTO> submoduleDTOs = null;
        if (entity.getSubmodules() != null) {
            submoduleDTOs = entity.getSubmodules().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.SubmoduleEntity::getSubmoduleOrder))
                    .map(submodule -> SubmoduleResponseDTO.builder()
                            .id(submodule.getId())
                            .title(submodule.getTitle())
                            .submoduleOrder(submodule.getSubmoduleOrder())
                            .build())
                    .collect(Collectors.toList());
        }

        return ModuleResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .submodules(submoduleDTOs)
                .build();
    }

    public static ModuleEntity toEntity(ModuleRequestDTO dto, CourseEntity course) {
        if (dto == null) {
            return null;
        }
        return ModuleEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .moduleOrder(dto.getModuleOrder() != null ? dto.getModuleOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .logo(dto.getLogo())
                .banner(dto.getBanner())
                .backgroundImage(dto.getBackgroundImage())
                .thumbnail(dto.getThumbnail())
                .course(course)
                .build();
    }

    public static void updateEntity(ModuleEntity entity, ModuleRequestDTO dto, CourseEntity course) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        if (dto.getModuleOrder() != null) {
            entity.setModuleOrder(dto.getModuleOrder());
        }
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        entity.setLogo(dto.getLogo());
        entity.setBanner(dto.getBanner());
        entity.setBackgroundImage(dto.getBackgroundImage());
        entity.setThumbnail(dto.getThumbnail());
        entity.setCourse(course);
    }
}
