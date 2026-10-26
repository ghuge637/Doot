# Doot

**Doot** is a local Windows desktop application for organizing job-application contacts and sending personalized cold emails through your own SMTP account.

The application runs in your browser, while the bundled Spring Boot service works in the background on your computer. No Java installation is required when using the Windows installer.

## Download

Download the latest Windows installer from the [Releases](https://github.com/OWNER/REPOSITORY/releases) page.

Direct download after the first release is published:

`https://github.com/OWNER/REPOSITORY/releases/latest/download/Doot_Setup.exe`

> The `OWNER/REPOSITORY` text will be replaced with the final GitHub repository address before publishing.

## Features

- Import recruiter/contact lists from `.xlsx` files.
- Detect invalid and duplicate email addresses.
- Use fallback values when a company or recruiter name is missing.
- Upload a resume once and attach it to outgoing messages.
- Personalize subject and message text with `{{name}}`, `{{company}}`, and `{{role}}`.
- Configure Gmail, Outlook, or another SMTP provider.
- Send messages sequentially with a randomized delay and pause/stop controls.
- Track progress and sent history in a local H2 database.
- Run as a Windows background service after installation.

## Install and launch

1. Download `Doot_Setup.exe` from the latest GitHub release.
2. Run the installer and approve the Windows administrator prompt.
3. Keep the default installation options unless you have a reason to change them.
4. The installer starts the `DootService` Windows service and opens the dashboard.
5. If the browser does not open automatically, visit <http://localhost:8080>.

The installer is intended for **64-bit Windows** and includes its own Java runtime. Java 17 does not need to be installed separately.

## First-time setup

1. Open the SMTP settings in Doot.
2. Enter your email provider settings.
3. For Gmail, use a Google App Password rather than your normal account password.
4. Upload your resume.
5. Import an `.xlsx` contact list and review the detected contacts.
6. Edit the email template and send a test message to yourself before sending a campaign.

Doot stores its local database, uploaded resume, and service logs in the installation directory. SMTP settings are local application data; do not share the installation data folder with other people.

## Expected spreadsheet columns

Doot detects common header names automatically. The important column is an email column such as `Email` or `Email Address`. Optional columns include:

- `Name` or `Recruiter`
- `Company`
- `Role` or `Title`

Review the imported rows before sending. Only contact people who would reasonably expect your message, follow your email provider's rules, and comply with applicable anti-spam and privacy laws.

## Windows service controls

The installer registers a service named `DootService`.

- Open `services.msc` and find **Doot** to start, stop, or restart it.
- The dashboard is available at <http://localhost:8080> while the service is running.
- Uninstalling Doot stops and removes the service.

## Troubleshooting

### The browser page does not open

Wait a few seconds and open <http://localhost:8080> manually. If it still does not load, check that **Doot** is running in `services.msc` and inspect the `logs` folder under the installation directory.

### Port 8080 is already in use

Stop the application using port 8080, then restart **Doot**. The current installer and service configuration use port 8080.

### Gmail authentication fails

Enable two-step verification, create a Google App Password, and enter that App Password in Doot. Do not use your normal Google account password.

### Windows SmartScreen displays a warning

The release may be unsigned. Verify the SHA-256 checksum published in the release notes before choosing whether to continue. A signed installer can be added in a future release.

## Build from source

The source tree contains a React frontend and a Spring Boot backend. The reproducible installer build instructions are in [`automailer/BUILD-INSTALLER.md`](automailer/BUILD-INSTALLER.md).

The local build requires Node.js/npm, a Java 17 JDK, Launch4j, Inno Setup 6, and the WinSW service wrapper. The generated installer is written to `automailer/target/Doot_Setup.exe`.

## Release artifact

The initial release artifact is:

- File: `Doot_Setup.exe`
- Platform: Windows x64
- Version: `0.0.1`
- SHA-256: `CCD7B70507C23F251DF956B0421C48D5828D976A9A8EA24DF91E7B5172A866E4`

## License

License terms will be added before the public repository is published.
