# Public GitHub Release Checklist

## Repository

- [ ] Create or select the public GitHub repository.
- [ ] Commit the source tree and documentation.
- [ ] Confirm that local data, credentials, build outputs, and personal sample files are ignored.
- [ ] Add the final repository URL to `README.md` and `automailer/launch4j-config.xml`.
- [ ] Add a license selected by the project owner.

## Release

- [ ] Create tag `v0.0.1`.
- [ ] Create a GitHub Release titled `Doot 0.0.1`.
- [ ] Upload `automailer/target/Doot_Setup.exe` as a release asset.
- [ ] Publish the SHA-256 checksum in the release notes.
- [ ] Verify that the public download link works in a private browser window.

## Recipient verification

- [ ] Test installation on a clean 64-bit Windows computer.
- [ ] Confirm that the installer starts `DootService`.
- [ ] Confirm that `http://localhost:8080` opens.
- [ ] Configure SMTP and send a test email.
- [ ] Confirm that uninstall removes the service cleanly.
