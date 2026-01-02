# EduCore Application

## Project Overview
EduCore is a comprehensive educational management system designed to streamline administrative tasks for schools and training centers. It provides robust tools for managing students, courses, financials, and compliance, all within a secure and user-friendly desktop application.


## New Features in v1.1.0
*   **Global Search:** Quickly find students and courses from the navigation bar.
*   **Auto-Save:** Data is automatically saved to local storage to prevent loss.
*   **Toast Notifications:** Instant feedback for all actions (create, update, delete).
*   **Factory Reset:** Option to wipe all data and restore default settings.
*   **Payment Follow-up Ledger:** Track payment follow-ups directly in student details.

## Installation & Deployment
To install the application on a Windows machine:

1.  Locate the installer file: `EduCore Setup 1.1.0.exe`.
2.  Double-click the installer to begin the installation process.
3.  Follow the on-screen prompts. The application will automatically install and launch.
4.  A shortcut will be created on your desktop for future access.

## Administrator Access
The application comes with a default administrator account.

*   **Username:** `admin`
*   **Default Password:** `password`

### Master Reset Key
In case of a lockout or lost password, use the Master Reset Key to regain access:
*   **Key:** `supersecret123`

> **Security Note:** It is highly recommended to change the default password immediately after the first login via the Settings page.

## Configuration Guide
EduCore allows administrators to customize critical application rules and thresholds to fit their specific operational needs.

To adjust these settings:
1.  Navigate to the **Settings** page from the main menu.
2.  Select the **Core Application Rules** tab.
3.  Locate the **Risk & Alert Thresholds** section.

### Configurable Thresholds:
*   **Payment Due Alert (Days):** Set the number of days before a payment is due to trigger a notification (Default: 15 days).
*   **Attendance Risk Threshold (%):** Set the minimum attendance percentage required. Students falling below this will be flagged as "At Risk" (Default: 70%).
*   **Course Completion Alert (% Progress):** Set the progress percentage at which a "Course Completion" alert is generated (Default: 90%).
*   **Default Max Points:** Set the default maximum points for new grading items (Default: 100).

Changes take effect immediately and are persisted across application restarts.

## Update Procedure (Manual)
EduCore uses a safe, manual update process to ensure data integrity.

1.  **Notification:** When a new version is available, you will see an **"Update Available!"** notification banner at the top of the application.
2.  **Contact Administrator:** The notification will prompt you to contact your system administrator (or the developer) to obtain the new installation file.
3.  **Run Installer:** Once you have the new `EduCore Setup [Version].exe`, simply run it.
    *   The installer will automatically detect the existing installation and upgrade it.
    *   **Data Preservation:** Your existing data (students, courses, settings) is preserved during the update process. You do not need to uninstall the previous version first.

## Project Ownership
**Developed by:** Ataklti
