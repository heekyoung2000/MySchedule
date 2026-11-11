package com.myschedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ScheduleRequest(
		@NotBlank @Size(max = 80) String title,
		@Size(max = 240) String description,
		@NotNull LocalDate date,
		@NotNull LocalTime time,
		@NotBlank @Pattern(regexp = "high|normal|low") String priority) {
}
