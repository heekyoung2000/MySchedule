package com.myschedule.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import com.myschedule.dto.CompletionRequest;
import com.myschedule.dto.ScheduleRequest;
import com.myschedule.dto.ScheduleResponse;
import com.myschedule.service.ScheduleService;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {
	private final ScheduleService scheduleService;

	public ScheduleController(ScheduleService scheduleService) {
		this.scheduleService = scheduleService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ScheduleResponse create(@Valid @RequestBody ScheduleRequest request) {
		return scheduleService.create(request);
	}

	@GetMapping
	public List<ScheduleResponse> findAll() {
		return scheduleService.findAll();
	}

	@GetMapping("/{id}")
	public ScheduleResponse findById(@PathVariable Long id) {
		return scheduleService.findById(id);
	}

	@PutMapping("/{id}")
	public ScheduleResponse update(@PathVariable Long id, @Valid @RequestBody ScheduleRequest request) {
		return scheduleService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		scheduleService.delete(id);
	}

	@PatchMapping("/{id}/completion")
	public ScheduleResponse setCompletion(@PathVariable Long id, @Valid @RequestBody CompletionRequest request) {
		return scheduleService.setCompletion(id, request.completed());
	}
}
