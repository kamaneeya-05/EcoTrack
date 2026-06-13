const API = '';
const STATUS_FLOW = [
  'Reported',
  'Assigned',
  'Worker En Route',
  'Cleaning Started',
  'Verification Pending',
  'Resolved',
  'Closed'
];

document.addEventListener('DOMContentLoaded', () => {
  highlightNav();
  bindAuth();
  bindLogout();
  bindContact();
  bindReportPage();
  bindChatbot();
  loadDashboard();
  loadAdmin();
  loadWorker();
  loadTrackStatus();
  loadRewards();
  loadCommunity();
  loadLocator();
  connectLiveUpdates();
});

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function highlightNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

function bindLogout() {
  document.querySelectorAll('[data-logout]').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      localStorage.removeItem('user');
      location.href = 'index.html';
    });
  });
}

function bindAuth() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      const payload = formJson(loginForm);
      const data = await postJson('/api/auth/login', payload);
      if (data.user) {
        setUser(data.user);
        location.href = dashboardForRole(data.user.role);
      } else {
        toast(data.message || 'Login failed');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async event => {
      event.preventDefault();
      const payload = formJson(registerForm);
      if (payload.password !== payload.confirmPassword) {
        toast('Passwords do not match.');
        return;
      }
      delete payload.confirmPassword;
      const data = await postJson('/api/auth/register', payload);
      if (data.user) {
        setUser(data.user);
        location.href = dashboardForRole(data.user.role);
      } else {
        toast(data.message || 'Registration failed');
      }
    });
  }
}

function dashboardForRole(role) {
  if (role === 'admin' || role === 'supervisor') return 'admin.html';
  if (role === 'worker') return 'worker.html';
  return 'dashboard.html';
}

function bindContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = await postJson('/api/contact', formJson(form));
    toast(data.message || 'Message sent.');
    form.reset();
  });
}

function loadDashboard() {
  const dashboard = document.getElementById('dashboard-root');
  if (!dashboard) return;
  const user = currentUser();
  document.querySelectorAll('[data-user-name]').forEach(item => {
    item.textContent = user ? user.name : 'Guest';
  });

  loadNotifications();
  loadDashboardStats();
}

async function loadDashboardStats() {
  const user = currentUser();
  const stats = document.getElementById('dashboard-stats');
  if (!stats) return;

  const reports = await getJson(`/api/report${user ? `?email=${encodeURIComponent(user.email)}` : ''}`);
  const resolved = reports.filter(report => ['Resolved', 'Closed'].includes(report.status)).length;
  
  // Calculate environmental impact
  const wasteRemoved = reports.reduce((sum, r) => sum + (r.impact?.estimatedWasteKg || 0), 0);
  const carbonPrevented = reports.reduce((sum, r) => sum + (r.impact?.estimatedCarbonKg || 0), 0);
  
  stats.innerHTML = `
    ${statCard('My Reports', reports.length)}
    ${statCard('Resolved', resolved)}
    ${statCard('Green Points', user ? user.greenPoints || 0 : 0)}
    ${statCard('🌍 Carbon Prevented (kg)', carbonPrevented.toFixed(1))}
  `;
}

async function loadNotifications() {
  const user = currentUser();
  const target = document.getElementById('notifications-list');
  if (!target || !user) return;
  const notifications = await getJson(`/api/notifications?email=${encodeURIComponent(user.email)}`);
  target.innerHTML = notifications.length
    ? notifications.map(item => `<div class="timeline-item"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.message)}</p></div>`).join('')
    : '<p class="empty">No notifications yet.</p>';
}

