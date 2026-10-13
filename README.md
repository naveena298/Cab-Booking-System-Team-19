# RideGo — Bike & Auto Ride Booking Platform

RideGo is a responsive ride-booking **frontend demo** inspired by ride-hailing apps. It demonstrates a customer booking flow, a driver/captain trip flow, and an admin console using sample data for Coimbatore, Tamil Nadu.

> **Project status:** This repository currently uses HTML, CSS, vanilla JavaScript, a small Node.js static-file server, and mock in-memory data. It does not currently implement a production backend, MongoDB persistence, JWT authentication, or real payment processing.

## Features

### Customer portal
- Demo sign-in
- Choose pickup and destination from Coimbatore landmarks
- Swap locations and view estimated distance, ETA, and fares
- Choose Bike, Auto, or Cab
- Simulated driver search and ride tracking
- Cancel a ride
- Simulated payment and receipt flow
- Rate a completed ride

### Driver / Captain portal
- Demo sign-in
- Toggle online/offline duty
- View trip details
- Progress through the simulated trip workflow
- Verify a ride OTP in the demo flow

### Admin portal
- Demo sign-in
- View sample driver information
- Toggle a sample driver's status

### Interface
- Responsive, mobile-oriented layout
- Leaflet map integration with demo Coimbatore coordinates
- Font Awesome icons
- Plus Jakarta Sans typography

## Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript (vanilla) | UI interactions and demo ride logic |
| Node.js (`http`, `fs`, `path`) | Serves the static files |
| Leaflet | Map display |
| OpenStreetMap tiles | Map tiles, as configured by Leaflet |

## Project Structure

```text
project/
├── index.html   # Application layout and portals
├── style.css    # Styling and responsive design
├── app.js       # Demo data, ride flow, fare calculation, map logic
├── server.js    # Minimal Node.js static-file server
└── README.md
```

## Run Locally

### Requirements
- Node.js installed
- A modern browser
- Internet access for external fonts, icons, and map assets

### 1. Download or clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Replace the placeholders with your actual GitHub repository URL and folder name.

### 2. Start the server

From the folder containing `server.js`, run:

```bash
node server.js
```

The server listens on port **3000**.

### 3. Open the application

Visit:

```text
http://localhost:3000
```

If port 3000 is already in use, change the `PORT` value in `server.js` before starting the server again.

## Demo Login

Use the **1-Click Demo Login** button on the relevant portal to populate the demo credentials and sign in.

| Portal | Demo email / ID | Demo password |
|---|---|---|
| Customer | `ramesh@example.com` | `password123` |
| Captain / Driver | `karthik@ridego.in` | `driverpassword` |
| Admin | `admin@ridego.in` | `adminpassword` |

These credentials are hardcoded for demonstration only. **Do not use these credentials or this authentication approach in a deployed production application.**

## Demo Locations

The app includes sample coordinates for Coimbatore landmarks such as:

- Gandhipuram Bus Stand
- RS Puram (DB Road)
- Peelamedu (PSG Tech)
- Singanallur Junction
- Ukkadam Bus Stand
- Saibaba Colony
- Coimbatore Railway Station
- TIDEL Park Coimbatore

## Fare Estimation

The interface displays estimated fares for Bike, Auto, and Cab rides. Fare values and trip details are part of the demo logic in `app.js`; they are not live quotes from a ride provider.

## Important Limitations

- User accounts and driver data are stored in JavaScript mock data.
- Ride, payment, and rating flows are simulations.
- Data is not persisted to a database and may reset when the page is refreshed.
- Driver assignment and trip movement are simulated.
- Map and external assets require an internet connection.
- No real payment gateway, SMS/OTP provider, or production authentication is connected.
- The included Node.js server serves static files only; it is not a REST API backend.

## Future Improvements

- Add an Express.js REST API
- Persist users, drivers, rides, payments, and ratings in MongoDB
- Add secure authentication and role-based authorization
- Implement real-time ride updates with WebSockets
- Integrate routing and geocoding APIs for accurate distances and routes
- Add a payment gateway in a secure test environment
- Add validation, automated tests, and deployment configuration

## Purpose

RideGo is an educational project for exploring interactive frontend development, role-based user flows, map-based interfaces, and the core steps in a ride-booking experience.

## Author

**Naveena**

- GitHub: https://github.com/naveena298

## Disclaimer

RideGo is an independent educational demo. It is not affiliated with, endorsed by, or an official product of Rapido. Names, sample users, fares, and trip data are provided for demonstration.
