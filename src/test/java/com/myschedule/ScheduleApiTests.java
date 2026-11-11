package com.myschedule;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
				.andExpect(jsonPath("$.completed").value(false));

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
	void healthEndpointIsStillAvailable() throws Exception {
		mockMvc.perform(get("/api/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"))
				.andExpect(jsonPath("$.application").value("MySchedule"));
	}
}
