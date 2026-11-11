package com.myschedule.repository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Repository;

import com.myschedule.entity.Schedule;

@Repository
public class InMemoryScheduleRepository implements ScheduleRepository {
	private final ConcurrentHashMap<Long, Schedule> schedules = new ConcurrentHashMap<>();
	private final AtomicLong nextId = new AtomicLong(1);

	@Override
	public Schedule save(Schedule schedule) {
		if (schedule.getId() == null) {
			schedule.setId(nextId.getAndIncrement());
		}
		schedules.put(schedule.getId(), schedule);
		return schedule;
	}

	@Override
	public List<Schedule> findAll() {
		return schedules.values().stream()
				.sorted(Comparator.comparing(Schedule::getDate).thenComparing(Schedule::getTime).thenComparing(Schedule::getId))
				.toList();
	}

	@Override
	public Optional<Schedule> findById(Long id) {
		return Optional.ofNullable(schedules.get(id));
	}

	@Override
	public void deleteById(Long id) {
		schedules.remove(id);
	}

	@Override
	public void deleteAll() {
		schedules.clear();
		nextId.set(1);
	}
}
