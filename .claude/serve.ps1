param(
    # repo root, resolved from this script so the path is never stale
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [int]$Port = 4174
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "serving $Root on http://localhost:$Port/"

$types = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".md"   = "text/plain; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $path = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
        if ($path -eq "/") { $path = "/index.html" }
        $full = Join-Path $Root ($path.TrimStart("/") -replace "/", "\")

        try {
            if (Test-Path $full -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($full).ToLower()
                $type = $types[$ext]
                if (-not $type) { $type = "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($full)
                $context.Response.ContentType = $type
            } elseif (Test-Path $full -PathType Container) {
                # listed the way serve.py lists, which is what the game reads ICONS/ from
                $links = foreach ($item in Get-ChildItem -LiteralPath $full | Sort-Object Name) {
                    $slash = if ($item.PSIsContainer) { "/" } else { "" }
                    $href = [System.Uri]::EscapeDataString($item.Name) + $slash
                    $text = [System.Net.WebUtility]::HtmlEncode($item.Name + $slash)
                    "<li><a href=`"$href`">$text</a></li>"
                }
                $title = [System.Net.WebUtility]::HtmlEncode("Directory listing for $path")
                $html = "<!DOCTYPE html><html><head><meta charset=`"utf-8`"><title>$title</title></head><body><ul>$($links -join '')</ul></body></html>"
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($html)
                $context.Response.ContentType = "text/html; charset=utf-8"
            } else {
                $context.Response.StatusCode = 404
                $context.Response.ContentType = "text/plain; charset=utf-8"
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("not found: $path")
            }

            # both paths must declare a length, or the write overruns it
            $context.Response.Headers.Add("Cache-Control", "no-store")
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } finally {
            # always close, or a failed response leaves the connection hanging
            # and the requests behind it start misbehaving
            $context.Response.Close()
        }
    } catch {
        Write-Output "error: $_"
    }
}
