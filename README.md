# WorkSync

## Employer & Employee Management Application

---

# Project Overview

WorkSync is a cross-platform mobile application developed using **React Native** as part of the **3J Technologies React Native Internship Assignment**.

The application provides a centralized platform where **Employers** can manage employees, assign tasks, monitor leave requests, and communicate with their workforce, while **Employees** can view assigned tasks, manage leave requests, and access their personal profiles.

The project follows a **Layered Architecture** using **React Native**, **Supabase**, and **Context API** to ensure scalability, maintainability, and separation of concerns.

---

# Objective

The primary objective of WorkSync is to simplify employer-employee communication by providing a centralized platform for authentication, employee management, task tracking, leave management, and organizational communication.

---

# Features

## Authentication

- Secure Login using Supabase Authentication
- Persistent User Sessions
- Role-Based Navigation
- Employer Login
- Employee Login

---

## Employer Module

- Employer Dashboard
- Employee Directory
- Add Employee
- Task Management (In Progress)
- Leave Management (In Progress)
- Employer Profile

---

## Employee Module

- Employee Dashboard
- My Tasks
- Apply Leave
- Employee Profile

---

# Technology Stack

## Frontend

- React Native
- Expo
- React Navigation
- Context API

## Backend

- Supabase

## Database

- PostgreSQL (Supabase)

## Authentication

- Supabase Authentication

## Local Storage

- AsyncStorage

---

# Project Structure

```text
src/
│
├── components/      # Reusable UI Components
├── config/          # Supabase Configuration
├── context/         # Authentication State Management
├── navigation/      # Navigation Flow
├── screens/         # Application Screens
├── services/        # Business Logic & Database Operations
└── utils/           # Constants & Utility Functions
```

---

# System Architecture

The application follows a Layered Architecture.

```text
React Native UI
        │
        ▼
React Navigation
        │
        ▼
Auth Context
        │
        ▼
Service Layer
        │
        ▼
Supabase SDK
        │
        ▼
PostgreSQL Database
```

## Architecture Layers

### Presentation Layer

Responsible for:

- Rendering User Interface
- Accepting User Input
- Displaying Data

---

### Navigation Layer

Responsible for:

- Authentication Routing
- Employer Navigation
- Employee Navigation
- Screen Navigation

---

### Context Layer

Responsible for:

- Authentication State
- Logged-in User
- User Profile
- User Role
- Session Management

---

### Service Layer

Responsible for:

- Business Logic
- Database Operations
- Authentication
- Communication with Supabase

Services Implemented:

- authService
- employeeService
- dashboardService
- taskService
- leaveService

---

### Backend Layer

Platform:

- Supabase

Responsibilities:

- Authentication
- Database
- Session Management
- REST APIs

---

### Database Layer

Database:

- PostgreSQL (Supabase)

Tables:

- profiles
- tasks
- leave_requests
- announcements

---

# Authentication Flow

```text
Login Screen
      │
      ▼
AuthContext
      │
      ▼
authService
      │
      ▼
Supabase Authentication
      │
      ▼
profiles Table
      │
      ▼
Role Detection
      │
      ▼
Employer / Employee Navigation
```

---

# Database Schema

The application currently uses the following tables.

## profiles

Stores:

- User Information
- Role
- Department
- Designation
- Contact Details

## tasks

Stores:

- Task Information
- Assigned Employee
- Deadline
- Progress
- Status

## leave_requests

Stores:

- Leave Requests
- Leave Dates
- Approval Status

## announcements

Stores:

- Company Announcements
- Notices
- Organization Updates

---

# Installation

```bash
git clone <repository-url>

cd WorkSync

npm install

npx expo start
```

---

# Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL

EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

# AI Tools Used

The following AI tools were used during development.

## ChatGPT

- Concept Understanding
- Architecture Planning
- Technical Guidance
- Documentation

## Claude (Antigravity)

- Code Implementation
- Debugging
- Refactoring
- Code Review

## Gemini

- Cross Verification
- Problem Solving
- Alternative Approaches

AI assisted in:

- Architecture Design
- Folder Structure Planning
- Code Generation
- SQL Query Generation
- Documentation
- Debugging

**Note:** All AI-generated code was manually reviewed, modified, tested, and integrated before being committed.

---

# Assumptions

- Every user has one role.
- Authentication is handled using Supabase.
- Employers can manage employees.
- Employees can access only their own data.
- Internet connection is required.

---

# Feature Prioritization

## P0 (Must Have)

- Authentication
- Employer Dashboard
- Employee Dashboard
- Employee Management
- Task Management
- Leave Management

**Reason:** Core functionality required for a complete employee management system.

---

## P1 (Should Have)

- Attendance
- Announcements
- Notifications

**Reason:** Improves the overall user experience.

---

## P2 (Nice To Have)

- Analytics Dashboard
- Reports & Charts
- Push Notifications
- File Uploads
- Dark Mode
- Admin Panel

**Reason:** Future enhancements to improve scalability and user experience.

---

# Future Improvements

- Attendance Management
- Push Notifications
- Task Comments
- File Upload
- Employee Analytics
- Calendar Integration
- Dark Mode
- Reports & Charts

---

# Screenshots

Screenshots will be added after completion of all core modules.

---

# Author

**Divyanshu Kotangale**

React Native Internship Assignment

3J Technologies
