package com.myschedule.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.myschedule.dto.ScheduleRequest;
import com.myschedule.dto.ScheduleResponse;
import com.myschedule.entity.Schedule;
import com.myschedule.repository.ScheduleRepository;

@Service
public class ScheduleService {
	private final ScheduleRepository scheduleRepository;

	public ScheduleService(ScheduleRepository scheduleRepository) {
		this.scheduleRepository = scheduleRepository;
	}

	public ScheduleResponse create(ScheduleRequest request) {
		Schedule schedule = new Schedule(null, request.title().trim(), normalizeDescription(request.description()),
				request.date(), request.time(), request.priority(), false);
		return toResponse(scheduleRepository.save(schedule));
	}

	public List<ScheduleResponse> findAll() {
		return scheduleRepository.findAll().stream().map(this::toResponse).toList();
	}

	public ScheduleResponse findById(Long id) {
		return toResponse(getSchedule(id));
	}

	public ScheduleResponse update(Long id, ScheduleRequest request) {
		Schedule schedule = getSchedule(id);
		schedule.setTitle(request.title().trim());
		schedule.setDescription(normalizeDescription(request.description()));
		schedule.setDate(request.date());
		schedule.setTime(request.time());
		schedule.setPriority(request.priority());
		return toResponse(scheduleRepository.save(schedule));
	}

	public void delete(Long id) {
		getSchedule(id);
		scheduleRepository.deleteById(id);
	}

	public ScheduleResponse setCompletion(Long id, boolean completed) {
		Schedule schedule = getSchedule(id);
		schedule.setCompleted(completed);
		return toResponse(scheduleRepository.save(schedule));
	}

	private Schedule getSchedule(Long id) {
		return scheduleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다."));
	}

	private String normalizeDescription(String description) {
		return description == null ? "" : description.trim();
	}

	private ScheduleResponse toResponse(Schedule schedule) {
		return new ScheduleResponse(schedule.getId(), schedule.getTitle(), schedule.getDescription(), schedule.getDate(),
				schedule.getTime(), schedule.getPriority(), schedule.isCompleted());
	}
}
