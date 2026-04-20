package com.academic.atelier.util;

import com.academic.atelier.model.Batch;
import com.academic.atelier.model.Course;
import com.academic.atelier.model.User;
import com.academic.atelier.payload.response.BatchDto;
import com.academic.atelier.payload.response.CourseDto;
import com.academic.atelier.payload.response.UserDto;

import java.util.stream.Collectors;

public class DtoMapper {
    public static CourseDto toCourseDto(Course course) {
        if (course == null) return null;
        return CourseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .duration(course.getDuration())
                .description(course.getDescription())
                .build();
    }

    public static UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .isVerified(user.isVerified())
                .build();
    }

    public static BatchDto toBatchDto(Batch batch) {
        if (batch == null) return null;
        return BatchDto.builder()
                .id(batch.getId())
                .name(batch.getName())
                .startTime(batch.getStartTime())
                .endTime(batch.getEndTime())
                .course(toCourseDto(batch.getCourse()))
                .trainer(toUserDto(batch.getTrainer()))
                .students(batch.getStudents() != null ? batch.getStudents().stream().map(DtoMapper::toUserDto).collect(Collectors.toSet()) : null)
                .build();
    }
}
