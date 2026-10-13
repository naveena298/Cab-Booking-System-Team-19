/* ==========================================================================
   RIDEGO JAVASCRIPT APPLICATION ENGINE
   ========================================================================== */

// 1. Coimbatore Landmarks & Coordinates
const LOCATIONS = [
  { id: 'loc-1', name: 'Gandhipuram Bus Stand', lat: 11.0168, lng: 76.9558 },
  { id: 'loc-2', name: 'RS Puram (DB Road)', lat: 11.0084, lng: 76.9450 },
  { id: 'loc-3', name: 'Peelamedu (PSG Tech)', lat: 11.0268, lng: 77.0028 },
  { id: 'loc-4', name: 'Singanallur Junction', lat: 10.9995, lng: 77.0250 },
  { id: 'loc-5', name: 'Ukkadam Bus Stand', lat: 10.9912, lng: 76.9602 },
  { id: 'loc-6', name: 'Saibaba Colony', lat: 11.0312, lng: 76.9412 },
  { id: 'loc-7', name: 'Coimbatore Railway Station', lat: 10.9980, lng: 76.9660 },
  { id: 'loc-8', name: 'TIDEL Park Coimbatore', lat: 11.0242, lng: 77.0354 }
];

// 2. Mock Database
const DB = {
  users: {
    customer: { email: 'ramesh@example.com', pass: 'password123', name: 'Ramesh Kumar', role: 'CUSTOMER' },
    driver: { email: 'karthik@ridego.in', pass: 'driverpassword', name: 'Karthik Selvam', role: 'DRIVER', vehicle: 'Honda Activa 6G', plate: 'TN 38 BX 4892' },
    admin: { email: 'admin@ridego.in', pass: 'adminpassword', name: 'Super Admin', role: 'ADMIN' }
  },
  driversList: [
    { name: 'Karthik Selvam', vehicle: 'Bike (Activa 6G)', plate: 'TN 38 BX 4892', rating: '4.89', status: 'Active' },
    { name: 'Muthu Kumar', vehicle: 'Auto (Bajaj Compact)', plate: 'TN 38 Q 1120', rating: '4.92', status: 'Active' },
    { name: 'Suresh Rajan', vehicle: 'Cab (Tata Tiago)', plate: 'TN 38 AX 7831', rating: '4.78', status: 'Active' },
    { name: 'Ganesh Moorthi', vehicle: 'Auto (Piaggio Ape)', plate: 'TN 38 Z 4412', rating: '4.65', status: 'Suspended' }
  ]
};

// 3. Application State
let AppState = {
  currentUser: null,
  activeVehicle: 'bike',
  pickup: LOCATIONS[0],
  drop: LOCATIONS[1],
  distanceKm: 2.1,
  calculatedFare: 28.00,
  activeRide: null,
  customerMap: null,
  driverMap: null,
  markers: [],
  routeLine: null,
  driverDutyOnline: true,
  driverTripStep: 0 // 0: Idle, 1: En Route to Pickup, 2: At Pickup (Verify OTP), 3: In Transit
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  setupPortalSwitchers();
  populateLocationDropdowns();
  renderAdminTable();
  recalculateTrip();
});

// Portal Switcher Tabs
function setupPortalSwitchers() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const portal = btn.dataset.portal;

      document.getElementById('customerAuthCard').style.display = portal === 'customer' ? 'block' : 'none';
      document.getElementById('driverAuthCard').style.display = portal === 'driver' ? 'block' : 'none';
      document.getElementById('adminAuthCard').style.display = portal === 'admin' ? 'block' : 'none';
    });
  });

  // Login Form Submissions
  document.getElementById('customerLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser('customer');
  });

  document.getElementById('driverLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser('driver');
  });

  document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser('admin');
  });

  document.getElementById('logoutBtn').addEventListener('click', logoutUser);
}

// 1-Click Demo Auto Fill
function fillDemo(role) {
  if (role === 'customer') {
    document.getElementById('custEmail').value = DB.users.customer.email;
    document.getElementById('custPass').value = DB.users.customer.pass;
    loginUser('customer');
  } else if (role === 'driver') {
    document.getElementById('driverEmail').value = DB.users.driver.email;
    document.getElementById('driverPass').value = DB.users.driver.pass;
    loginUser('driver');
  } else if (role === 'admin') {
    document.getElementById('adminEmail').value = DB.users.admin.email;
    document.getElementById('adminPass').value = DB.users.admin.pass;
    loginUser('admin');
  }
}

// User Authentication
function loginUser(role) {
  AppState.currentUser = DB.users[role];
  
  // Update Top Nav
  document.getElementById('userHeaderActions').style.display = 'flex';
  document.getElementById('navUserName').innerText = AppState.currentUser.name;
  document.getElementById('roleSubtitle').innerText = `${AppState.currentUser.role} Portal`;

  // Hide All Views
  document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));

  if (role === 'customer') {
    document.getElementById('customerView').classList.add('active');
    initCustomerMap();
  } else if (role === 'driver') {
    document.getElementById('driverView').classList.add('active');
    initDriverMap();
  } else if (role === 'admin') {
    document.getElementById('adminView').classList.add('active');
  }
}

