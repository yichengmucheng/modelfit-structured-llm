# Static file server for ModelFit demo
param(
    [int]$StartPort = 8081,
    [int]$MaxAttempts = 20,
    [string]$DemoRoot = ''
)

$ErrorActionPreference = 'Continue'
$ScriptDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($DemoRoot)) {
    if (Test-Path (Join-Path (Split-Path $ScriptDir -Parent) 'index.html')) {
        $DemoRoot = Split-Path $ScriptDir -Parent
    } else {
        $DemoRoot = $ScriptDir
    }
}

function Write-Step {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message"
}

function Get-ContentType {
    param([string]$FilePath)
    switch ([System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.js' { return 'application/javascript; charset=utf-8' }
        '.css' { return 'text/css; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.svg' { return 'image/svg+xml' }
        '.png' { return 'image/png' }
        '.jpg' { return 'image/jpeg' }
        '.jpeg' { return 'image/jpeg' }
        '.woff' { return 'font/woff' }
        '.woff2' { return 'font/woff2' }
        default { return 'application/octet-stream' }
    }
}

function Resolve-DemoFile {
    param([string]$Root, [string]$RelativePath)
    $relative = $RelativePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
    $filePath = Join-Path $Root $relative
    if (-not (Test-Path $filePath -PathType Leaf)) {
        $filePath = Join-Path $Root 'index.html'
    }
    return $filePath
}

function Find-AvailablePort {
    param([int]$FromPort, [int]$Attempts)
    for ($candidate = $FromPort; $candidate -lt ($FromPort + $Attempts); $candidate++) {
        $listener = $null
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidate)
            $listener.Start()
            return $candidate
        } catch {
            Write-Step "Port $candidate in use, trying next ..."
        } finally {
            if ($null -ne $listener) {
                $listener.Stop()
            }
        }
    }
    return 0
}

function Write-ServerState {
    param([string]$Root, [int]$ActivePort)
    $stateFile = Join-Path $Root '.demo-server.state'
    @(
        "port=$ActivePort"
        "pid=$PID"
    ) | Set-Content -Path $stateFile -Encoding ASCII
}

function Remove-ServerState {
    param([string]$Root)
    $stateFile = Join-Path $Root '.demo-server.state'
    if (Test-Path $stateFile) {
        Remove-Item $stateFile -Force -ErrorAction SilentlyContinue
    }
}

try {
    $Root = (Resolve-Path $DemoRoot).Path
} catch {
    Write-Step "[ERROR] Invalid demo folder: $DemoRoot"
    exit 1
}

if (-not (Test-Path (Join-Path $Root 'index.html'))) {
    Write-Step '[ERROR] index.html not found'
    exit 1
}

Write-Step "Demo root: $Root"
Write-Step "Looking for free port from $StartPort ..."

$activePort = Find-AvailablePort -FromPort $StartPort -Attempts $MaxAttempts
if ($activePort -le 0) {
    Write-Step "[ERROR] No free port in range $StartPort-$($StartPort + $MaxAttempts - 1)"
    exit 1
}

Write-Step "Using port: $activePort"
Write-ServerState -Root $Root -ActivePort $activePort

$openUrl = "http://127.0.0.1:${activePort}/#/login"
$listener = $null

try {
    Write-Step 'Starting server ...'
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $activePort)
    $listener.Start()

    Write-Host ''
    Write-Host '========================================'
    Write-Host '  ModelFit static demo - RUNNING'
    Write-Host '========================================'
    Write-Host "URL: $openUrl"
    Write-Host 'DO NOT CLOSE THIS WINDOW'
    Write-Host ''

    try {
        Start-Job -ScriptBlock {
            param($url)
            Start-Sleep -Seconds 2
            Start-Process $url
        } -ArgumentList $openUrl | Out-Null
    } catch {
        Write-Step "WARN: auto open browser failed: $($_.Exception.Message)"
    }

    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
            $requestLine = $reader.ReadLine()
            while ($null -ne ($headerLine = $reader.ReadLine()) -and $headerLine -ne '') { }

            $relative = 'index.html'
            if ($requestLine -match '^GET\s+([^\s?]+)') {
                $relative = $Matches[1]
            }

            $filePath = Resolve-DemoFile -Root $Root -RelativePath $relative
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $contentType = Get-ContentType -FilePath $filePath
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } catch {
            Write-Step "WARN: request failed: $($_.Exception.Message)"
        } finally {
            $client.Close()
        }
    }
} catch {
    Write-Step "[ERROR] $($_.Exception.Message)"
    exit 1
} finally {
    if ($null -ne $listener) {
        $listener.Stop()
    }
    Remove-ServerState -Root $Root
}
