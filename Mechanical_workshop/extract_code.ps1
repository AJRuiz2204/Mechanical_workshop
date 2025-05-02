# Fichero de salida
$output = Join-Path -Path (Get-Location) -ChildPath 'all_code.txt'
'' | Out-File -FilePath $output -Encoding utf8

# Carpetas a procesar
$dirs = @('Controllers','Data','DTOs','Models','Profiles')

foreach ($dir in $dirs) {
    if (Test-Path $dir -PathType Container) {
        Get-ChildItem -Path $dir -Recurse -Filter '*.cs' | ForEach-Object {
            $file = $_.FullName
            "===== $file =====" | Out-File -FilePath $output -Append -Encoding utf8
            Get-Content -Path $file | Out-File -FilePath $output -Append -Encoding utf8
            "`r`n" | Out-File -FilePath $output -Append -Encoding utf8
        }
    }
}

Write-Host "Extracción completada en $output"
