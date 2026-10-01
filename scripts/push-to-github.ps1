# Commit and push from this checkout; never force-push or discard changes.
$ErrorActionPreference = 'Stop'
$commitFile = $null
function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw "Git failed. Nothing further was attempted. Review the message above." }
}
try {
    Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git for Windows before running this file.' }
    $root = Invoke-Git rev-parse --show-toplevel
    $branch = Invoke-Git symbolic-ref --quiet --short HEAD
    if (-not $branch) { throw 'No branch is checked out. Switch to your working branch first.' }
    $remote = Invoke-Git remote get-url --push origin
    Write-Host "Folder: $root"
    Write-Host "Branch: $branch"
    Write-Host "Destination: $remote"
    Invoke-Git fetch origin
    $remoteRef = "refs/remotes/origin/$branch"
    & git show-ref --verify --quiet $remoteRef
    if ($LASTEXITCODE -eq 0) {
        & git merge-base --is-ancestor $remoteRef HEAD
        if ($LASTEXITCODE -ne 0) {
            throw 'GitHub has changes missing here. Sync and resolve them first, then run this file again. Your files were not changed.'
        }
    }
    $changes = @(Invoke-Git status --porcelain)
    if ($changes.Count -gt 0) {
        Write-Host '
Changes to include (.gitignore exclusions are respected):'
        Invoke-Git status --short
        Write-Host 'Check that no credentials or private files appear above. New secret files must be excluded in .gitignore.'
        $answer = Read-Host 'Commit these changes and push? Type YES to continue'
        if ($answer -cne 'YES') { Write-Host 'Cancelled.'; exit 0 }
        $message = Read-Host 'Commit message'
        if ([string]::IsNullOrWhiteSpace($message)) { throw 'A commit message is required. No files were staged.' }
        # A file keeps quotes, ampersands and other punctuation out of shell commands.
        $commitFile = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::WriteAllText($commitFile, $message, (New-Object System.Text.UTF8Encoding($false)))
        Invoke-Git add --all
        & git diff --cached --quiet
        $diffResult = $LASTEXITCODE
        if ($diffResult -eq 1) { Invoke-Git commit --file $commitFile }
        elseif ($diffResult -ne 0) { throw 'Could not inspect staged changes.' }
    } else {
        Write-Host 'No file changes. Pushing any existing local commits.'
    }
    Invoke-Git push --set-upstream origin $branch
    Write-Host '
GitHub push completed.' -ForegroundColor Green
    Write-Host 'A connected Vercel project may deploy this push. This script does not run tests or verify deployment.'
} catch {
    Write-Host "
$($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'If a commit was created before the push failed, it remains saved locally. Fix the error and run this file again.'
    exit 1
} finally {
    if ($commitFile -and (Test-Path -LiteralPath $commitFile)) { Remove-Item -LiteralPath $commitFile }
}
