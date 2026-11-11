package com.myschedule.entity;

import java.time.LocalDate;
import java.time.LocalTime;

public class Schedule {
	private Long id;
	private String title;
	private String description;
	private LocalDate date;
	private LocalTime time;
	private LocalTime endTime;
	private Boolean timeUnspecified;
	private String priority;
	private boolean completed;

	public Schedule(Long id, String title, String description, LocalDate date, LocalTime time, String priority, boolean completed) {
		this(id, title, description, date, time, null, time == null, priority, completed);
	}

	public Schedule(Long id, String title, String description, LocalDate date, LocalTime time, LocalTime endTime,
			Boolean timeUnspecified, String priority, boolean completed) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.date = date;
		this.time = time;
		this.endTime = endTime;
		this.timeUnspecified = timeUnspecified;
		this.priority = priority;
		this.completed = completed;
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public LocalDate getDate() { return date; }
	public void setDate(LocalDate date) { this.date = date; }
	public LocalTime getTime() { return time; }
	public void setTime(LocalTime time) { this.time = time; }
	public LocalTime getEndTime() { return endTime; }
	public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
	public boolean isTimeUnspecified() { return timeUnspecified != null ? timeUnspecified : time == null; }
	public void setTimeUnspecified(Boolean timeUnspecified) { this.timeUnspecified = timeUnspecified; }
	public String getPriority() { return priority; }
	public void setPriority(String priority) { this.priority = priority; }
	public boolean isCompleted() { return completed; }
	public void setCompleted(boolean completed) { this.completed = completed; }
}
