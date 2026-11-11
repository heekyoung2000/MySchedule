package com.myschedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ScheduleRequest(
		@NotBlank @Size(max = 80) String title,
		@Size(max = 240) String description,
		@NotNull LocalDate date,
		LocalTime time,
		LocalTime endTime,
		Boolean timeUnspecified,
		@NotBlank @Pattern(regexp = "high|normal|low") String priority) {

	public boolean resolvedTimeUnspecified() {
		// Older clients did not send this flag; infer their intent from the start time.
		return timeUnspecified != null ? timeUnspecified : time == null;
	}

	@AssertTrue(message = "시간 미설정 일정은 시작·종료 시간을 비워야 하며, 시간 지정 일정의 종료 시간은 시작 시간보다 늦어야 합니다.")
	public boolean isTimeConfigurationValid() {
		if (Boolean.TRUE.equals(timeUnspecified)) return time == null && endTime == null;
		if (Boolean.FALSE.equals(timeUnspecified)) return time != null && endTime != null && endTime.isAfter(time);
		// Keep accepting the legacy API shape, which had a required start time and no end time.
		if (endTime == null) return true;
		return time != null && endTime.isAfter(time);
	}
}