function bindReportPage() {
  const form = document.getElementById('report-form');
  const mapNode = document.getElementById('report-map');
  if (!form) return;

  const user = currentUser();
  if (user) {
    setValue('citizenName', user.name);
    setValue('citizenEmail', user.email);
    setValue('area', user.area);
  }

  let map;
  let marker;
  if (mapNode && window.L) {
    map = L.map('report-map').setView([16.5062, 80.6480], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    map.on('click', event => {
      setLatLng(event.latlng.lat, event.latlng.lng);
      if (marker) marker.remove();
      marker = L.marker(event.latlng).addTo(map);
      loadNearby(event.latlng.lat, event.latlng.lng, map);
    });
  }

  const locateBtn = document.getElementById('detect-location');
  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        toast('Geolocation is not available in this browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatLng(lat, lng);
        if (map) {
          map.setView([lat, lng], 16);
          if (marker) marker.remove();
          marker = L.marker([lat, lng]).addTo(map);
          loadNearby(lat, lng, map);
        }
      }, () => toast('Could not detect location.'));
    });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const response = await fetch('/api/report', {
      method: 'POST',
      body: new FormData(form)
    });
    const data = await response.json();
    if (!response.ok) {
      toast(data.message || 'Report submission failed');
      return;
    }
    const result = document.getElementById('report-result');
    if (result) {
      result.innerHTML = `
        <div class="panel">
          <h3>${escapeHtml(data.report.complaintId)}</h3>
          <p>AI category: <strong>${escapeHtml(data.report.aiCategory)}</strong></p>
          <p>Priority: <span class="status priority-${data.report.priority}">${data.report.priority}</span></p>
          <p>Status: ${escapeHtml(data.report.status)}</p>
        </div>
      `;
    }
    toast('Report submitted successfully.');
    form.reset();
  });
}

async function loadNearby(lat, lng, map) {
  const target = document.getElementById('nearby-list');
  const reports = await getJson(`/api/report/nearby?lat=${lat}&lng=${lng}&radiusKm=5`);
  if (target) {
    target.innerHTML = reports.length
      ? reports.map(report => `<div class="timeline-item"><strong>${escapeHtml(report.complaintId)}</strong><p>${escapeHtml(report.location)} - ${report.distanceKm} km away</p></div>`).join('')
      : '<p class="empty">No nearby open complaints.</p>';
  }
  if (map && window.L) {
    reports.forEach(report => {
      if (report.coordinates && report.coordinates.lat && report.coordinates.lng) {
        L.circleMarker([report.coordinates.lat, report.coordinates.lng], { radius: 7 }).addTo(map)
          .bindPopup(`${report.complaintId}: ${report.status}`);
      }
    });
  }
}

function setLatLng(lat, lng) {
  setValue('lat', lat.toFixed(6));
  setValue('lng', lng.toFixed(6));
}

