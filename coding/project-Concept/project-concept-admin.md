# Project Concept: Admin Management System

## Overview
This project is a comprehensive **Admin Management System** designed to facilitate secure and efficient management of administrative users across various domains (e.g., Government, Banking, Education). It features a robust hierarchy differentiating between **Super Admins** and **Regular Admins**, each with distinct portals, capabilities, and workflows.

## Project Hierarchy

### 1. Super-admin / Administrator
**Role**: The highest level of authority in the system.
**Access Point**: Dedicated Super Admin Console (`Superadminindex.html`).
**Data Source**: `Superadmin` table in Supabase.

**Key Responsibilities & Capabilities**:
*   **Secure Authentication**: Dedicated login portal with email/password authentication.
*   **Admin Creation**: Ability to manually create new Admin accounts with specific roles (Admin, Viewer, etc.) and credentials.
*   **Request Management**:
    *   View and process "New Admin Requests" (`Newadminrequest.html`).
    *   Approve or Reject requests.
    *   **UI Type Assignment**: Assign specific operational contexts to admins (e.g., Government UI, Bank UI, Hospital UI).
*   **Admin Oversight**:
    *   Manage existing administrators (`AdminsConsole.html`, `Manageadmins.html`).
    *   Monitor password reset requests (`passwordresetrequests.html`).
    *   View history of rejected requests (`rejectederquests.html`).
*   **System Feedback**: Access to system-wide feedback and reports (`super-admin-feedback.html`).

### 2. Admin
**Role**: Operational administrators responsible for specific domains.
**Access Point**: General Admin Portal (`index.html`).
**Data Source**: `admin` table in Supabase.

**Key Responsibilities & Capabilities**:
*   **Flexible Access**:
    *   Dual Login Methods: Email + Password **OR** Username + PIN.
    *   Account Activation Workflow: Inactive admins can request activation by submitting identity proof (`activationrequest.html`).
*   **Dashboard**:
    *   Personalized `admin-dashboard.html`.
    *   **Profile Management**: Update personal details, contact info, and upload/update **Profile Avatar**.
*   **Operational Contexts**:
    *   Based on assignment, admins interact with specific UIs:
        *   `governmentUi.html`
        *   `bankUi.html`
        *   `collegeSchoolUi.html`
        *   `hospitalUi.html`
        *   `restaurantUi.html`
        *   `pharmacyUi.html`
        *   `ngoUi.html`
        *   `retailUi.html`
        *   `mobileShopUi.html`
        *   `courtUi.html`
*   **Status Tracking**: Track the status of their own administrative requests (`trackstatusadmin.html`, `managerequest.html`).

## Key Features

### Authentication & Authorization
*   **Dual-Portal System**: Separate secure entry points for Super Admins and Regular Admins to prevent privilege escalation.
*   **Session Management**: Secure session handling using `localStorage` and Supabase Auth.
*   **Password Security**: Password toggle visibility (eye icon) and PIN-based quick access.

### User Interface & Experience (UI/UX)
*   **Modern Design**:
    *   Glassmorphism effects.
    *   Vibrant, gradient backgrounds (`style.css`).
    *   Centering layout for Login and Console pages (`.centered-layout`).
*   **Interactive Elements**:
    *   **Floating Backgrounds**: Animated gradient orbs (`floatOne`, `floatTwo`).
    *   **Interactive Particles**: Mouse-tracking floating bubbles with depth, parallax, and organic movement physics.
*   **Responsive Layouts**: Mobile-friendly grids and forms.

### Workflow Automation
*   **Activation Requests**: Automated flow for inactive admins to submit ID proofs, which enter a "Pending" queue for Super Admin review.
*   **Feedback System**: Integrated feedback loops for admins to report issues or suggestions.

### Technical Stack
*   **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Custom properties, Flexbox/Grid).
*   **Backend / Database**: Supabase (PostgreSQL).
    *   `admin` table: Stores regular admin data.
    *   `Superadmin` table: Stores super admin credentials.
    *   `adminactivationrequests`: Queues activation requests.
    *   Storage Buckets: Used for `avatars` and `identity-proofs`.
*   **Icons**: SVG Icons (Lucide-style).
*   **Fonts**: Google Fonts (Inter).

## File Structure Highlights
*   `index.html`: Main login for Admins.
*   `Superadminindex.html`: Login for Super Admins.
*   `admin-dashboard.html`: Main hub for logged-in Admins.
*   `Newadminrequest.html`: Super Admin tool for processing requests.
*   `js/main.js`: Core logic for Admin login and general interactions.
*   `js/superadmin.js`: Core logic for Super Admin authentication and console.
*   `js/dashboard.js`: Logic for the Admin Dashboard (profile, settings).

## Changelog
| Date | Author | Description of Changes |
| :--- | :--- | :--- |
| 2025-12-14 | User & AI | Included "Centered Layout" for `index.html` and `Superadminindex.html` to improve visual alignment. |
| 2025-12-14 | User & AI | Added interactive floating bubbles animation to the background of `index.html`. |
| 2025-12-14 | User & AI | Implemented profile image upload for Admin Dashboard using Supabase Storage. |
| 2025-12-14 | User & AI | Added status filter buttons (All, Pending, Approved, Rejected) to `Newadminrequest.html`. |
| 2025-12-15 | User & AI | Created `project-concept-admin.md` to document project hierarchy and features. |
