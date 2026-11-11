package com.myschedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleResponse(Long id, String title, String description, LocalDate date, LocalTime time,
		String priority, boolean completed) {
}
