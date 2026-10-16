<#
.SYNOPSIS
  Puts every app project on this PC onto GitHub as a PRIVATE repository.

.DESCRIPTION
  Looks at each folder directly under -Root that is a project (has .git, a
  .sln/.csproj, package.json, or build.ps1) and:

    - already on GitHub   -> pushes any commits not yet pushed
    - git but no remote   -> creates a private GitHub repo and pushes
    - not in git yet      -> adds a .gitignore if missing, commits, creates a
                             private GitHub repo and pushes

  It never makes a repository public, never force-pushes, and skips (and
  lists) any project with uncommitted changes or files that look like
  secrets (.env, certificates, keys, serial/licence generators), so you can
  look at those yourself.

  Without -Go it only prints what it would do. Run that first.

.EXAMPLE
  .\push-pc-projects.ps1 -Root "$HOME\source\repos"
  .\push-pc-projects.ps1 -Root "$HOME\source\repos" -Go

.NOTES
  Needs Git for Windows and the GitHub CLI (winget install GitHub.cli),
  signed in with: gh auth login
#>
param(
  [Parameter(Mandatory)] [string] $Root,
  [string] $Owner,
  [switch] $Go
)

# 'Continue' so git/gh writing to stderr is not treated as a crash in
# Windows PowerShell 5.1; exit codes are checked instead.
$ErrorActionPreference = 'Continue'

foreach ($tool in 'git', 'gh') {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "$tool is not installed." }
}
gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw 'Run "gh auth login" first.' }
if (-not $Owner) { $Owner = (gh api user --jq .login).Trim() }

$defaultIgnore = @'
bin/
obj/
dist/
build/
out/
node_modules/
.vs/
*.user
*.suo
.env
.env.*
*.pfx
*.p12
*.pem
*.key
*.snk
'@

# Names that should never reach GitHub, even privately, without a look first.
$secretPattern = '(^|[\\/])(\.env(\..*)?|.*\.(pfx|p12|pem|key|snk|cer)|.*(secret|password|keygen|serial-?gen|licen[cs]e-?gen|private[-_]?key).*)$'

function Test-Project($dir) {
  (Test-Path (Join-Path $dir '.git')) -or
  (Test-Path (Join-Path $dir 'package.json')) -or
  (Test-Path (Join-Path $dir 'build.ps1')) -or
  @(Get-ChildItem $dir -File -Include *.sln, *.csproj -Recurse -Depth 1 -ErrorAction SilentlyContinue).Count -gt 0
}

function Get-RepoName($name) {
  ($name -replace '[^A-Za-z0-9._-]+', '-').Trim('-')
}

$report = [System.Collections.Generic.List[object]]::new()
function Add-Result($project, $status, $detail) {
  $report.Add([pscustomobject]@{ Project = $project; Status = $status; Detail = $detail })
}

foreach ($dir in Get-ChildItem $Root -Directory) {
  $path = $dir.FullName
  $name = $dir.Name
  if (-not (Test-Project $path)) { continue }

  Push-Location $path
  try {
    $isGit = Test-Path '.git'
    $origin = if ($isGit) { (git remote get-url origin 2>$null) } else { $null }

    if ($isGit -and (git status --porcelain)) {
      Add-Result $name 'SKIPPED' 'Uncommitted changes. Commit them, then run again.'
      continue
    }

    if ($origin) {
      $branch = (git rev-parse --abbrev-ref HEAD).Trim()
      git fetch -q origin 2>$null
      $ahead = (git rev-list --count "origin/$branch..HEAD" 2>$null)
      if ($LASTEXITCODE -ne 0) { $ahead = 'all' }
      if ($ahead -eq '0') { Add-Result $name 'UP TO DATE' $origin; continue }
      if ($Go) {
        git push -u origin $branch
        if ($LASTEXITCODE -ne 0) { throw "git push failed" }
        Add-Result $name 'PUSHED' "$ahead commit(s) to $origin"
      }
      else { Add-Result $name 'WOULD PUSH' "$ahead commit(s) on $branch to $origin" }
      continue
    }

    $repo = Get-RepoName $name
    gh repo view "$Owner/$repo" *> $null
    if ($LASTEXITCODE -eq 0) {
      Add-Result $name 'SKIPPED' "github.com/$Owner/$repo already exists. Link it with: git remote add origin https://github.com/$Owner/$repo"
      continue
    }

    # Stage everything (honouring .gitignore, or the default one) to see
    # exactly what would be uploaded. A dry run undoes this afterwards.
    $madeGit = -not $isGit
    $madeIgnore = -not (Test-Path '.gitignore')
    if ($madeIgnore) { Set-Content '.gitignore' $defaultIgnore }
    if ($madeGit) { git init -q -b main; git add -A }
    $files = if ($madeGit) { git diff --cached --name-only } else { git ls-files }
    $risky = @($files | Where-Object { $_ -match $secretPattern })

    if ($risky.Count -or -not $Go) {
      if ($madeGit) { Remove-Item -Recurse -Force '.git' }
      if ($madeIgnore) { Remove-Item '.gitignore' }
      if ($risky.Count) { Add-Result $name 'SKIPPED' ('Possible secrets, check before uploading: ' + ($risky -join ', ')) }
      else { Add-Result $name 'WOULD CREATE' "private repo github.com/$Owner/$repo ($(@($files).Count) files)" }
      continue
    }

    if ($madeIgnore -and -not $madeGit) { git add .gitignore; git commit -q -m 'Add .gitignore' }
    if ($madeGit) { git commit -q -m 'Initial commit' }
    gh repo create "$Owner/$repo" --private --source . --remote origin --push
    if ($LASTEXITCODE -ne 0) { throw "gh repo create failed" }
    Add-Result $name 'CREATED' "private repo github.com/$Owner/$repo"
  }
  catch {
    Add-Result $name 'FAILED' $_.Exception.Message
  }
  finally {
    Pop-Location
  }
}

$report | Format-Table -AutoSize -Wrap
if (-not $Go) { Write-Host "`nNothing was changed. Run again with -Go to do it." -ForegroundColor Yellow }
