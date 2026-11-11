# MySchedule

개인 일정과 생산성을 관리하는 웹 애플리케이션입니다. 한국어 대시보드와 월간 캘린더에서 일정을 관리할 수 있습니다.

## 기술 스택

- Java 21
- Spring Boot 4.1.2
- Maven Wrapper
- Spring MVC 및 Validation
- HTML, CSS, JavaScript
- 일정 데이터 저장: 애플리케이션 메모리 (재시작 시 초기화)
- MySQL 연동: 미구현

## 주요 기능

- 일정 등록, 목록 및 상세 조회, 수정, 삭제
- 일정 완료 여부 변경
- 월간 캘린더와 일정 요약 대시보드
- Mock Data 없이 REST API와 연동하는 정적 웹 UI

## 실행

JDK 21을 설치하고 `JAVA_HOME`을 설정한 후 프로젝트 루트에서 실행합니다.

```powershell
.\mvnw.cmd clean package
.\mvnw.cmd spring-boot:run
```

- 웹 화면: <http://localhost:8080/>
- Health API: <http://localhost:8080/api/health>

## 일정 API

| Method | Path | 설명 |
| --- | --- | --- |
| `POST` | `/api/schedules` | 일정 등록 |
| `GET` | `/api/schedules` | 전체 일정 조회 |
| `GET` | `/api/schedules/{id}` | 일정 상세 조회 |
| `PUT` | `/api/schedules/{id}` | 일정 수정 |
| `DELETE` | `/api/schedules/{id}` | 일정 삭제 |
| `PATCH` | `/api/schedules/{id}/completion` | 완료 여부 변경 |

등록 및 수정 요청 예시:

```json
{
  "title": "주간 기획 회의",
  "description": "이번 주 계획을 확인합니다.",
  "date": "2026-11-11",
  "time": "10:30",
  "priority": "normal"
}
```

우선순위는 `high`, `normal`, `low` 중 하나입니다. 완료 여부 변경 요청은 `{"completed": true}` 또는 `false`를 사용합니다.

## 프로젝트 구조

```text
MySchedule/
├── .mvn/wrapper/
├── src/main/java/com/myschedule/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── src/main/resources/
│   ├── application.yml
│   └── static/
├── src/test/java/com/myschedule/
├── mvnw
├── mvnw.cmd
└── pom.xml
```

