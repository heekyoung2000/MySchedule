(() => {
  const $ = (selector) => document.querySelector(selector);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const addDays = (date, amount) => { const result = new Date(date); result.setDate(result.getDate() + amount); return result; };
  const formatDate = (key, options = { month: 'long', day: 'numeric', weekday: 'short' }) => new Intl.DateTimeFormat('ko-KR', options).format(new Date(`${key}T12:00:00`));
  const statusLabels = { planned: '예정', completed: '완료' };
  const priorityLabels = { high: '높음', normal: '보통', low: '낮음' };
  const viewInfo = {
    dashboard: ['대시보드', 'OVERVIEW'], all: ['전체 일정', 'ALL SCHEDULES'],
    today: ['오늘의 일정', 'TODAY'], completed: ['완료한 일정', 'COMPLETED'], settings: ['설정', 'PREFERENCES']
  };
  let scheduleItems = [];
  let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = dateKey(today);
  let currentView = 'dashboard';
  let editingId = null;
  let toastTimer;

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
    if (!response.ok) {
      let detail = `요청에 실패했습니다. (${response.status})`;
      try {
        const body = await response.json();
        detail = body.detail || body.message || detail;
      } catch (_) { /* 응답 본문이 JSON이 아니어도 기본 오류 메시지를 표시합니다. */ }
      throw new Error(detail);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function showToast(message, kind = 'success') {
    const toast = $('#toast-message');
    toast.textContent = message;
    toast.className = `toast ${kind}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 4200);
  }

  function formatTime(time) { return String(time || '').slice(0, 5); }
  function itemStatus(item) { return item.completed ? 'completed' : 'planned'; }

  function updateSummary() {
    const todayItems = scheduleItems.filter((item) => item.date === dateKey(today));
    $('#stat-today').textContent = todayItems.length;
    $('#stat-all').textContent = scheduleItems.length;
    $('#stat-done').textContent = scheduleItems.filter((item) => item.completed).length;
    $('#stat-pending').textContent = scheduleItems.filter((item) => !item.completed).length;
    $('#nav-total').textContent = scheduleItems.length;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function getVisibleItems() {
    const query = $('#search-input').value.trim().toLocaleLowerCase('ko-KR');
    let items = [...scheduleItems];
    if (query) items = items.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('ko-KR').includes(query));
    else if (currentView === 'today') items = items.filter((item) => item.date === dateKey(today));
    else if (currentView === 'completed') items = items.filter((item) => item.completed);
    else if (currentView === 'dashboard') items = items.filter((item) => item.date === selectedDate);
    return items.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }

  function renderList() {
    const query = $('#search-input').value.trim();
    const items = getVisibleItems();
    let title;
    let subtitle;
    if (query) {
      title = '검색 결과';
      subtitle = `“${query}” 검색 결과입니다.`;
    } else if (currentView === 'dashboard') {
      title = selectedDate === dateKey(today) ? '오늘의 일정' : `${formatDate(selectedDate, { month: 'long', day: 'numeric' })} 일정`;
      subtitle = items.length ? '선택한 날짜의 일정을 확인해 보세요.' : '선택한 날짜에 등록된 일정이 없습니다.';
    } else {
      title = viewInfo[currentView][0] === '대시보드' ? '다가오는 일정' : viewInfo[currentView][0];
      subtitle = currentView === 'today' ? '오늘 계획한 일정을 확인해 보세요.' : currentView === 'completed' ? '완료한 일정을 확인해 보세요.' : '등록된 일정을 확인해 보세요.';
    }
    $('#list-title').textContent = title;
    $('#list-subtitle').textContent = subtitle;
    $('#list-count').textContent = items.length;
    const list = $('#schedule-list');
    list.replaceChildren();
    items.forEach((item) => list.append(createScheduleRow(item)));
    $('#empty-state').classList.toggle('hidden', items.length > 0);
    list.classList.toggle('hidden', items.length === 0);
  }

  function createScheduleRow(item) {
    const status = itemStatus(item);
    const color = ['indigo', 'blue', 'green', 'orange'][Number(item.id) % 4];
    const row = document.createElement('article');
    row.className = 'event-row';
    row.innerHTML = `
      <div class="event-time"><strong>${escapeHtml(formatTime(item.time))}</strong>${escapeHtml(formatDate(item.date, { month: 'numeric', day: 'numeric' }))}</div>
      <div class="event-main"><div class="event-title"><i class="event-dot ${color}"></i><strong>${escapeHtml(item.title)}</strong></div><div class="event-description">${escapeHtml(item.description || '설명이 없습니다.')}</div></div>
      <div class="event-meta"><span class="status-pill status-${status}">${statusLabels[status]}</span><span class="priority-pill priority-${escapeHtml(item.priority)}">우선 ${priorityLabels[item.priority] || '보통'}</span>
        <div class="event-actions"><input class="completion-toggle" type="checkbox" data-action="completion" data-id="${item.id}" ${item.completed ? 'checked' : ''} aria-label="${escapeHtml(item.title)} 완료 여부"><button type="button" data-action="edit" data-id="${item.id}">수정</button><button type="button" data-action="delete" data-id="${item.id}">삭제</button></div>
      </div>`;
    return row;
  }

  function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    $('#month-title').textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(calendarMonth);
    $('#selected-caption').textContent = `선택: ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
    const grid = $('#calendar-grid');
    grid.replaceChildren();
    ['일', '월', '화', '수', '목', '금', '토'].forEach((label) => {
      const weekday = document.createElement('div');
      weekday.className = 'weekday'; weekday.setAttribute('role', 'columnheader'); weekday.textContent = label; grid.append(weekday);
    });
    const firstDay = new Date(year, month, 1);
    const start = new Date(year, month, 1 - firstDay.getDay());
    for (let index = 0; index < 42; index += 1) {
      const date = addDays(start, index);
      const key = dateKey(date);
      const hasEvents = scheduleItems.some((item) => item.date === key);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'day-cell'; button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', `${formatDate(key, { year: 'numeric', month: 'long', day: 'numeric' })}${hasEvents ? ', 일정 있음' : ''}`);
      if (date.getMonth() !== month) button.classList.add('outside');
      if (key === dateKey(today)) button.classList.add('today');
      if (key === selectedDate) button.classList.add('selected');
      button.append(document.createTextNode(String(date.getDate())));
      if (hasEvents) { const dot = document.createElement('span'); dot.className = 'day-dots'; dot.innerHTML = '<i class="day-dot"></i>'; button.append(dot); }
      button.addEventListener('click', () => {
        selectedDate = key;
        if (date.getMonth() !== calendarMonth.getMonth()) calendarMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        renderCalendar(); renderList();
      });
      grid.append(button);
    }
  }

  function selectView(view) {
    currentView = view;
    document.querySelectorAll('.nav-item[data-view]').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
    $('#page-title').textContent = viewInfo[view][0];
    $('#breadcrumb').textContent = viewInfo[view][1];
    renderList(); closeMobileMenu();
  }

  function openDialog(item = null) {
    editingId = item ? item.id : null;
    const form = $('#event-form');
    form.elements.namedItem('title').value = item?.title || '';
    form.elements.namedItem('description').value = item?.description || '';
    form.elements.namedItem('date').value = item?.date || selectedDate || dateKey(today);
    form.elements.namedItem('time').value = formatTime(item?.time || '10:00');
    form.elements.namedItem('priority').value = item?.priority || 'normal';
    $('#dialog-title').textContent = item ? '일정 수정' : '새 일정 만들기';
    $('#save-event').textContent = item ? '변경 사항 저장' : '일정 등록';
    $('#event-dialog').showModal();
    form.elements.namedItem('title').focus();
  }

  async function reloadSchedules() {
    scheduleItems = await api('/api/schedules');
    updateSummary(); renderCalendar(); renderList();
  }

  function closeMobileMenu() {
    $('#sidebar').classList.remove('open');
    $('#mobile-scrim').classList.remove('show');
  }

  function initializeDates() {
    $('#today-label').textContent = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(today);
    $('#welcome-date').textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(today);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekEnd = addDays(weekStart, 6);
    $('#week-label').textContent = `${formatDate(dateKey(weekStart), { month: 'short', day: 'numeric' })} — ${formatDate(dateKey(weekEnd), { month: 'short', day: 'numeric' })}`;
  }

  document.querySelectorAll('.nav-item[data-view]').forEach((item) => item.addEventListener('click', (event) => { event.preventDefault(); selectView(item.dataset.view); }));
  ['#add-event', '#sidebar-add', '#empty-add'].forEach((selector) => $(selector).addEventListener('click', () => openDialog()));
  document.querySelectorAll('.close-dialog').forEach((button) => button.addEventListener('click', () => $('#event-dialog').close()));
  $('#event-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const saveButton = $('#save-event');
    saveButton.disabled = true;
    try {
      if (editingId) await api(`/api/schedules/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/schedules', { method: 'POST', body: JSON.stringify(payload) });
      const message = editingId ? '일정을 수정했습니다.' : '일정을 등록했습니다.';
      selectedDate = payload.date; calendarMonth = new Date(`${payload.date}T12:00:00`);
      $('#event-dialog').close(); form.reset(); editingId = null;
      await reloadSchedules(); showToast(message);
    } catch (error) { showToast(error.message, 'error'); }
    finally { saveButton.disabled = false; }
  });
  $('#schedule-list').addEventListener('change', async (event) => {
    const control = event.target.closest('[data-action="completion"]');
    if (!control) return;
    const id = control.dataset.id;
    control.disabled = true;
    try { await api(`/api/schedules/${id}/completion`, { method: 'PATCH', body: JSON.stringify({ completed: control.checked }) }); await reloadSchedules(); showToast('완료 상태를 변경했습니다.'); }
    catch (error) { control.checked = !control.checked; showToast(error.message, 'error'); }
    finally { control.disabled = false; }
  });
  $('#schedule-list').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const item = scheduleItems.find((schedule) => String(schedule.id) === button.dataset.id);
    if (button.dataset.action === 'edit' && item) openDialog(item);
    if (button.dataset.action === 'delete' && item && window.confirm(`“${item.title}” 일정을 삭제할까요?`)) {
      button.disabled = true;
      try { await api(`/api/schedules/${item.id}`, { method: 'DELETE' }); await reloadSchedules(); showToast('일정을 삭제했습니다.'); }
      catch (error) { button.disabled = false; showToast(error.message, 'error'); }
    }
  });
  $('#prev-month').addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); renderCalendar(); });
  $('#next-month').addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); renderCalendar(); });
  $('#go-today').addEventListener('click', () => { calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1); selectedDate = dateKey(today); renderCalendar(); renderList(); });
  $('#view-all').addEventListener('click', () => selectView('all'));
  $('#search-input').addEventListener('input', renderList);
  $('#search-input').addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.currentTarget.value = ''; event.currentTarget.blur(); renderList(); } });
  $('#menu-toggle').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#mobile-scrim').classList.add('show'); });
  $('#mobile-scrim').addEventListener('click', closeMobileMenu);
  $('.search-box').addEventListener('click', (event) => { if (window.matchMedia('(max-width: 560px)').matches && !event.currentTarget.classList.contains('search-open')) { event.currentTarget.classList.add('search-open'); $('#search-input').focus(); } });
  $('#search-input').addEventListener('blur', () => { if (!$('#search-input').value.trim()) $('.search-box').classList.remove('search-open'); });
  document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search-input').focus(); } });

  initializeDates();
  reloadSchedules().catch((error) => { updateSummary(); renderCalendar(); renderList(); showToast(`일정을 불러오지 못했습니다: ${error.message}`, 'error'); });
})();
