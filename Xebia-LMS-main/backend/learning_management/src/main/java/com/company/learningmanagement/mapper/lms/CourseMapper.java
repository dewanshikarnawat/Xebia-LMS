package com.company.learningmanagement.mapper.lms;

import com.company.learningmanagement.dto.lms.CategoryResponseDTO;
import com.company.learningmanagement.dto.lms.CourseRequestDTO;
import com.company.learningmanagement.dto.lms.CourseResponseDTO;
import com.company.learningmanagement.dto.lms.ModuleResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CategoryEntity;
import com.company.learningmanagement.entity.lms.learning.CourseEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class CourseMapper {

    private static ModuleResponseDTO mapModuleToResponseDTO(com.company.learningmanagement.entity.lms.learning.ModuleEntity module) {
        if (module == null) return null;
        List<com.company.learningmanagement.dto.lms.SubmoduleResponseDTO> submoduleDTOs = null;
        if (module.getSubmodules() != null) {
            submoduleDTOs = module.getSubmodules().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.SubmoduleEntity::getSubmoduleOrder))
                    .map(CourseMapper::mapSubmoduleToResponseDTO)
                    .collect(Collectors.toList());
        }
        return ModuleResponseDTO.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .moduleOrder(module.getModuleOrder())
                .isActive(module.getIsActive())
                .submodules(submoduleDTOs)
                .build();
    }

    private static com.company.learningmanagement.dto.lms.SubmoduleResponseDTO mapSubmoduleToResponseDTO(com.company.learningmanagement.entity.lms.learning.SubmoduleEntity submodule) {
        if (submodule == null) return null;
        List<com.company.learningmanagement.dto.lms.ContentResponseDTO> contentDTOs = null;
        if (submodule.getContents() != null) {
            contentDTOs = submodule.getContents().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.ContentEntity::getContentOrder))
                    .map(content -> com.company.learningmanagement.dto.lms.ContentResponseDTO.builder()
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
        return com.company.learningmanagement.dto.lms.SubmoduleResponseDTO.builder()
                .id(submodule.getId())
                .title(submodule.getTitle())
                .description(submodule.getDescription())
                .metaTitle(submodule.getMetaTitle())
                .metaDescription(submodule.getMetaDescription())
                .canonicalUrl(submodule.getCanonicalUrl())
                .ogTitle(submodule.getOgTitle())
                .ogDescription(submodule.getOgDescription())
                .ogImage(submodule.getOgImage())
                .submoduleOrder(submodule.getSubmoduleOrder())
                .isActive(submodule.getIsActive())
                .slug(submodule.getSlug())
                .contents(contentDTOs)
                .build();
    }

    public static CourseResponseDTO toResponseDTO(CourseEntity entity) {
        if (entity == null) {
            return null;
        }

        CategoryResponseDTO categoryDTO = null;
        if (entity.getCategory() != null) {
            categoryDTO = CategoryResponseDTO.builder()
                    .id(entity.getCategory().getId())
                    .name(entity.getCategory().getName())
                    .build();
        }

        List<ModuleResponseDTO> moduleDTOs = null;
        if (entity.getModules() != null) {
            moduleDTOs = entity.getModules().stream()
                    .sorted(Comparator.comparing(com.company.learningmanagement.entity.lms.learning.ModuleEntity::getModuleOrder))
                    .map(CourseMapper::mapModuleToResponseDTO)
                    .collect(Collectors.toList());
        }

        return CourseResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .shortDescription(entity.getShortDescription())
                .level(entity.getLevel())
                .language(entity.getLanguage())
                .duration(entity.getDuration())
                .icon(entity.getIcon())
                .thumbnail(entity.getThumbnail())
                .bannerImage(entity.getBannerImage())
                .backgroundImage(entity.getBackgroundImage())
                .isActive(entity.getIsActive())
                .isFeatured(entity.getIsFeatured())
                .metaTitle(entity.getMetaTitle())
                .metaDescription(entity.getMetaDescription())
                .metaKeywords(entity.getMetaKeywords())
                .canonicalUrl(entity.getCanonicalUrl())
                .primaryKeyword(entity.getPrimaryKeyword())
                .secondaryKeywords(entity.getSecondaryKeywords())
                .focusKeywords(entity.getFocusKeywords())
                .robots(entity.getRobots())
                .author(entity.getAuthor())
                .seoCategory(entity.getSeoCategory())
                .seoTags(entity.getSeoTags())
                .ogTitle(entity.getOgTitle())
                .ogDescription(entity.getOgDescription())
                .ogImage(entity.getOgImage())
                .ogUrl(entity.getOgUrl())
                .ogType(entity.getOgType())
                .twitterTitle(entity.getTwitterTitle())
                .twitterDescription(entity.getTwitterDescription())
                .twitterImage(entity.getTwitterImage())
                .twitterCard(entity.getTwitterCard())
                .schemaMarkup(entity.getSchemaMarkup())
                .faqSchema(entity.getFaqSchema())
                .breadcrumbSchema(entity.getBreadcrumbSchema())
                .youtubeVideoUrl(entity.getYoutubeVideoUrl())
                .previewVideoUrl(entity.getPreviewVideoUrl())
                .learningOutcomes(entity.getLearningOutcomes())
                .prerequisites(entity.getPrerequisites())
                .targetAudience(entity.getTargetAudience())
                .courseHighlights(entity.getCourseHighlights())
                .careerOpportunities(entity.getCareerOpportunities())
                .searchIntent(entity.getSearchIntent())
                .semanticKeywords(entity.getSemanticKeywords())
                .relatedTopics(entity.getRelatedTopics())
                .searchSynonyms(entity.getSearchSynonyms())
                .faqContent(entity.getFaqContent())
                .customHeadScript(entity.getCustomHeadScript())
                .customBodyScript(entity.getCustomBodyScript())
                .totalViews(entity.getTotalViews())
                .totalClicks(entity.getTotalClicks())
                .ctr(entity.getCtr())
                .seoScore(entity.getSeoScore())
                .isPublished(entity.getIsPublished())
                .allowIndexing(entity.getAllowIndexing())
                .showInSearch(entity.getShowInSearch())
                .category(categoryDTO)
                .modules(moduleDTOs)
                .build();
    }

    public static CourseResponseDTO toResponseDTOWithModules(CourseEntity entity) {
        return toResponseDTO(entity);
    }

    public static CourseEntity toEntity(CourseRequestDTO dto, CategoryEntity category) {
        if (dto == null) {
            return null;
        }
        return CourseEntity.builder()
                .title(dto.getTitle())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .shortDescription(dto.getShortDescription())
                .level(dto.getLevel())
                .language(dto.getLanguage())
                .duration(dto.getDuration())
                .icon(dto.getIcon())
                .thumbnail(dto.getThumbnail())
                .bannerImage(dto.getBannerImage())
                .backgroundImage(dto.getBackgroundImage())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .isFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false)
                .metaTitle(dto.getMetaTitle())
                .metaDescription(dto.getMetaDescription())
                .metaKeywords(dto.getMetaKeywords())
                .canonicalUrl(dto.getCanonicalUrl())
                .primaryKeyword(dto.getPrimaryKeyword())
                .secondaryKeywords(dto.getSecondaryKeywords())
                .focusKeywords(dto.getFocusKeywords())
                .robots(dto.getRobots() != null ? dto.getRobots() : "index, follow")
                .author(dto.getAuthor())
                .seoCategory(dto.getSeoCategory())
                .seoTags(dto.getSeoTags())
                .ogTitle(dto.getOgTitle())
                .ogDescription(dto.getOgDescription())
                .ogImage(dto.getOgImage())
                .ogUrl(dto.getOgUrl())
                .ogType(dto.getOgType() != null ? dto.getOgType() : "website")
                .twitterTitle(dto.getTwitterTitle())
                .twitterDescription(dto.getTwitterDescription())
                .twitterImage(dto.getTwitterImage())
                .twitterCard(dto.getTwitterCard() != null ? dto.getTwitterCard() : "summary_large_image")
                .schemaMarkup(dto.getSchemaMarkup())
                .faqSchema(dto.getFaqSchema())
                .breadcrumbSchema(dto.getBreadcrumbSchema())
                .youtubeVideoUrl(dto.getYoutubeVideoUrl())
                .previewVideoUrl(dto.getPreviewVideoUrl())
                .learningOutcomes(dto.getLearningOutcomes())
                .prerequisites(dto.getPrerequisites())
                .targetAudience(dto.getTargetAudience())
                .courseHighlights(dto.getCourseHighlights())
                .careerOpportunities(dto.getCareerOpportunities())
                .searchIntent(dto.getSearchIntent())
                .semanticKeywords(dto.getSemanticKeywords())
                .relatedTopics(dto.getRelatedTopics())
                .searchSynonyms(dto.getSearchSynonyms())
                .faqContent(dto.getFaqContent())
                .customHeadScript(dto.getCustomHeadScript())
                .customBodyScript(dto.getCustomBodyScript())
                .totalViews(dto.getTotalViews() != null ? dto.getTotalViews() : 0L)
                .totalClicks(dto.getTotalClicks() != null ? dto.getTotalClicks() : 0L)
                .ctr(dto.getCtr() != null ? dto.getCtr() : 0.0)
                .seoScore(dto.getSeoScore() != null ? dto.getSeoScore() : 0)
                .isPublished(dto.getIsPublished() != null ? dto.getIsPublished() : false)
                .allowIndexing(dto.getAllowIndexing() != null ? dto.getAllowIndexing() : true)
                .showInSearch(dto.getShowInSearch() != null ? dto.getShowInSearch() : true)
                .category(category)
                .build();
    }

    public static void updateEntity(CourseEntity entity, CourseRequestDTO dto, CategoryEntity category) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setTitle(dto.getTitle());
        entity.setSlug(dto.getSlug());
        entity.setDescription(dto.getDescription());
        entity.setShortDescription(dto.getShortDescription());
        entity.setLevel(dto.getLevel());
        entity.setLanguage(dto.getLanguage());
        entity.setDuration(dto.getDuration());
        entity.setIcon(dto.getIcon());
        entity.setThumbnail(dto.getThumbnail());
        entity.setBannerImage(dto.getBannerImage());
        entity.setBackgroundImage(dto.getBackgroundImage());
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
        if (dto.getIsFeatured() != null) {
            entity.setIsFeatured(dto.getIsFeatured());
        }
        entity.setMetaTitle(dto.getMetaTitle());
        entity.setMetaDescription(dto.getMetaDescription());
        entity.setMetaKeywords(dto.getMetaKeywords());
        entity.setCanonicalUrl(dto.getCanonicalUrl());
        entity.setPrimaryKeyword(dto.getPrimaryKeyword());
        entity.setSecondaryKeywords(dto.getSecondaryKeywords());
        entity.setFocusKeywords(dto.getFocusKeywords());
        if (dto.getRobots() != null) {
            entity.setRobots(dto.getRobots());
        }
        entity.setAuthor(dto.getAuthor());
        entity.setSeoCategory(dto.getSeoCategory());
        entity.setSeoTags(dto.getSeoTags());
        entity.setOgTitle(dto.getOgTitle());
        entity.setOgDescription(dto.getOgDescription());
        entity.setOgImage(dto.getOgImage());
        entity.setOgUrl(dto.getOgUrl());
        if (dto.getOgType() != null) {
            entity.setOgType(dto.getOgType());
        }
        entity.setTwitterTitle(dto.getTwitterTitle());
        entity.setTwitterDescription(dto.getTwitterDescription());
        entity.setTwitterImage(dto.getTwitterImage());
        if (dto.getTwitterCard() != null) {
            entity.setTwitterCard(dto.getTwitterCard());
        }
        entity.setSchemaMarkup(dto.getSchemaMarkup());
        entity.setFaqSchema(dto.getFaqSchema());
        entity.setBreadcrumbSchema(dto.getBreadcrumbSchema());
        entity.setYoutubeVideoUrl(dto.getYoutubeVideoUrl());
        entity.setPreviewVideoUrl(dto.getPreviewVideoUrl());
        entity.setLearningOutcomes(dto.getLearningOutcomes());
        entity.setPrerequisites(dto.getPrerequisites());
        entity.setTargetAudience(dto.getTargetAudience());
        entity.setCourseHighlights(dto.getCourseHighlights());
        entity.setCareerOpportunities(dto.getCareerOpportunities());
        entity.setSearchIntent(dto.getSearchIntent());
        entity.setSemanticKeywords(dto.getSemanticKeywords());
        entity.setRelatedTopics(dto.getRelatedTopics());
        entity.setSearchSynonyms(dto.getSearchSynonyms());
        entity.setFaqContent(dto.getFaqContent());
        entity.setCustomHeadScript(dto.getCustomHeadScript());
        entity.setCustomBodyScript(dto.getCustomBodyScript());
        if (dto.getTotalViews() != null) {
            entity.setTotalViews(dto.getTotalViews());
        }
        if (dto.getTotalClicks() != null) {
            entity.setTotalClicks(dto.getTotalClicks());
        }
        if (dto.getCtr() != null) {
            entity.setCtr(dto.getCtr());
        }
        if (dto.getSeoScore() != null) {
            entity.setSeoScore(dto.getSeoScore());
        }
        if (dto.getIsPublished() != null) {
            entity.setIsPublished(dto.getIsPublished());
        }
        if (dto.getAllowIndexing() != null) {
            entity.setAllowIndexing(dto.getAllowIndexing());
        }
        if (dto.getShowInSearch() != null) {
            entity.setShowInSearch(dto.getShowInSearch());
        }
        entity.setCategory(category);
    }
}
