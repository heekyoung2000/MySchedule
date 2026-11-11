package com.myschedule.repository;

import java.util.List;
import java.util.Optional;

import com.myschedule.entity.Schedule;

public interface ScheduleRepository {
	Schedule save(Schedule schedule);
	List<Schedule> findAll();
	Optional<Schedule> findById(Long id);
	void deleteById(Long id);
	void deleteAll();
}