async function loadAdmin() {
  const table = document.getElementById('admin-reports');
  if (!table) return;
  const [reports, analytics, workers] = await Promise.all([
    getJson('/api/admin/reports'),
    getJson('/api/admin/analytics'),
    getJson('/api/auth/users?role=worker')
  ]);

  const stats = document.getElementById('admin-stats');
  if (stats) {
    stats.innerHTML = `
      ${statCard('Total Reports', analytics.totals.total)}
      ${statCard('Resolved', analytics.totals.resolved)}
      ${statCard('Pending', analytics.totals.pending)}
      ${statCard('Critical', analytics.totals.critical || 0)}
    `;
  }

  // Load environmental metrics
  const envMetrics = document.getElementById('env-metrics');
  if (envMetrics && analytics.environmentalMetrics) {
    envMetrics.style.display = 'grid';
    envMetrics.innerHTML = `
      ${statCard('Waste Removed (kg)', analytics.environmentalMetrics.wasteKg.toFixed(1))}
      ${statCard('Carbon Prevented (kg)', analytics.environmentalMetrics.carbonKgReduced.toFixed(1))}
      ${statCard('Pollution Reduction', analytics.environmentalMetrics.estimatedPollutionReduction)}
      ${statCard('Trees Equivalent', analytics.environmentalMetrics.treesEquivalent)}
    `;
  }

  table.innerHTML = reports.map(report => `
    <tr>
      <td><strong>${escapeHtml(report.complaintId)}</strong><br><span class="muted">${escapeHtml(report.area || '')}</span></td>
      <td>${escapeHtml(report.aiCategory || report.category)}<br><span class="status priority-${report.priority}">${report.priority}</span></td>
      <td>${escapeHtml(report.location)}</td>
      <td><span class="status">${escapeHtml(report.status)}</span></td>
      <td>
        <select data-worker="${report._id}">
          <option value="">Assign worker</option>
          ${workers.map(worker => `<option value="${worker._id}">${escapeHtml(worker.name)}</option>`).join('')}
        </select>
      </td>
      <td class="row-actions">
        <button class="btn secondary" data-status="${report._id}" data-next="Worker En Route">En Route</button>
        <button class="btn secondary" data-status="${report._id}" data-next="Cleaning Started">Start</button>
        <button class="btn warning" data-status="${report._id}" data-next="Closed">Close</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-worker]').forEach(select => {
    select.addEventListener('change', async () => {
      if (!select.value) return;
      await patchJson(`/api/report/${select.dataset.worker}/assign`, { workerId: select.value });
      toast('Worker assigned.');
      loadAdmin();
    });
  });

  document.querySelectorAll('[data-status]').forEach(button => {
    button.addEventListener('click', async () => {
      const endpoint = button.dataset.next === 'Closed'
        ? `/api/report/${button.dataset.status}/close`
        : `/api/report/${button.dataset.status}/status`;
      const body = button.dataset.next === 'Closed' ? {} : { status: button.dataset.next, actorRole: 'admin' };
      await postOrPatch(endpoint, body, button.dataset.next === 'Closed' ? 'POST' : 'PATCH');
      toast('Status updated.');
      loadAdmin();
    });
  });

  // Load worker performance
  loadWorkerPerformance();
  
  // Load bin status
  loadBinStatus();
  
  // Load government records
  loadGovernmentRecords();

  renderCharts(analytics);
}

async function loadWorkerPerformance() {
  const target = document.getElementById('worker-performance');
  if (!target) return;
  try {
    const workers = await getJson('/api/admin/worker-performance');
    target.innerHTML = workers.map(worker => `
      <tr>
        <td>${escapeHtml(worker.name)}<br><span class="muted">${escapeHtml(worker.area)}</span></td>
        <td>${worker.assignedTasks}</td>
        <td>${worker.completedTasks}</td>
        <td><strong>${worker.completionRate}</strong></td>
        <td><span class="status">${worker.rating}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.log('Worker performance not available yet');
  }
}

async function loadBinStatus() {
  const target = document.getElementById('bin-status');
  if (!target) return;
  try {
    const bins = await getJson('/api/admin/bin-status');
    target.innerHTML = bins.map(bin => `
      <tr>
        <td><strong>${escapeHtml(bin.binCode)}</strong></td>
        <td>${escapeHtml(bin.area)}</td>
        <td>
          <div style="width:100px; height:20px; background:#ddd; border-radius:3px; position:relative; overflow:hidden;">
            <div style="width:${bin.fillLevel}%; height:100%; background:${bin.fillLevel > 80 ? '#b42318' : bin.fillLevel > 50 ? '#f59e0b' : '#10b981'}; transition:all 0.3s;"></div>
          </div>
          ${bin.fillLevel}%
        </td>
        <td><span class="status">${escapeHtml(bin.status)}</span></td>
        <td>${bin.predictedFullInDays} days ${bin.needsAttention ? '⚠️' : '✓'}</td>
        <td><button class="btn secondary" style="font-size:12px;">Schedule Clean</button></td>
      </tr>
    `).join('');
  } catch (error) {
    console.log('Bin status not available yet');
  }
}

