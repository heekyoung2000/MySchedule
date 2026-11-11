package com.myschedule;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.nullValue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import com.myschedule.repository.ScheduleRepository;

@SpringBootTest
@AutoConfigureMockMvc
class ScheduleApiTests {
	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ScheduleRepository scheduleRepository;

	@BeforeEach
	void clearSchedules() {
		scheduleRepository.deleteAll();
	}

	@Test
	void scheduleCrudAndCompletionLifecycle() throws Exception {
		String createRequest = """
				{"title":"기획 회의","description":"주간 계획","date":"2026-11-11","time":"10:30","priority":"high"}
				""";

		mockMvc.perform(post("/api/schedules").contentType(MediaType.APPLICATION_JSON).content(createRequest))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(jsonPath("$.title").value("기획 회의"))
				.andExpect(jsonPath("$.completed").value(false))
				.andExpect(jsonPath("$.timeUnspecified").value(false));

		mockMvc.perform(get("/api/schedules"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].title").value("기획 회의"));

		mockMvc.perform(get("/api/schedules/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.description").value("주간 계획"));

		String updateRequest = """
				{"title":"수정된 회의","description":"변경 내용","date":"2026-11-12","time":"11:00","priority":"normal"}
				""";
		mockMvc.perform(put("/api/schedules/1").contentType(MediaType.APPLICATION_JSON).content(updateRequest))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("수정된 회의"))
				.andExpect(jsonPath("$.date").value("2026-11-12"));

		mockMvc.perform(patch("/api/schedules/1/completion").contentType(MediaType.APPLICATION_JSON)
				.content("{\"completed\":true}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.completed").value(true));

		mockMvc.perform(delete("/api/schedules/1")).andExpect(status().isNoContent());
		mockMvc.perform(get("/api/schedules/1")).andExpect(status().isNotFound());
		mockMvc.perform(get("/api/schedules")).andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
	}

	@Test
	void supportsUnspecifiedAndTimedSchedulesAndTransitions() throws Exception {
		String unspecified = """
				{"title":"시간 없는 일정","description":"설명","date":"2026-11-12","time":null,"endTime":null,"timeUnspecified":true,"priority":"normal"}
				""";
		mockMvc.perform(post("/api/schedules").contentType(MediaType.APPLICATION_JSON).content(unspecified))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.timeUnspecified").value(true))
				.andExpect(jsonPath("$.time").value(nullValue())).andExpect(jsonPath("$.endTime").value(nullValue()));

		String timed = """
				{"title":"시간 지정 일정","description":"설명","date":"2026-11-12","time":"09:00","endTime":"10:00","timeUnspecified":false,"priority":"high"}
				""";
		mockMvc.perform(post("/api/schedules").contentType(MediaType.APPLICATION_JSON).content(timed))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.timeUnspecified").value(false))
				.andExpect(jsonPath("$.time").value("09:00:00")).andExpect(jsonPath("$.endTime").value("10:00:00"));
		mockMvc.perform(put("/api/schedules/1").contentType(MediaType.APPLICATION_JSON).content(timed))
				.andExpect(status().isOk()).andExpect(jsonPath("$.timeUnspecified").value(false))
				.andExpect(jsonPath("$.time").value("09:00:00")).andExpect(jsonPath("$.endTime").value("10:00:00"));
		mockMvc.perform(put("/api/schedules/1").contentType(MediaType.APPLICATION_JSON).content(unspecified))
				.andExpect(status().isOk()).andExpect(jsonPath("$.timeUnspecified").value(true));
		mockMvc.perform(patch("/api/schedules/1/completion").contentType(MediaType.APPLICATION_JSON)
				.content("{\"completed\":true}"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.completed").value(true));
		mockMvc.perform(delete("/api/schedules/1")).andExpect(status().isNoContent());
		mockMvc.perform(delete("/api/schedules/2")).andExpect(status().isNoContent());
	}

	@Test
	void rejectsInvalidTimeConfigurations() throws Exception {
		String missingTimes = """
				{"title":"일정","date":"2026-11-12","time":null,"endTime":null,"timeUnspecified":false,"priority":"normal"}
				""";
		String reversedTimes = """
				{"title":"일정","date":"2026-11-12","time":"10:00","endTime":"09:00","timeUnspecified":false,"priority":"normal"}
				""";
		String timesOnUnspecified = """
				{"title":"일정","date":"2026-11-12","time":"10:00","endTime":null,"timeUnspecified":true,"priority":"normal"}
				""";
		mockMvc.perform(post("/api/schedules").contentType(MediaType.APPLICATION_JSON).content(missingTimes)).andExpect(status().isBadRequest());
		mockMvc.perform(post("/api/schedules").contentType(MediaType.APPLICATION_JSON).content(reversedTimes)).andExpect(status().isBadRequest());
		mockMvc.perform(post("/api/schedules").contentType(MediaType.APPLICATION_JSON).content(timesOnUnspecified)).andExpect(status().isBadRequest());
	}

	@Test
	void healthEndpointIsStillAvailable() throws Exception {
		mockMvc.perform(get("/api/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"))
				.andExpect(jsonPath("$.application").value("MySchedule"));
	}
}
