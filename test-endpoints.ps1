# Test de Endpoints de Misiles
Write-Host "TEST DE ENDPOINTS DE MISILES" -ForegroundColor Cyan
Write-Host ""

# URLs
$getMissilesUrl = "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0dbdbe9a8b304470a572c99f54566b72/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MBpo3_UDyyHUaFzxHPYejZXr6-bKyNoHjfgwelLzELc"
$postMissileUrl = "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a3328e55292744a99e5c8495a51462ba/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iqYPZp8BOTRLU6_2daDJYB7-3cCgj0Z1Olad9ZF0jgQ"

# Test 1: GET Estado de Misiles
Write-Host "TEST 1: Obtener estado de misiles (GET)" -ForegroundColor Yellow
Write-Host "Consultando..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $getMissilesUrl -Method GET -ContentType "application/json"
    Write-Host "Respuesta exitosa! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 2: POST Desactivar Misil 1
Write-Host "TEST 2: Desactivar Misil 1 (POST)" -ForegroundColor Yellow
Write-Host "Enviando peticion..." -ForegroundColor Gray

$payload = @{
    missile = "1"
    ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    deviceId = "test-ps-$(Get-Random -Maximum 9999)"
    userAgent = "PowerShell-Test"
    location = @{
        lat = -32.83114
        lng = -60.70558
        accuracy = 10
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $postMissileUrl -Method POST -ContentType "application/json" -Body $payload
    Write-Host "Misil desactivado! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalle:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
    Write-Host ""
}

Write-Host "Pruebas completadas" -ForegroundColor Cyan