async function loadGovernmentRecords() {
  const target = document.getElementById('government-records');
  if (!target) return;
  try {
    const records = await getJson('/api/admin/government-records');
    target.innerHTML = `
      <div style="padding: 15px;">
        <p><strong>📊 Total Cases Processed:</strong> ${records.totalCasesProcessed}</p>
        <p><strong>⏱️ Average Resolution Time:</strong> ${records.averageResolutionTime}</p>
        <p><strong>✅ Certified Clean Areas:</strong> ${records.certifiedCleanAreas}</p>
        <p><strong>👥 Community Participants:</strong> ${records.communityParticipants}</p>
        <p style="color:#666; font-size:12px; margin-top:15px;">
          <strong>Official Record Generated:</strong> ${new Date(records.generatedOn).toLocaleString()}<br>
          <strong>Authority:</strong> ${records.municipalityStamp}<br>
          <strong>Authorized By:</strong> ${records.authorizedBy}
        </p>
      </div>
    `;
  } catch (error) {
    console.log('Government records not available yet');
  }
}

function renderCharts(analytics) {
  if (!window.Chart) return;
  chart('status-chart', 'doughnut', analytics.byStatus);
  chart('priority-chart', 'bar', analytics.byPriority);
  chart('monthly-chart', 'line', analytics.monthly);
}

function chart(id, type, data) {
  const node = document.getElementById(id);
  if (!node) return;
  new Chart(node, {
    type,
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: id.replace('-', ' '),
        data: Object.values(data),
        borderColor: '#1f8f4d',
        backgroundColor: ['#1f8f4d', '#2563eb', '#b7791f', '#b42318', '#7c3aed']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

async function loadWorker() {
  const target = document.getElementById('worker-tasks');
  if (!target) return;
  const user = currentUser();
  const reports = await getJson(`/api/worker/tasks${user ? `?workerId=${user.id}` : ''}`);
  target.innerHTML = reports.length ? reports.map(report => `
    <div class="card">
      <h3>${escapeHtml(report.complaintId)}</h3>
      <p>${escapeHtml(report.location)}</p>
      <p><span class="status">${escapeHtml(report.status)}</span> <span class="status priority-${report.priority}">${report.priority}</span></p>
      <div class="row-actions">
        ${['Worker En Route', 'Cleaning Started'].map(status => `<button class="btn secondary" data-worker-status="${report._id}" data-next="${status}">${status}</button>`).join('')}
      </div>
      <form class="cleanup-form" data-cleanup="${report._id}">
        <div class="field"><label>Cleanup photo</label><input type="file" name="afterImage" accept="image/*"></div>
        <button class="btn" type="submit">Submit cleanup</button>
      </form>
    </div>
  `).join('') : '<p class="empty">No assigned tasks yet.</p>';

  document.querySelectorAll('[data-worker-status]').forEach(button => {
    button.addEventListener('click', async () => {
      await patchJson(`/api/report/${button.dataset.workerStatus}/status`, {
        status: button.dataset.next,
        actorRole: 'worker'
      });
      toast('Task status updated.');
      loadWorker();
    });
  });

  document.querySelectorAll('[data-cleanup]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      await fetch(`/api/worker/tasks/${form.dataset.cleanup}/cleanup`, {
        method: 'POST',
        body: new FormData(form)
      });
      toast('Cleanup sent for verification.');
      loadWorker();
    });
  });

  const binForm = document.getElementById('bin-scan-form');
  if (binForm) {
    binForm.addEventListener('submit', async event => {
      event.preventDefault();
      const data = formJson(binForm);
      const binCode = data.binCode;
      delete data.binCode;
      const result = await postJson(`/api/worker/bins/${encodeURIComponent(binCode)}/scan`, data);
      toast(`${result.bin.binCode} updated. Full in about ${result.bin.predictedFullInDays} day(s).`);
      binForm.reset();
    }, { once: true });
  }
}

async function loadTrackStatus() {
  const target = document.getElementById('status-list');
  if (!target) return;
  const user = currentUser();
  const reports = await getJson(`/api/report${user ? `?email=${encodeURIComponent(user.email)}` : ''}`);
  target.innerHTML = reports.length ? reports.map(report => `
    <div class="panel">
      <h3>${escapeHtml(report.complaintId)} <span class="status priority-${report.priority}">${report.priority}</span></h3>
      <p class="muted">${escapeHtml(report.location)}</p>
      <div class="timeline">${STATUS_FLOW.map(status => `
        <div class="timeline-item" style="border-left-color:${STATUS_FLOW.indexOf(status) <= STATUS_FLOW.indexOf(report.status) ? '#1f8f4d' : '#dfe7e2'}">
          <strong>${status}</strong>
        </div>
      `).join('')}</div>
    </div>
  `).join('') : '<p class="empty">No reports found.</p>';
}