function logoutUser() {
  AppState.currentUser = null;
  document.getElementById('userHeaderActions').style.display = 'none';
  document.getElementById('roleSubtitle').innerText = 'Move faster. Ride smarter.';
  document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
  document.getElementById('authView').classList.add('active');
}

// ==========================================================================
// CUSTOMER FLOW & FARE LOGIC
// ==========================================================================

function populateLocationDropdowns() {
  const pSelect = document.getElementById('pickupSelect');
  const dSelect = document.getElementById('dropSelect');
  pSelect.innerHTML = '';
  dSelect.innerHTML = '';

  LOCATIONS.forEach((loc, index) => {
    pSelect.innerHTML += `<option value="${loc.id}" ${index === 0 ? 'selected' : ''}>${loc.name}</option>`;
    dSelect.innerHTML += `<option value="${loc.id}" ${index === 1 ? 'selected' : ''}>${loc.name}</option>`;
  });
}

function swapLocations() {
  const pSelect = document.getElementById('pickupSelect');
  const dSelect = document.getElementById('dropSelect');
  const temp = pSelect.value;
  pSelect.value = dSelect.value;
  dSelect.value = temp;
  recalculateTrip();
}

function recalculateTrip() {
  const pId = document.getElementById('pickupSelect').value;
  const dId = document.getElementById('dropSelect').value;

  AppState.pickup = LOCATIONS.find(l => l.id === pId);
  AppState.drop = LOCATIONS.find(l => l.id === dId);

  // Approximate distance (Haversine formula)
  const d = calcDistance(AppState.pickup.lat, AppState.pickup.lng, AppState.drop.lat, AppState.drop.lng);
  AppState.distanceKm = Math.max(1.0, parseFloat(d.toFixed(1)));

  // Dynamic Fares (Base + per KM)
  const bikeFare = Math.round(20 + (AppState.distanceKm * 8));
  const autoFare = Math.round(30 + (AppState.distanceKm * 12));
  const cabFare = Math.round(50 + (AppState.distanceKm * 15));

  document.getElementById('bikePrice').innerText = `₹${bikeFare}`;
  document.getElementById('autoPrice').innerText = `₹${autoFare}`;
  document.getElementById('cabPrice').innerText = `₹${cabFare}`;

  document.getElementById('tripDistance').innerText = `${AppState.distanceKm} km`;
  document.getElementById('tripEta').innerText = `${Math.round(AppState.distanceKm * 2.5 + 2)} mins`;

  if (AppState.activeVehicle === 'bike') AppState.calculatedFare = bikeFare;
  if (AppState.activeVehicle === 'auto') AppState.calculatedFare = autoFare;
  if (AppState.activeVehicle === 'cab') AppState.calculatedFare = cabFare;

  updateCustomerMapRoute();
}

