# Doot
A local Windows application for managing job contacts and sending personalized emails.

A Windows desktop application for organizing job-application contacts and sending personalized emails through your own SMTP account.

## Download Doot

**Platform:** Windows x64

**Latest version:** 0.0.1

**[Download Doot for Windows](https://github.com/YOUR_USERNAME/doot/releases/latest/download/Doot_Setup.exe)**

Replace `YOUR_USERNAME` with your GitHub username. This download link will work once you publish the release and attach the installer with the exact filename `Doot_Setup.exe`.

## Features

- Import contacts from Excel (`.xlsx`) files.
- Detect invalid and duplicate email addresses.
- Personalize messages using `{{name}}`, `{{company}}`, and `{{role}}`.
- Attach your resume to outgoing emails.
- Configure Gmail, Outlook, or another SMTP provider.
- Send emails sequentially with randomized delays and pause/stop controls.
- Track sending progress and sent history locally.

## Installation

1. Download `Doot_Setup.exe` from the Releases page.
2. Run the installer and approve the administrator prompt if required.
3. Open Doot after installation.
4. Visit http://localhost:8080 if the dashboard does not open automatically.
5. Configure your SMTP settings and upload your resume.
6. Import your contact spreadsheet and send a test email to yourself.

The installer is designed for 64-bit Windows and includes its own Java runtime.

## Security and privacy

Doot uses your own SMTP account to send emails. Keep your SMTP credentials and local application data private. Review all imported contacts and message templates before sending.

Use the application responsibly and comply with your email provider's policies and applicable privacy and anti-spam laws.

## Verify the installer

See the SHA-256 checksum and verification instructions in the corresponding GitHub release.

## Support

For bugs or installation issues, open an issue in this repository without including passwords, SMTP credentials, personal contact lists, or other sensitive information.

## License

Usage and redistribution terms will be published separately. Until then, do not assume that permission to download grants permission to redistribute or resell the application.