async function loadRewards() {
  const target = document.getElementById('leaderboard');
  if (!target) return;
  const users = await getJson('/api/admin/leaderboard');
  target.innerHTML = users.map((user, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.area || '')}</td>
      <td>${user.greenPoints || 0}</td>
      <td>${(user.badges || []).map(badge => `<span class="badge status">${escapeHtml(badge)}</span>`).join(' ') || 'Starter'}</td>
    </tr>
  `).join('');
}

async function loadCommunity() {
  const target = document.getElementById('forum-posts');
  if (!target) return;
  const posts = await getJson('/api/forum');
  target.innerHTML = posts.length ? posts.map(post => `
    <div class="card">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.message)}</p>
      <p class="muted">${escapeHtml(post.area)} - ${post.upvotes} upvotes</p>
      <button class="btn secondary" data-upvote="${post._id}">Upvote</button>
    </div>
  `).join('') : '<p class="empty">No community discussions yet.</p>';

  document.querySelectorAll('[data-upvote]').forEach(button => {
    button.addEventListener('click', async () => {
      await patchJson(`/api/forum/${button.dataset.upvote}/upvote`, {});
      loadCommunity();
    });
  });

  const form = document.getElementById('forum-form');
  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const user = currentUser();
      const payload = { ...formJson(form), authorName: user ? user.name : 'Community Member', authorEmail: user ? user.email : '' };
      await postJson('/api/forum', payload);
      form.reset();
      loadCommunity();
    }, { once: true });
  }
}

async function loadLocator() {
  const target = document.getElementById('center-list');
  const mapNode = document.getElementById('locator-map');
  if (!target) return;
  const centers = await getJson('/api/locator/recycling-centers');
  target.innerHTML = centers.map(center => `
    <div class="timeline-item">
      <strong>${escapeHtml(center.name)}</strong>
      <p>${escapeHtml(center.type)} - accepts ${center.accepts.map(escapeHtml).join(', ')}</p>
    </div>
  `).join('');
  if (mapNode && window.L) {
    const map = L.map('locator-map').setView([16.5062, 80.6480], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    centers.forEach(center => L.marker([center.lat, center.lng]).addTo(map).bindPopup(center.name));
  }
}

function bindChatbot() {
  const form = document.getElementById('chat-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const input = form.querySelector('[name="message"]');
    const log = document.getElementById('chat-log');
    const message = input.value.trim();
    if (!message) return;
    log.innerHTML += `<div class="chat-msg"><strong>You:</strong> ${escapeHtml(message)}</div>`;
    const data = await postJson('/api/chatbot', { message });
    log.innerHTML += `<div class="chat-msg"><strong>EcoBot:</strong> ${escapeHtml(data.reply)}</div>`;
    input.value = '';
    log.scrollTop = log.scrollHeight;
  });
}

function connectLiveUpdates() {
  if (!window.io) return;
  const socket = io();
  socket.on('report-status-updated', payload => {
    toast(`${payload.complaintId} updated to ${payload.status}`);
    loadTrackStatus();
    loadDashboardStats();
  });
}

function statCard(label, value) {
  return `<div class="card stat"><span class="muted">${label}</span><strong>${value}</strong></div>`;
}

function formJson(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function getJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function postJson(url, payload) {
  return postOrPatch(url, payload, 'POST');
}

async function patchJson(url, payload) {
  return postOrPatch(url, payload, 'PATCH');
}

async function postOrPatch(url, payload, method) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

function setValue(id, value) {
  const input = document.getElementById(id);
  if (input && value !== undefined && value !== null) input.value = value;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toast(message) {
  let node = document.querySelector('.toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'toast';
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add('show');
  setTimeout(() => node.classList.remove('show'), 3200);
}