function selectVehicle(type) {
  AppState.activeVehicle = type;
  document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.vehicle-card[data-type="${type}"]`).classList.add('active');

  const names = { bike: 'Bike Taxi', auto: 'Auto Rickshaw', cab: 'Mini Cab' };
  document.getElementById('btnVehType').innerText = names[type];
  recalculateTrip();
}

function startRideSearch() {
  switchCustomerStep('searchingFlow');

  // Simulate driver assignment after 3 seconds
  setTimeout(() => {
    switchCustomerStep('trackedFlow');
    simulateCaptainEnRoute();
  }, 3000);
}

function cancelRideSearch() {
  switchCustomerStep('selectFlow');
}

function cancelActiveRide() {
  alert('Ride cancelled successfully.');
  switchCustomerStep('selectFlow');
}

function switchCustomerStep(stepId) {
  document.querySelectorAll('.sheet-step').forEach(s => s.classList.remove('active'));
  document.getElementById(stepId).classList.add('active');
}

function simulateCaptainEnRoute() {
  document.getElementById('liveStatusText').innerText = 'Captain Karthik is 2 mins away';

  setTimeout(() => {
    document.getElementById('liveStatusText').innerText = 'Captain arrived at Gandhipuram pickup';
  }, 4000);

  setTimeout(() => {
    document.getElementById('liveStatusText').innerText = 'Ride started — Heading to destination';
  }, 7000);

  setTimeout(() => {
    document.getElementById('payFareAmount').innerText = AppState.calculatedFare.toFixed(2);
    switchCustomerStep('paymentFlow');
  }, 11000);
}

function processPayment() {
  switchCustomerStep('receiptFlow');
}

function setRating(stars) {
  const allStars = document.querySelectorAll('.rating-stars i');
  allStars.forEach((star, index) => {
    if (index < stars) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function finishAndReset() {
  alert('Thank you for riding with RideGo!');
  switchCustomerStep('selectFlow');
}

// ==========================================================================
// DRIVER PARTNER FLOW
// ==========================================================================

function toggleDriverDuty() {
  AppState.driverDutyOnline = !AppState.driverDutyOnline;
  const badge = document.getElementById('dutyBadge');
  const sub = document.getElementById('dutySub');
  const btn = document.getElementById('toggleDutyBtn');

  if (AppState.driverDutyOnline) {
    badge.className = 'duty-pill online';
    badge.innerText = 'ON DUTY';
    sub.innerText = 'Auto-accepting trips nearby';
    btn.innerText = 'Go Offline';
    document.getElementById('driverIdleMsg').style.display = 'block';
  } else {
    badge.className = 'duty-pill offline';
    badge.innerText = 'OFF DUTY';
    sub.innerText = 'You are not visible to customers';
    btn.innerText = 'Go Online';
    document.getElementById('driverIdleMsg').style.display = 'none';
    document.getElementById('driverTripControls').style.display = 'none';
  }
}

// Trigger mock dispatch to driver
function triggerMockDriverDispatch() {
  document.getElementById('driverIdleMsg').style.display = 'none';
  document.getElementById('driverTripControls').style.display = 'block';
  AppState.driverTripStep = 1;
  document.getElementById('driverProgressBtn').innerText = 'Mark Arrived at Pickup';
  document.getElementById('otpInputBlock').style.display = 'none';
}

function advanceDriverTrip() {
  if (AppState.driverTripStep === 1) {
    AppState.driverTripStep = 2;
    document.getElementById('otpInputBlock').style.display = 'flex';
    document.getElementById('driverProgressBtn').style.display = 'none';
  } else if (AppState.driverTripStep === 3) {
    alert('Trip completed! ₹42 credited to your wallet.');
    document.getElementById('driverTripControls').style.display = 'none';
    document.getElementById('driverIdleMsg').style.display = 'block';
    AppState.driverTripStep = 0;
  }
}

function driverVerifyOtp() {
  const entered = document.getElementById('driverOtpEntered').value;
  if (entered === '4892') {
    alert('OTP Verified! Ride commenced.');
    AppState.driverTripStep = 3;
    document.getElementById('otpInputBlock').style.display = 'none';
    document.getElementById('driverProgressBtn').style.display = 'block';
    document.getElementById('driverProgressBtn').innerText = 'Complete Ride';
  } else {
    alert('Invalid OTP. Ask customer for the 4-digit code (Use 4892).');
  }
}

// ==========================================================================
// ADMIN LOGISTICS
// ==========================================================================

function renderAdminTable() {
  const tbody = document.getElementById('adminDriversTableBody');
  tbody.innerHTML = '';
  DB.driversList.forEach((d, idx) => {
    const isAct = d.status === 'Active';
    tbody.innerHTML += `
      <tr>
        <td><strong>${d.name}</strong></td>
        <td>${d.vehicle}</td>
        <td><code>${d.plate}</code></td>
        <td>★ ${d.rating}</td>
        <td><span class="duty-pill ${isAct ? 'online' : 'offline'}">${d.status}</span></td>
        <td>
          <button class="btn-sm-action ${isAct ? 'btn-danger-sm' : 'btn-success-sm'}" onclick="toggleDriverStatus(${idx})">
            ${isAct ? 'Suspend' : 'Approve'}
          </button>
        </td>
      </tr>
    `;
  });
}

function toggleDriverStatus(idx) {
  DB.driversList[idx].status = DB.driversList[idx].status === 'Active' ? 'Suspended' : 'Active';
  renderAdminTable();
}

// ==========================================================================
// LEAFLET MAP INTEGRATION (Coimbatore Coordinates)
// ==========================================================================

function initCustomerMap() {
  if (AppState.customerMap) return;
  setTimeout(() => {
    AppState.customerMap = L.map('customerMap').setView([11.0168, 76.9558], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(AppState.customerMap);
    updateCustomerMapRoute();
  }, 200);
}

function updateCustomerMapRoute() {
  if (!AppState.customerMap) return;

  AppState.markers.forEach(m => AppState.customerMap.removeLayer(m));
  if (AppState.routeLine) AppState.customerMap.removeLayer(AppState.routeLine);
  AppState.markers = [];

  const p = [AppState.pickup.lat, AppState.pickup.lng];
  const d = [AppState.drop.lat, AppState.drop.lng];

  const markerA = L.marker(p).addTo(AppState.customerMap).bindPopup(`Pickup: ${AppState.pickup.name}`).openPopup();
  const markerB = L.marker(d).addTo(AppState.customerMap).bindPopup(`Drop: ${AppState.drop.name}`);
  AppState.markers.push(markerA, markerB);

  AppState.routeLine = L.polyline([p, d], { color: '#facc15', weight: 5, dashArray: '8, 8' }).addTo(AppState.customerMap);
  AppState.customerMap.fitBounds([p, d], { padding: [50, 50] });
}

function initDriverMap() {
  if (AppState.driverMap) return;
  setTimeout(() => {
    AppState.driverMap = L.map('driverMap').setView([11.0168, 76.9558], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(AppState.driverMap);

    L.marker([11.0168, 76.9558]).addTo(AppState.driverMap).bindPopup('Your Location: Gandhipuram').openPopup();

    // Trigger sample trip request after 2.5 seconds
    setTimeout(triggerMockDriverDispatch, 2500);
  }, 200);
}

// Distance Helper (Haversine formula)
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}