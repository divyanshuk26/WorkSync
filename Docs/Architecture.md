System Architecture Documentation
High-Level Architecture
The application follows a linear, top-down data flow to ensure clear separation of concerns and maintainability:
React Native (UI) ➔ React Navigation ➔ Auth Context (Global State) ➔ Service Layer ➔ Supabase SDK ➔ Supabase Backend ➔ PostgreSQL Database
Architecture Layers

1. Presentation Layer (UI)
   • Directory Location: src/screens and src/components
   • Responsibilities:
   o Rendering the User Interface (UI)
   o Capturing user inputs
   o Displaying dynamic data
   o Invoking service functions
   • Constraint: No database or business logic exists within the screen components.
2. Navigation Layer
   • Directory Location: src/navigation
   • Responsibilities:
   o Authentication routing
   o Employer and Employee role-based navigation
   o Managing screen transitions
   • Navigation Flow: App.js ➔ NavigationContainer ➔ AppNavigator ➔ [EmployerNavigator / EmployeeNavigator / AuthNavigator]
3. Context Layer
   • Directory Location: src/context/AuthContext.js
   • Responsibilities:
   o Managing global authentication state
   o Storing logged-in user credentials and profiles
   o Handling user role identification
   o Managing session restoration, Sign-In, and Sign-Out processes
   • Constraint: This layer acts as the Single Source of Truth (SSOT) for all authentication data.
4. Service Layer
   • Directory Location: src/services
   • Responsibilities:
   o Executing database queries
   o Processing authentication requests
   o Housing core business logic
   o Facilitating all communication with the Supabase backend
   • Implemented Services: authService, employeeService, dashboardService, taskService, leaveService
5. Backend
   • Platform: Supabase
   • Utilized For:
   o Secure Authentication
   o PostgreSQL Database hosting
   o REST API generation
   o User Session Management
6. Database
   • Database Engine: PostgreSQL (Hosted via Supabase)
   • Primary Tables:
   o profiles
   o tasks
   o leave_requests
   o announcements
   System Workflows
   Authentication Flow
   User Login ➔ LoginScreen ➔ AuthContext.signIn() ➔ authService.signIn() ➔ Supabase Authentication ➔ Authenticated User ➔ Query profiles table ➔ Role Fetched ➔ Route to Employer/Employee Navigation
   Dashboard Flow
   EmployerDashboard ➔ dashboardService ➔ Interacts with employeeService, taskService, & leaveService ➔ Supabase ➔ PostgreSQL Database ➔ Metrics Calculated ➔ Rendered on Dashboard Cards
   Employee Management Flow
   EmployeeList ➔ employeeService ➔ Supabase ➔ Query profiles table ➔ Retrieve Employee Data ➔ Render via FlatList component
   Architectural Decisions
   Why Context API? The Context API was implemented because authentication data (such as the logged-in user, profile details, and role) is required across multiple screens simultaneously. Utilizing the Context API eliminates "prop drilling" and provides a highly efficient, centralized global state for authentication.
   Why a Service Layer? The Service Layer strictly decouples business logic from the UI. Screen components are exclusively responsible for user interaction and rendering, while all external database communications and data processing are routed through dedicated service files. This separation of concerns significantly improves:
   • Code readability
   • Component reusability
   • System maintainability
   • Application scalability
   Design Pattern Summary
   The application strictly adheres to a Layered Architecture.
   Execution Flow: UI Layer ➔ Context Layer ➔ Service Layer ➔ Supabase ➔ Database
   By ensuring each layer operates with a single, well-defined responsibility, the application remains highly modular, testable, and structurally sound for future scaling.
