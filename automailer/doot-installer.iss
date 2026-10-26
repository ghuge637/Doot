; Inno Setup Script for Doot Installer
; Compile with: "E:\Project Setup\softwares\Inno Setup 6\ISCC.exe" doot-installer.iss

#define MyAppName "Doot"
#define MyAppVersion "0.0.1"
#define MyAppPublisher "Doot"
#define MyAppURL "https://github.com/yourusername/doot"
#define MyAppExeName "doot.exe"
#define MyServiceExeName "DootService.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=target
OutputBaseFilename=Doot_Setup
SetupIconFile=
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "target\doot.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "target\doot-0.0.1-SNAPSHOT.jar"; DestDir: "{app}"; DestName: "doot.jar"; Flags: ignoreversion
Source: "target\runtime\*"; DestDir: "{app}\runtime"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\softwares\WinSW\WinSW-x64.exe"; DestDir: "{app}"; DestName: "{#MyServiceExeName}"; Flags: ignoreversion
Source: "installer\DootService.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{sys}\explorer.exe"; Parameters: "http://localhost:8080"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{sys}\explorer.exe"; Parameters: "http://localhost:8080"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{sys}\explorer.exe"; Parameters: "http://localhost:8080"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\{#MyServiceExeName}"; Parameters: "install"; WorkingDir: "{app}"; StatusMsg: "Installing Doot Windows service..."; Flags: runhidden waituntilterminated
Filename: "{app}\{#MyServiceExeName}"; Parameters: "start"; WorkingDir: "{app}"; StatusMsg: "Starting Doot Windows service..."; Flags: runhidden waituntilterminated

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  ErrorCode: Integer;
begin
  if (CurStep = ssPostInstall) and (not WizardSilent) then begin
    Sleep(5000);
    ShellExec('open', 'http://localhost:8080', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
  end;
end;

[UninstallRun]
Filename: "{app}\{#MyServiceExeName}"; Parameters: "stop"; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; RunOnceId: "StopDootService"
Filename: "{app}\{#MyServiceExeName}"; Parameters: "uninstall"; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; RunOnceId: "UninstallDootService"

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Registry]
Root: HKCU; Subkey: "Software\{#MyAppName}"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey
