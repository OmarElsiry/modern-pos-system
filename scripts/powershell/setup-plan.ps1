function Get-RepoRoot {
    if (git rev-parse --show-toplevel 2>$null) {
        return (git rev-parse --show-toplevel).Trim()
    }
    return (Get-Item -Path "$PSScriptRoot\..\..").FullName
}

function Get-CurrentBranch {
    if ($env:SPECIFY_FEATURE) {
        return $env:SPECIFY_FEATURE
    }
    if (git rev-parse --abbrev-ref HEAD 2>$null) {
        return (git rev-parse --abbrev-ref HEAD).Trim()
    }
    
    $repoRoot = Get-RepoRoot
    $specsDir = Join-Path $repoRoot "specs"
    if (Test-Path $specsDir) {
        $dirs = Get-ChildItem -Path $specsDir -Directory | Where-Object { $_.Name -match "^(\d{3})-" }
        if ($dirs) {
            $latest = $dirs | Sort-Object { [int]($_.Name -split '-')[0] } -Descending | Select-Object -First 1
            return $latest.Name
        }
    }
    return "main"
}

function Find-FeatureDirByPrefix {
    param($repoRoot, $branchName)
    $specsDir = Join-Path $repoRoot "specs"
    
    if ($branchName -match "^(\d{3})-") {
        $prefix = $Matches[1]
        $matches = Get-ChildItem -Path $specsDir -Directory -Filter "$prefix-*"
        if ($matches.Count -eq 1) {
            return $matches[0].FullName
        }
    }
    return Join-Path $specsDir $branchName
}

$repoRoot = Get-RepoRoot
$currentBranch = Get-CurrentBranch
$hasGit = Test-Path (Join-Path $repoRoot ".git")
$featureDir = Find-FeatureDirByPrefix $repoRoot $currentBranch

$FEATURE_SPEC = Join-Path $featureDir "spec.md"
$IMPL_PLAN = Join-Path $featureDir "plan.md"
$SPECS_DIR = $featureDir

# Handle Template
$template = Join-Path $repoRoot ".agent\templates\plan-template.md"
if (Test-Path $template) {
    if (-not (Test-Path $featureDir)) {
        New-Item -Path $featureDir -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path $template -Destination $IMPL_PLAN -Force
    
    $currentDate = Get-Date -Format "yyyy-MM-dd"
    $content = Get-Content -Path $IMPL_PLAN -Raw
    $content = $content -replace "\[link\]", "[Spec](spec.md)"
    $content = $content -replace "\[DATE\]", $currentDate
    $content = $content -replace "\[###-feature-name\]", $currentBranch
    Set-Content -Path $IMPL_PLAN -Value $content
    Write-Host "Copied plan template to $IMPL_PLAN"
} else {
    Write-Warning "Plan template not found at $template"
    if (-not (Test-Path $IMPL_PLAN)) {
        if (-not (Test-Path $featureDir)) {
            New-Item -Path $featureDir -ItemType Directory -Force | Out-Null
        }
        New-Item -Path $IMPL_PLAN -ItemType File -Force | Out-Null
    }
}

# Output JSON if requested
if ($args -contains "--json") {
    $obj = @{
        FEATURE_SPEC = $FEATURE_SPEC
        IMPL_PLAN = $IMPL_PLAN
        SPECS_DIR = $featureDir
        BRANCH = $currentBranch
        HAS_GIT = $hasGit.ToString().ToLower()
    }
    $obj | ConvertTo-Json -Compress
} else {
    Write-Host "FEATURE_SPEC: $FEATURE_SPEC"
    Write-Host "IMPL_PLAN: $IMPL_PLAN"
    Write-Host "SPECS_DIR: $featureDir"
    Write-Host "BRANCH: $currentBranch"
    Write-Host "HAS_GIT: $hasGit"
}
