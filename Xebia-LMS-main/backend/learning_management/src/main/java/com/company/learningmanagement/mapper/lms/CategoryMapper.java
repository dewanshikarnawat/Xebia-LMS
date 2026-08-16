package com.company.learningmanagement.mapper.lms;

import com.company.learningmanagement.dto.lms.CategoryResponseDTO;
import com.company.learningmanagement.dto.lms.CategoryRequestDTO;
import com.company.learningmanagement.dto.lms.CategoryWiseCourseResponseDTO;
import com.company.learningmanagement.dto.lms.CourseResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CategoryEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryResponseDTO toResponseDTO(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        return CategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .description(entity.getDescription())
                .color(entity.getColor())
                .isActive(entity.getIsActive())
                .logo(entity.getLogo())
                .bannerImage(entity.getBannerImage())
                .backgroundImage(entity.getBackgroundImage())
                .thumbnail(entity.getThumbnail())
                .build();
    }

    public static CategoryResponseDTO toResponseDTOWithCourses(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        
        List<CourseResponseDTO> courseDTOs = null;
        if (entity.getCourses() != null) {
            courseDTOs = entity.getCourses().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.CourseEntity::getId))
                    .map(course -> CourseResponseDTO.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .slug(course.getSlug())
                            .level(course.getLevel())
                            .duration(course.getDuration())
                            .thumbnail(course.getThumbnail())
                            .isActive(course.getIsActive())
                            .build())
                    .collect(Collectors.toList());
        }

        return CategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .courses(courseDTOs)
                .build();
    }

    public static CategoryWiseCourseResponseDTO toCategoryWiseCourseResponseDTO(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CategoryResponseDTO categoryInfo = CategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();

        List<CourseResponseDTO> courseDTOs = null;
        if (entity.getCourses() != null) {
            courseDTOs = entity.getCourses().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.CourseEntity::getId))
                    .map(course -> CourseResponseDTO.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .slug(course.getSlug())
                            .level(course.getLevel())
                            .duration(course.getDuration())
                            .thumbnail(course.getThumbnail())
                            .isActive(course.getIsActive())
                            .build())
                    .collect(Collectors.toList());
        }

        return CategoryWiseCourseResponseDTO.builder()
                .category(categoryInfo)
                .courses(courseDTOs)
                .build();
    }

    public static CategoryEntity toEntity(CategoryRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return CategoryEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .description(dto.getDescription())
                .color(dto.getColor())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .logo(dto.getLogo())
                .bannerImage(dto.getBannerImage())
                .backgroundImage(dto.getBackgroundImage())
                .thumbnail(dto.getThumbnail())
                .build();
    }

    public static void updateEntity(CategoryEntity entity, CategoryRequestDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setIcon(dto.getIcon());
        entity.setDescription(dto.getDescription());
        entity.setColor(dto.getColor());
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        entity.setLogo(dto.getLogo());
        entity.setBannerImage(dto.getBannerImage());
        entity.setBackgroundImage(dto.getBackgroundImage());
        entity.setThumbnail(dto.getThumbnail());
    }
}
