param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath,
    [ValidateSet(64, 256, 512)]
    [int]$TargetHeapKB = 64,
    [int]$TargetApi = 6,
    [switch]$SkipImageDimensions,
    [string]$SdkApiPath,
    [string]$BuiltJsPath
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ProjectPath).Path
$excluded = '\\(build|\.preview|\.hvigor|node_modules|oh_modules|\.git)\\'
$scanRoots = @($root)

function Get-SourceFiles([string[]]$extensions) {
    $files = foreach ($scanRoot in $scanRoots) {
        Get-ChildItem -LiteralPath $scanRoot -Recurse -File | Where-Object {
            $_.FullName -notmatch $excluded -and $extensions -contains $_.Extension.ToLowerInvariant()
        }
    }
    $files | Sort-Object FullName -Unique
}

function Write-Finding([string]$level, [string]$message) {
    Write-Output (('[{0}] {1}' -f $level, $message))
}

function Get-LineNumber([string]$text, [int]$index) {
    if ($index -le 0) { return 1 }
    return ([regex]::Matches($text.Substring(0, $index), "`n").Count + 1)
}

function Get-AnnotationsBefore([string[]]$lines, [int]$lineIndex, [string]$annotation) {
    $values = @()
    $start = [Math]::Max(0, $lineIndex - 100)
    for ($i = $lineIndex - 1; $i -ge $start; $i--) {
        if ($annotation -eq 'since' -and $lines[$i] -match '@since\s+(\d+)') {
            $values += [int]$Matches[1]
        }
        if ($annotation -eq 'deprecated' -and $lines[$i] -match '@deprecated\s+since\s+(\d+)') {
            $values += [int]$Matches[1]
        }
        if ($lines[$i] -notmatch '^\s*(/\*\*|\*|\*/|$)') { break }
    }
    return @($values | Sort-Object -Unique)
}

function Find-PatternInFiles([System.IO.FileInfo[]]$files, [string]$pattern, [string]$level, [string]$label) {
    $count = 0
    $examples = @()
    foreach ($file in $files) {
        $text = Get-Content -Raw -LiteralPath $file.FullName
        foreach ($match in [regex]::Matches($text, $pattern)) {
            $count++
            if ($examples.Count -lt 5) {
                $examples += ('{0}:{1}' -f $file.FullName, (Get-LineNumber $text $match.Index))
            }
        }
    }
    if ($count -gt 0) {
        Write-Finding $level ('{0}: {1} occurrence(s); examples: {2}' -f $label, $count, ($examples -join ', '))
    }
}

function Remove-JsStringsAndComments([string]$text) {
    $pattern = '(?s)/\*.*?\*/|(?m)//[^\r\n]*|"(?:\\.|[^"\\])*"|''(?:\\.|[^''\\])*''|`(?:\\.|[^`\\])*`'
    return [regex]::Replace($text, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        return [regex]::Replace($match.Value, '[^\r\n]', ' ')
    })
}

function Find-SpreadAndRest([System.IO.FileInfo[]]$files, [string]$prefix) {
    $restCount = 0
    $spreadCount = 0
    $spreadExamples = @()
    foreach ($file in $files) {
        $original = Get-Content -Raw -LiteralPath $file.FullName
        $text = Remove-JsStringsAndComments $original
        foreach ($match in [regex]::Matches($text, '\.\.\.')) {
            $before = $text.Substring(0, $match.Index)
            $after = $text.Substring($match.Index + 3)
            $openIndex = $before.LastIndexOf('(')
            $closeOffset = $after.IndexOf(')')
            $isRestParameter = $false
            if ($openIndex -ge 0 -and $closeOffset -ge 0) {
                $beforeOpen = $before.Substring([Math]::Max(0, $openIndex - 100), [Math]::Min(100, $openIndex))
                $afterClose = $after.Substring($closeOffset + 1).TrimStart()
                if ($beforeOpen -match '\bfunction(?:\s+[A-Za-z_$][A-Za-z0-9_$]*)?\s*$' -or
                    $afterClose.StartsWith('=>') -or
                    ($afterClose.StartsWith('{') -and $beforeOpen -match '[A-Za-z_$][A-Za-z0-9_$]*\s*$')) {
                    $isRestParameter = $true
                }
            }
            if ($isRestParameter) {
                $restCount++
            } else {
                $spreadCount++
                if ($spreadExamples.Count -lt 5) { $spreadExamples += ('{0}:{1}' -f $file.FullName, (Get-LineNumber $original $match.Index)) }
            }
        }
    }
    if ($restCount -gt 0) { Write-Finding 'INFO' ('{0}documented Lite ES6 rest parameter: {1} occurrence(s).' -f $prefix, $restCount) }
    if ($spreadCount -gt 0) { Write-Finding 'WARN' ('{0}spread syntax is not in the Lite allowlist: {1} occurrence(s); examples: {2}' -f $prefix, $spreadCount, ($spreadExamples -join ', ')) }
}

function Test-BoundValue([string]$value) {
    return $value -match '{{'
}

function Get-HmlNodes([System.IO.FileInfo]$file) {
    $text = Get-Content -Raw -LiteralPath $file.FullName
    $rootNode = [pscustomobject]@{
        Tag = '#root'; Attrs = @{}; Parent = $null
        Children = [System.Collections.ArrayList]::new()
        Line = 1; File = $file.FullName; Raw = ''
    }
    $stack = [System.Collections.ArrayList]::new()
    [void]$stack.Add($rootNode)
    $nodes = [System.Collections.ArrayList]::new()
    $atomicTags = @('qrcode', 'image-animator', 'image', 'img', 'progress', 'text', 'chart', 'input', 'slider', 'switch', 'picker-view')
    # Match > inside quoted HML expressions without truncating the start tag.
    $tagPattern = '(?s)<!--.*?-->|</?\s*[A-Za-z](?:"[^"]*"|''[^'']*''|[^''">])*>'
    $attrPattern = '(?x)(?<name>[@A-Za-z_:][@A-Za-z0-9_:.\-]*)(?:\s*=\s*(?:"(?<dq>[^"]*)"|''(?<sq>[^'']*)''|(?<bare>[^\s"''=<>]+)))?'

    foreach ($tokenMatch in [regex]::Matches($text, $tagPattern)) {
        $token = $tokenMatch.Value
        if ($token.StartsWith('<!--')) { continue }
        if ($token -match '^</\s*([A-Za-z][A-Za-z0-9-]*)') {
            $closing = $Matches[1].ToLowerInvariant()
            for ($i = $stack.Count - 1; $i -gt 0; $i--) {
                if ($stack[$i].Tag -eq $closing) {
                    while ($stack.Count - 1 -ge $i) { $stack.RemoveAt($stack.Count - 1) }
                    break
                }
            }
            continue
        }
        if ($token -notmatch '^<\s*([A-Za-z][A-Za-z0-9-]*)\b') { continue }
        $tag = $Matches[1].ToLowerInvariant()
        $attrs = @{}
        $nameEnd = $token.IndexOf($Matches[1]) + $Matches[1].Length
        $attrText = $token.Substring($nameEnd, $token.Length - $nameEnd - 1)
        foreach ($attrMatch in [regex]::Matches($attrText, $attrPattern)) {
            $name = $attrMatch.Groups['name'].Value.ToLowerInvariant()
            $value = ''
            if ($attrMatch.Groups['dq'].Success) { $value = $attrMatch.Groups['dq'].Value }
            elseif ($attrMatch.Groups['sq'].Success) { $value = $attrMatch.Groups['sq'].Value }
            elseif ($attrMatch.Groups['bare'].Success) { $value = $attrMatch.Groups['bare'].Value }
            $attrs[$name] = $value
        }
        $parent = $stack[$stack.Count - 1]
        $node = [pscustomobject]@{
            Tag = $tag; Attrs = $attrs; Parent = $parent
            Children = [System.Collections.ArrayList]::new()
            Line = Get-LineNumber $text $tokenMatch.Index
            File = $file.FullName; Raw = $token
        }
        [void]$parent.Children.Add($node)
        [void]$nodes.Add($node)
        $selfClosing = $token -match '/>\s*$' -or $atomicTags -contains $tag
        if (-not $selfClosing) { [void]$stack.Add($node) }
    }
    return @($nodes | ForEach-Object { $_ })
}

function Get-AbilityRoot([string]$filePath) {
    if ($filePath -match '^(?<root>.*\\js\\[^\\]+)(?:\\|$)') { return $Matches['root'] }
    return $null
}

Write-Output 'Huawei Lite Wearable project audit'
Write-Output ('Project: {0}' -f $root)
Write-Output ('Target: API {0}, JS heap {1} KB' -f $TargetApi, $TargetHeapKB)

$configs = Get-ChildItem -LiteralPath $root -Recurse -File -Filter 'config.json' | Where-Object { $_.FullName -notmatch $excluded }
$liteConfigs = @()
foreach ($config in $configs) {
    $content = Get-Content -Raw -LiteralPath $config.FullName
    if ($content -match 'liteWearable') { $liteConfigs += $config }
}
if ($liteConfigs.Count -eq 0) {
    Write-Finding 'WARN' 'No source config.json containing liteWearable was found.'
} else {
    $scanRoots = @($liteConfigs | ForEach-Object { $_.Directory.FullName } | Sort-Object -Unique)
    foreach ($config in $liteConfigs) { Write-Finding 'PASS' ('Lite Wearable config: {0}' -f $config.FullName) }
    Write-Finding 'INFO' ('Scanning configured module root(s): {0}' -f ($scanRoots -join ', '))
}

$allJsFiles = @(Get-SourceFiles @('.js'))
$jsFiles = @($allJsFiles | Where-Object { $_.FullName -notmatch '\\resources\\rawfile\\' })
$rawToolJsFiles = @($allJsFiles | Where-Object { $_.FullName -match '\\resources\\rawfile\\' })
$hmlFiles = @(Get-SourceFiles @('.hml'))
$cssFiles = @(Get-SourceFiles @('.css', '.less', '.scss'))
$imageFiles = @(Get-SourceFiles @('.png', '.jpg', '.jpeg', '.bmp', '.webp', '.gif'))
$audioFiles = @(Get-SourceFiles @('.mp3', '.wav', '.ogg', '.m4a', '.aac'))
$rawFiles = @()
foreach ($scanRoot in $scanRoots) {
    $rawRoot = Join-Path $scanRoot 'resources\rawfile'
    if (Test-Path -LiteralPath $rawRoot -PathType Container) { $rawFiles += @(Get-ChildItem -LiteralPath $rawRoot -Recurse -File) }
}

$jsBytes = ($jsFiles | Measure-Object -Property Length -Sum).Sum
if ($null -eq $jsBytes) { $jsBytes = 0 }
Write-Finding 'INFO' ('Runtime source files: JS={0} ({1:N0} bytes), HML={2}, styles={3}, images={4}, audio={5}' -f $jsFiles.Count, $jsBytes, $hmlFiles.Count, $cssFiles.Count, $imageFiles.Count, $audioFiles.Count)
if ($rawToolJsFiles.Count -gt 0) {
    Write-Finding 'INFO' ('Rawfile JS utilities excluded from runtime scan: {0}' -f (($rawToolJsFiles.FullName) -join ', '))
}
Write-Finding 'INFO' 'Source byte size is not runtime heap usage; use it only to locate large modules.'

$largeJsThreshold = [Math]::Max(32768, [int]($TargetHeapKB * 1024 / 2))
foreach ($file in @($jsFiles | Where-Object { $_.Length -ge $largeJsThreshold } | Sort-Object Length -Descending)) {
    Write-Finding 'WARN' ('Large JS source ({0:N0} bytes): {1}' -f $file.Length, $file.FullName)
}

$combined = ($jsFiles | ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName }) -join "`n"
$configText = ($liteConfigs | ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName }) -join "`n"

Write-Output '--- JavaScript source syntax ---'
$documentedSyntax = @(
    @{ Label = 'documented Lite ES6: let/const'; Pattern = '(?m)\b(let|const)\s+[A-Za-z_$]' },
    @{ Label = 'documented Lite ES6: arrow function'; Pattern = '=>' },
    @{ Label = 'documented Lite ES6: class'; Pattern = '(?m)\bclass\s+[A-Za-z_$]' },
    @{ Label = 'documented Lite ES6: for-of'; Pattern = '(?m)\bfor\s*\([^)]*\bof\b' },
    @{ Label = 'documented Lite ES6: template string'; Pattern = '`' },
    @{ Label = 'documented Lite ES6: static module declaration'; Pattern = '(?m)^\s*(import|export)\b' }
)
foreach ($check in $documentedSyntax) {
    Find-PatternInFiles $jsFiles $check.Pattern 'INFO' ($check.Label + ' (allowed in .js source; check heap/build output)')
}
$forbiddenSyntax = @(
    @{ Label = 'not in Lite allowlist: async/await'; Pattern = '(?m)\basync\b|\bawait\b' },
    @{ Label = 'not in Lite allowlist: generator/yield'; Pattern = '(?m)\bfunction\s*\*|\byield\b' },
    @{ Label = 'not in Lite allowlist: optional chaining'; Pattern = '\?\.' },
    @{ Label = 'not in Lite allowlist: nullish coalescing'; Pattern = '\?\?' },
    @{ Label = 'not in Lite allowlist: dynamic import'; Pattern = '\bimport\s*\(' },
    @{ Label = 'not in Lite allowlist: BigInt literal'; Pattern = '(?<![A-Za-z0-9_$])\d+n\b' },
    @{ Label = 'dynamic code execution'; Pattern = '(?m)(^|[^A-Za-z0-9_])(eval\s*\(|new\s+Function\s*\(|Function\s*\()' },
    @{ Label = 'QuickJS/interpreter embedding'; Pattern = '(?i)quickjs|evalCode|quickjsContext' }
)
foreach ($check in $forbiddenSyntax) { Find-PatternInFiles $jsFiles $check.Pattern 'WARN' $check.Label }
Find-SpreadAndRest $jsFiles ''
Find-PatternInFiles $jsFiles '\b(Promise|Map|Set|WeakMap|WeakSet|Symbol|Proxy|Reflect)\b' 'INFO' 'runtime built-in requires SDK/build/device proof'
Find-PatternInFiles $jsFiles '(?m)\b(require\s*\(|Buffer\b|process\.|__dirname\b)' 'WARN' 'CommonJS/Node-style construct in runtime JS; Lite docs only list static import/export'

$timerCreates = [regex]::Matches($combined, '\bset(Interval|Timeout)\s*\(').Count
$timerClears = [regex]::Matches($combined, '\bclear(Interval|Timeout)\s*\(').Count
if ($timerCreates -gt 0) {
    $level = if ($timerClears -eq 0) { 'WARN' } else { 'INFO' }
    Write-Finding $level ('Timers: create calls={0}, clear calls={1}. Review every lifecycle path.' -f $timerCreates, $timerClears)
}
$subscribes = [regex]::Matches($combined, '\.subscribe[A-Za-z0-9_]*\s*\(').Count
$unsubscribes = [regex]::Matches($combined, '\.unsubscribe[A-Za-z0-9_]*\s*\(').Count
if ($subscribes -gt 0) {
    $level = if ($unsubscribes -eq 0) { 'WARN' } else { 'INFO' }
    Write-Finding $level ('Subscriptions: subscribe calls={0}, unsubscribe calls={1}.' -f $subscribes, $unsubscribes)
}

Write-Output '--- Sensors and vibration ---'
$sensorDefinitions = @(
    @{ Name = 'Accelerometer'; Since = 3; Permission = 'ohos.permission.ACCELEROMETER'; Interval = $true; LiteNoEffect = $false },
    @{ Name = 'Compass'; Since = 3; Permission = ''; Interval = $false; LiteNoEffect = $false },
    @{ Name = 'Proximity'; Since = 3; Permission = ''; Interval = $false; LiteNoEffect = $true },
    @{ Name = 'Light'; Since = 3; Permission = ''; Interval = $false; LiteNoEffect = $true },
    @{ Name = 'StepCounter'; Since = 3; Permission = 'ohos.permission.ACTIVITY_MOTION'; Interval = $false; LiteNoEffect = $false },
    @{ Name = 'Barometer'; Since = 3; Permission = ''; Interval = $false; LiteNoEffect = $false },
    @{ Name = 'HeartRate'; Since = 3; Permission = 'ohos.permission.READ_HEALTH_DATA'; Interval = $false; LiteNoEffect = $false },
    @{ Name = 'OnBodyState'; Since = 3; Permission = ''; Interval = $false; LiteNoEffect = $false },
    @{ Name = 'DeviceOrientation'; Since = 6; Permission = ''; Interval = $true; LiteNoEffect = $true },
    @{ Name = 'Gyroscope'; Since = 6; Permission = 'ohos.permission.GYROSCOPE'; Interval = $true; LiteNoEffect = $false }
)
$usesSensorApi = $combined -match '[''"]@system\.sensor[''"]'
foreach ($definition in $sensorDefinitions) {
    $subscribePattern = '\.subscribe' + $definition.Name + '\s*\('
    $unsubscribePattern = '\.unsubscribe' + $definition.Name + '\s*\('
    $subscribeCount = [regex]::Matches($combined, $subscribePattern).Count
    if ($subscribeCount -eq 0) { continue }
    $usesSensorApi = $true
    $unsubscribeCount = [regex]::Matches($combined, $unsubscribePattern).Count
    Write-Finding 'INFO' ('Sensor {0}: subscribe={1}, unsubscribe={2}, minimum API={3}.' -f $definition.Name, $subscribeCount, $unsubscribeCount, $definition.Since)
    if ($unsubscribeCount -eq 0) {
        Write-Finding 'WARN' ('subscribe{0} has no matching unsubscribe{0} call.' -f $definition.Name)
    }
    if ($TargetApi -lt $definition.Since) {
        Write-Finding 'WARN' ('subscribe{0} requires API {1}, above target API {2}.' -f $definition.Name, $definition.Since, $TargetApi)
    }
    if ($definition.Permission -and $configText -notmatch ([regex]::Escape($definition.Permission))) {
        Write-Finding 'WARN' ('subscribe{0} is used but permission {1} was not found in Lite config.' -f $definition.Name, $definition.Permission)
    }
    if ($definition.LiteNoEffect) {
        Write-Finding 'WARN' ('subscribe{0} is documented as having no effect on Lite Wearable; do not depend on it without model-specific device evidence.' -f $definition.Name)
    }
}
if ($usesSensorApi) {
    Write-Finding 'WARN' 'REAL-DEVICE REQUIRED: simulator output cannot prove sensor hardware, units, axis direction, permissions, power, or sampling behavior.'
    if ($combined -notmatch '\bonDestroy\s*[:(]') {
        Write-Finding 'WARN' '@system.sensor is used without a visible onDestroy lifecycle cleanup.'
    }
    foreach ($match in [regex]::Matches($combined, '\binterval\s*:\s*[''"](game|ui|normal)[''"]')) {
        $interval = $match.Groups[1].Value
        if ($interval -eq 'game') {
            Write-Finding 'WARN' 'Sensor interval game (~20 ms) detected; justify it and verify heap, UI throttling, power, and heat on device.'
        } elseif ($interval -eq 'ui') {
            Write-Finding 'INFO' 'Sensor interval ui (~60 ms) detected; keep UI updates and allocations throttled.'
        }
    }
    if ($combined -match '\.subscribeHeartRate\s*\(') {
        Write-Finding 'INFO' 'Heart-rate values require invalid-value handling; Lite SDK declarations may use 255 as an invalid reading.'
    }
    if ($combined -match '\.subscribeBarometer\s*\(') {
        Write-Finding 'INFO' 'Barometer pressure unit differs across available declarations; verify magnitude and unit on the target SDK/device.'
    }
}

$usesVibratorApi = $combined -match '[''"]@system\.vibrator[''"]' -or $combined -match '\.vibrate\s*\('
if ($usesVibratorApi) {
    if ($TargetApi -lt 3) { Write-Finding 'WARN' '@system.vibrator requires API 3 or later.' }
    if ($configText -notmatch 'ohos\.permission\.VIBRATE') { Write-Finding 'WARN' '@system.vibrator is used but permission ohos.permission.VIBRATE was not found in Lite config.' }
    foreach ($match in [regex]::Matches($combined, '\bmode\s*:\s*[''"]([^''"]+)[''"]')) {
        if (@('short', 'long') -notcontains $match.Groups[1].Value) {
            Write-Finding 'WARN' ('Unsupported vibrator mode literal: {0}; Lite modes are short and long.' -f $match.Groups[1].Value)
        }
    }
    Write-Finding 'WARN' 'REAL-DEVICE REQUIRED: simulator output cannot prove vibration permission, duration, intensity, or system-policy behavior.'
}

if ($BuiltJsPath) {
    if (Test-Path -LiteralPath $BuiltJsPath -PathType Container) {
        $builtFiles = @(Get-ChildItem -LiteralPath $BuiltJsPath -Recurse -File -Filter '*.js')
        Write-Output '--- Built JavaScript syntax ---'
        Write-Finding 'INFO' ('Built JS path: {0}; files={1}' -f (Resolve-Path -LiteralPath $BuiltJsPath).Path, $builtFiles.Count)
        foreach ($check in $forbiddenSyntax) { Find-PatternInFiles $builtFiles $check.Pattern 'WARN' ('built output ' + $check.Label) }
        Find-SpreadAndRest $builtFiles 'built output '
        foreach ($check in $documentedSyntax) { Find-PatternInFiles $builtFiles $check.Pattern 'INFO' ('modern syntax remains in built output: ' + $check.Label) }
        Find-PatternInFiles $builtFiles '\b(Promise|Map|Set|WeakMap|WeakSet|Symbol|Proxy|Reflect)\b' 'WARN' 'built output runtime built-in dependency'
    } else {
        Write-Finding 'WARN' ('Built JS path not found: {0}' -f $BuiltJsPath)
    }
}

Write-Output '--- Platform API declarations ---'
$imports = [regex]::Matches($combined, 'from\s+[''\"](@(?:system|ohos|kit)[^''\"]+)[''\"]') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
if ($imports.Count -gt 0) {
    Write-Finding 'INFO' ('Platform imports: {0}' -f ($imports -join ', '))
    Write-Finding 'INFO' 'Check every import against target SDK @since, syscap, permission, and Lite Wearable behavior.'
}
$apiBindings = @()
foreach ($match in [regex]::Matches($combined, 'import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+[''\"](@(?:system|ohos|kit)[^''\"]+)[''\"]')) {
    $apiBindings += [pscustomobject]@{ Local = $match.Groups[1].Value; Module = $match.Groups[2].Value }
}
$apiBindings = @($apiBindings | Sort-Object Local, Module -Unique)
if (-not $SdkApiPath) {
    $sdkRoots = @($env:DEVECO_SDK_HOME, $env:HARMONYOS_SDK_HOME, $env:OHOS_SDK_HOME) | Where-Object { $_ }
    foreach ($sdkRoot in $sdkRoots) {
        $candidateApiPath = Join-Path $sdkRoot 'default\openharmony\js\api'
        if (Test-Path -LiteralPath $candidateApiPath -PathType Container) { $SdkApiPath = $candidateApiPath; break }
        $candidateApiPath = Join-Path $sdkRoot 'js\api'
        if (Test-Path -LiteralPath $candidateApiPath -PathType Container) { $SdkApiPath = $candidateApiPath; break }
    }
}
if (-not $SdkApiPath -or -not (Test-Path -LiteralPath $SdkApiPath -PathType Container)) {
    $sdkMessage = if ($SdkApiPath) { 'SDK API path not found; symbol version checks skipped: ' + $SdkApiPath } else { 'SDK API path was not supplied or discovered; symbol version checks skipped.' }
    Write-Finding 'INFO' $sdkMessage
} else {
    foreach ($binding in $apiBindings) {
        $declarationPath = Join-Path $SdkApiPath ($binding.Module + '.d.ts')
        if (-not (Test-Path -LiteralPath $declarationPath -PathType Leaf)) {
            Write-Finding 'INFO' ('No local declaration file for {0}; check bundled docs and target SDK.' -f $binding.Module)
            continue
        }
        $declarationLines = @(Get-Content -LiteralPath $declarationPath)
        $usedMethods = @([regex]::Matches($combined, ('\b' + [regex]::Escape($binding.Local) + '\.([A-Za-z_$][A-Za-z0-9_$]*)\s*\(')) | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
        foreach ($method in $usedMethods) {
            $declarationIndex = -1
            for ($i = 0; $i -lt $declarationLines.Count; $i++) {
                if ($declarationLines[$i] -match ('\b' + [regex]::Escape($method) + '\s*\(')) { $declarationIndex = $i; break }
            }
            if ($declarationIndex -lt 0) {
                Write-Finding 'INFO' ('SDK symbol not located: {0}.{1} in {2}' -f $binding.Module, $method, $declarationPath)
                continue
            }
            $sinceValues = @(Get-AnnotationsBefore $declarationLines $declarationIndex 'since')
            $deprecatedValues = @(Get-AnnotationsBefore $declarationLines $declarationIndex 'deprecated')
            $since = if ($sinceValues.Count -gt 0) { ($sinceValues | Measure-Object -Minimum).Minimum } else { $null }
            if ($null -ne $since -and $since -gt $TargetApi) {
                Write-Finding 'WARN' ('API mismatch: {0}.{1} earliest declaration is @since {2}, above target API {3}.' -f $binding.Module, $method, $since, $TargetApi)
            } elseif ($null -ne $since) {
                Write-Finding 'PASS' ('API version: {0}.{1} earliest declaration is @since {2} (target API {3}).' -f $binding.Module, $method, $since, $TargetApi)
            }
            if ($deprecatedValues.Count -gt 0) {
                Write-Finding 'INFO' ('API deprecation: {0}.{1} annotation(s) at API {2}.' -f $binding.Module, $method, ($deprecatedValues -join ', '))
            }
        }
    }
}

Write-Output '--- HML Lite whitelist ---'
$allowedTags = @('div', 'canvas', 'stack', 'qrcode', 'list', 'list-item', 'swiper', 'tabs', 'tab-bar', 'tab-content', 'image-animator', 'image', 'img', 'progress', 'text', 'marquee', 'analog-clock', 'clock-hand', 'chart', 'input', 'slider', 'switch', 'picker-view')
$commonAttrs = @('id', 'style', 'class', 'ref', 'if', 'elif', 'else', 'for', 'tid', 'show')
$tagAttrs = @{
    'qrcode' = @('value', 'type'); 'swiper' = @('index', 'loop', 'duration', 'vertical')
    'tab-bar' = @('mode'); 'image-animator' = @('images', 'iteration', 'reverse', 'fixedsize', 'duration', 'fillmode')
    'image' = @('src'); 'img' = @('src'); 'progress' = @('type', 'percent'); 'text' = @('type', 'value')
    'marquee' = @('scrollamount'); 'analog-clock' = @('hour', 'min', 'sec'); 'clock-hand' = @('type', 'src')
    'chart' = @('type', 'datasets', 'options'); 'input' = @('checked', 'type', 'name', 'value', 'placeholder', 'maxlength')
    'slider' = @('min', 'max', 'value'); 'switch' = @('checked'); 'picker-view' = @('type', 'range', 'selected')
}
$requiredAttrs = @{ 'qrcode' = @('value'); 'image-animator' = @('images', 'duration') }
$enumAttrs = @{
    'qrcode:type' = @('rect', 'circle'); 'swiper:loop' = @('true', 'false'); 'swiper:vertical' = @('false', 'true')
    'tab-bar:mode' = @('fixed'); 'image-animator:reverse' = @('false', 'true'); 'image-animator:fixedsize' = @('true', 'false')
    'image-animator:fillmode' = @('none', 'forwards'); 'progress:type' = @('horizontal', 'arc'); 'text:type' = @('text', 'html')
    'clock-hand:type' = @('hour', 'min', 'sec'); 'chart:type' = @('line', 'bar')
    'input:checked' = @('false', 'true'); 'input:type' = @('button', 'checkbox', 'password', 'radio', 'text')
    'switch:checked' = @('false', 'true'); 'picker-view:type' = @('text', 'time')
}
$numericAttrs = @('swiper:index', 'swiper:duration', 'progress:percent', 'marquee:scrollamount', 'analog-clock:hour', 'analog-clock:min', 'analog-clock:sec', 'input:maxlength', 'slider:min', 'slider:max', 'slider:value')
$commonEvents = @('click', 'longpress', 'touchstart', 'touchmove', 'touchcancel', 'touchend', 'key', 'swipe')
$extraEvents = @{ 'list' = @('scrollend'); 'swiper' = @('change'); 'tabs' = @('change'); 'image-animator' = @('stop'); 'input' = @('change'); 'slider' = @('change'); 'switch' = @('change') }
$onlyEvents = @{ 'qrcode' = @('click', 'longpress', 'swipe'); 'picker-view' = @('change') }
$allNodes = [System.Collections.ArrayList]::new()
foreach ($file in $hmlFiles) {
    $hmlText = Get-Content -Raw -LiteralPath $file.FullName
    foreach ($expressionMatch in [regex]::Matches($hmlText, '(?s){{{?(?<expr>.*?)}}}?')) {
        $expression = $expressionMatch.Groups['expr'].Value
        $expressionCode = [regex]::Replace($expression, '"(?:\\.|[^"\\])*"|''(?:\\.|[^''\\])*''', '')
        if ($expressionCode -match '=>|`|\?\.|\?\?|\.\.\.|\b(async|await|yield|class|let|const)\b|\bimport\s*\(') {
            Write-Finding 'WARN' ('ES6 or newer syntax in HML expression at {0}:{1}: {2}' -f $file.FullName, (Get-LineNumber $hmlText $expressionMatch.Index), $expression.Trim())
        }
    }
    foreach ($node in @(Get-HmlNodes $file)) { [void]$allNodes.Add($node) }
}

foreach ($node in $allNodes) {
    $location = '{0}:{1}' -f $node.File, $node.Line
    if ($allowedTags -notcontains $node.Tag) {
        Write-Finding 'WARN' ('Unknown/non-Lite tag <{0}> at {1}; allow only after locating a registered custom component.' -f $node.Tag, $location)
        continue
    }
    if ($node.Attrs.ContainsKey('if') -and $node.Attrs.ContainsKey('for')) {
        Write-Finding 'WARN' ('HML element uses if and for together at {0}' -f $location)
    }
    if ($node.Attrs.ContainsKey('class') -and (Test-BoundValue $node.Attrs['class'])) {
        Write-Finding 'WARN' ('Lite HML does not support dynamic class binding at {0}' -f $location)
    }
    if ($node.Attrs.ContainsKey('tid') -and (Test-BoundValue $node.Attrs['tid'])) {
        Write-Finding 'WARN' ('tid does not support expressions at {0}' -f $location)
    }
    if ($requiredAttrs.ContainsKey($node.Tag)) {
        foreach ($required in @($requiredAttrs[$node.Tag])) {
            if (-not $node.Attrs.ContainsKey($required)) { Write-Finding 'WARN' ('<{0}> requires attribute {1} at {2}' -f $node.Tag, $required, $location) }
        }
    }
    foreach ($attr in @($node.Attrs.Keys)) {
        $isEvent = $false
        $eventName = ''
        if ($attr -match '^@(.+)$') { $isEvent = $true; $eventName = $Matches[1] }
        elseif ($attr -match '^on:(.+)$') { $isEvent = $true; $eventName = $Matches[1] }
        elseif ($attr -match '^grab:(.+)$') { $isEvent = $true; $eventName = $Matches[1] }
        elseif ($attr -match '^on([a-z].*)$') { $isEvent = $true; $eventName = $Matches[1] }
        if ($isEvent) {
            $eventName = $eventName -replace '\.(bubble|capture)$', ''
            $validEvents = if ($onlyEvents.ContainsKey($node.Tag)) { @($onlyEvents[$node.Tag]) } else { @($commonEvents + @($extraEvents[$node.Tag])) }
            if ($validEvents -notcontains $eventName) { Write-Finding 'WARN' ('Unsupported event {0} on <{1}> at {2}' -f $attr, $node.Tag, $location) }
            if ($TargetApi -lt 5 -and ($attr -match ':' -or $attr -match '\.(bubble|capture)$')) { Write-Finding 'WARN' ('Event bubbling syntax requires API 5+: {0} at {1}' -f $attr, $location) }
            continue
        }
        if ($commonAttrs -notcontains $attr -and @($tagAttrs[$node.Tag]) -notcontains $attr -and $attr -notmatch '^data-\w+$') {
            Write-Finding 'WARN' ('Attribute {0} is outside the Lite whitelist for <{1}> at {2}' -f $attr, $node.Tag, $location)
            continue
        }
        $key = $node.Tag + ':' + $attr
        $value = [string]$node.Attrs[$attr]
        if ($enumAttrs.ContainsKey($key) -and -not (Test-BoundValue $value) -and $enumAttrs[$key] -notcontains $value) {
            Write-Finding 'WARN' ('Invalid {0} value "{1}" on <{2}> at {3}; allowed: {4}' -f $attr, $value, $node.Tag, $location, ($enumAttrs[$key] -join ', '))
        }
        if ($numericAttrs -contains $key -and -not (Test-BoundValue $value) -and $value -notmatch '^-?\d+(\.\d+)?$') {
            Write-Finding 'WARN' ('Attribute {0} must be numeric on <{1}> at {2}' -f $attr, $node.Tag, $location)
        }
    }
    foreach ($value in @($node.Attrs.Values)) {
        if (-not (Test-BoundValue ([string]$value)) -and [string]$value -match '=>|`|\?\.|\?\?|\.\.\.|\b(async|await|yield|class|let|const)\b|\bimport\s*\(') {
            Write-Finding 'WARN' ('ES6 or newer syntax in HML attribute/expression at {0}: {1}' -f $location, ([string]$value))
        }
    }

    $parentTag = $node.Parent.Tag
    if ($node.Tag -eq 'list-item' -and $parentTag -ne 'list') { Write-Finding 'WARN' ('<list-item> must be directly inside <list> at {0}' -f $location) }
    if ($node.Tag -eq 'tab-bar' -and $parentTag -ne 'tabs') { Write-Finding 'WARN' ('<tab-bar> must be directly inside <tabs> at {0}' -f $location) }
    if ($node.Tag -eq 'tab-content' -and $parentTag -ne 'tabs') { Write-Finding 'WARN' ('<tab-content> must be directly inside <tabs> at {0}' -f $location) }
    if ($node.Tag -eq 'clock-hand' -and $parentTag -ne 'analog-clock') { Write-Finding 'WARN' ('<clock-hand> must be directly inside <analog-clock> at {0}' -f $location) }
    if ($parentTag -eq 'list' -and $node.Tag -ne 'list-item') { Write-Finding 'WARN' ('<list> direct child must be <list-item>; found <{0}> at {1}' -f $node.Tag, $location) }
    if ($parentTag -eq 'tabs' -and @('tab-bar', 'tab-content') -notcontains $node.Tag) { Write-Finding 'WARN' ('<tabs> direct child must be <tab-bar> or <tab-content>; found <{0}> at {1}' -f $node.Tag, $location) }
    if ($parentTag -eq 'tab-bar' -and $node.Tag -ne 'text') { Write-Finding 'WARN' ('<tab-bar> direct child must be <text>; found <{0}> at {1}' -f $node.Tag, $location) }
    if ($parentTag -eq 'tab-content' -and @('div', 'stack') -notcontains $node.Tag) { Write-Finding 'WARN' ('<tab-content> direct child must be <div> or <stack>; found <{0}> at {1}' -f $node.Tag, $location) }
    if ($parentTag -eq 'swiper' -and $node.Tag -eq 'list') { Write-Finding 'WARN' ('<swiper> does not support <list> children at {0}' -f $location) }
    if ($parentTag -eq '#root' -and ($node.Tag -eq 'list-item' -or $node.Attrs.ContainsKey('if') -or $node.Attrs.ContainsKey('for') -or $node.Attrs.ContainsKey('else'))) {
        Write-Finding 'WARN' ('Lite root restriction violated at {0}' -f $location)
    }
    if ($node.Attrs.ContainsKey('elif') -or $node.Attrs.ContainsKey('else')) {
        $siblings = @($node.Parent.Children)
        $index = [array]::IndexOf($siblings, $node)
        if ($index -le 0 -or (-not $siblings[$index - 1].Attrs.ContainsKey('if') -and -not $siblings[$index - 1].Attrs.ContainsKey('elif'))) {
            Write-Finding 'WARN' ('elif/else must immediately follow an if/elif sibling at {0}' -f $location)
        }
    }
}

Write-Output '--- Resource layout and paths ---'
$invalidImageNames = @($imageFiles | Where-Object { $_.Name -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]*\.(png|jpg|jpeg|bmp|gif|webp)$' })
foreach ($file in $invalidImageNames) {
    Write-Finding 'WARN' ('RELEASE BLOCKER: image filename must use English ASCII letters/digits/_/- only: {0}' -f $file.FullName)
}
$invalidImageDirectories = @{}
foreach ($file in $imageFiles) {
    if ($file.FullName -match '\\(common|rawfile)\\(?<relative>.+)\\[^\\]+$') {
        $relativeDirectory = $Matches['relative']
        foreach ($segment in ($relativeDirectory -split '\\')) {
            if ($segment -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]*$') { $invalidImageDirectories[$file.Directory.FullName] = $true }
        }
    }
}
foreach ($directory in @($invalidImageDirectories.Keys | Sort-Object)) {
    Write-Finding 'WARN' ('RELEASE BLOCKER: image resource subdirectory must use English ASCII letters/digits/_/- only: {0}' -f $directory)
}
if ($imageFiles.Count -gt 0 -and $invalidImageNames.Count -eq 0 -and $invalidImageDirectories.Count -eq 0) {
    Write-Finding 'PASS' ('Image resource naming: {0} file(s) use English ASCII paths.' -f $imageFiles.Count)
}
$resourceFiles = @($jsFiles + $hmlFiles + $cssFiles | Sort-Object FullName -Unique)
$checkedCommonRefs = @{}
$dynamicCommonRefs = 0
foreach ($file in $resourceFiles) {
    $resourceText = Get-Content -Raw -LiteralPath $file.FullName
    if ($null -eq $resourceText) { $resourceText = '' }
    foreach ($pathMatch in [regex]::Matches($resourceText, '(?<!\.)/common/[^''"\s)<>]+')) {
        if ($pathMatch.Value -match '[^\x00-\x7F]') {
            Write-Finding 'WARN' ('RELEASE BLOCKER: /common image reference contains non-ASCII characters at {0}:{1}: {2}' -f $file.FullName, (Get-LineNumber $resourceText $pathMatch.Index), $pathMatch.Value)
        }
    }
    $dynamicCommonRefs += [regex]::Matches($resourceText, '(?<!\.)/common/[^''"\s)]*{{').Count
    foreach ($match in [regex]::Matches($resourceText, '(?<!\.)/common/[A-Za-z0-9_.\-/]+')) {
        $reference = $match.Value.TrimEnd('/', '.', ',')
        $suffixLength = [Math]::Min(40, $resourceText.Length - ($match.Index + $match.Length))
        $suffix = if ($suffixLength -gt 0) { $resourceText.Substring($match.Index + $match.Length, $suffixLength) } else { '' }
        if ($suffix -match '^{{' -or $suffix -match '^[''"]\s*\+') { $dynamicCommonRefs++; continue }
        if (-not $reference -or $checkedCommonRefs.ContainsKey($file.FullName + '|' + $reference)) { continue }
        $checkedCommonRefs[$file.FullName + '|' + $reference] = $true
        $abilityRoot = Get-AbilityRoot $file.FullName
        if (-not $abilityRoot) {
            Write-Finding 'INFO' ('Could not resolve Ability root for common resource reference {0} at {1}:{2}' -f $reference, $file.FullName, (Get-LineNumber $resourceText $match.Index))
            continue
        }
        $relativeResource = $reference.Substring('/common/'.Length).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path (Join-Path $abilityRoot 'common') $relativeResource
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            Write-Finding 'WARN' ('Missing /common resource {0}; expected {1}; referenced at {2}:{3}' -f $reference, $candidate, $file.FullName, (Get-LineNumber $resourceText $match.Index))
        }
    }
}
if ($checkedCommonRefs.Count -gt 0) { Write-Finding 'PASS' ('Checked {0} static /common resource reference(s).' -f $checkedCommonRefs.Count) }
if ($dynamicCommonRefs -gt 0) { Write-Finding 'INFO' ('Dynamic /common paths with HML binding: {0}. Enumerate every generated path on device.' -f $dynamicCommonRefs) }

foreach ($file in $jsFiles) {
    $resourceText = Get-Content -Raw -LiteralPath $file.FullName
    if ($null -eq $resourceText) { $resourceText = '' }
    foreach ($match in [regex]::Matches($resourceText, '(?m)^\s*import\b[^\r\n]*\bfrom\s+[''"]/common/[^''"]+[''"]')) {
        Write-Finding 'WARN' ('Common JS must use a relative import, not /common absolute resource syntax: {0}:{1}' -f $file.FullName, (Get-LineNumber $resourceText $match.Index))
    }
}

$allResourceText = ($resourceFiles | ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName }) -join "`n"
$fileLocals = @('file')
foreach ($match in [regex]::Matches($combined, 'import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+[''"]@system\.file[''"]')) {
    $fileLocals += $match.Groups[1].Value
}
$fileLocals = @($fileLocals | Sort-Object -Unique)
$fileLocalPattern = '(?:' + (($fileLocals | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')'
$fileCallPrefix = '\b' + $fileLocalPattern + '\.'
$usesFileApi = $combined -match '[''"]@system\.file[''"]' -or $combined -match ($fileCallPrefix + '(access|list|get|readText|readArrayBuffer|writeText|writeArrayBuffer|copy|move|delete|mkdir|rmdir)\s*\(')
$usesRawUri = $allResourceText -match 'internal://app/rawfile/'
$rawImageFiles = @($imageFiles | Where-Object { $_.FullName -match '\\resources\\rawfile\\' })
if ($rawFiles.Count -gt 0) { Write-Finding 'INFO' ('rawfile packaged resources: {0} file(s). Treat the packaged area as read-only.' -f $rawFiles.Count) }
if ($usesFileApi -or $usesRawUri -or $rawImageFiles.Count -gt 0) {
    Write-Finding 'WARN' 'REAL-DEVICE REQUIRED: some DevEco Studio 5.0/API 10 previewer and Lite Wearable simulator environments cannot validate @system.file/rawfile behavior.'
}
if ($usesRawUri) { Write-Finding 'INFO' 'internal://app/rawfile URI detected; verify packaged path, read/copy result, and failure recovery on a signed target device.' }
if ($rawImageFiles.Count -gt 0) { Write-Finding 'WARN' ('Images stored in rawfile: {0}. Package and test their file-path/copy/render flow on a real device; preview is not evidence.' -f $rawImageFiles.Count) }
if ($usesFileApi) {
    Write-Output '--- File and storage API ---'
    foreach ($operation in @('move', 'copy', 'list', 'get', 'delete', 'writeText', 'writeArrayBuffer', 'readText', 'readArrayBuffer', 'access', 'mkdir', 'rmdir')) {
        $count = [regex]::Matches($combined, ($fileCallPrefix + $operation + '\s*\(')).Count
        if ($count -gt 0) { Write-Finding 'INFO' ('file.{0}: {1} call(s).' -f $operation, $count) }
    }
    foreach ($match in [regex]::Matches($combined, ('(?s)' + $fileCallPrefix + '(writeText|writeArrayBuffer|delete|rmdir)\s*\(\s*\{.{0,800}?internal://app/rawfile/'))) {
        Write-Finding 'WARN' ('Packaged rawfile is read-only; file.{0} must not target internal://app/rawfile/.' -f $match.Groups[1].Value)
    }
    foreach ($match in [regex]::Matches($combined, ('(?s)' + $fileCallPrefix + 'move\s*\(\s*\{.{0,800}?dstUri\s*:\s*[''"]internal://app/rawfile/'))) {
        Write-Finding 'WARN' 'file.move must not use internal://app/rawfile/ as dstUri.'
    }
    if ($combined -match ($fileCallPrefix + '(writeText|writeArrayBuffer|copy|move)\s*\(') -and $combined -notmatch ($fileCallPrefix + 'mkdir\s*\(')) {
        Write-Finding 'INFO' 'File write/copy/move is used without file.mkdir; prove every destination parent directory already exists.'
    }
    foreach ($match in [regex]::Matches($combined, ('(?s)' + $fileCallPrefix + 'readArrayBuffer\s*\(\s*\{(?<body>.{0,1200}?)\}\s*\)'))) {
        if ($match.Groups['body'].Value -notmatch '\blength\s*:') {
            Write-Finding 'WARN' 'file.readArrayBuffer without an explicit length can read to EOF and exhaust the JS heap.'
        }
    }
    foreach ($match in [regex]::Matches($combined, ('(?s)' + $fileCallPrefix + 'get\s*\(\s*\{(?<body>.{0,1200}?)\}\s*\)'))) {
        if ($match.Groups['body'].Value -match '\brecursive\s*:\s*true') {
            Write-Finding 'INFO' 'file.get recursive=true can create a large subFiles tree; bound directory size and clear references.'
        }
    }
    foreach ($match in [regex]::Matches($combined, ('(?s)' + $fileCallPrefix + 'rmdir\s*\(\s*\{(?<body>.{0,1200}?)\}\s*\)'))) {
        if ($match.Groups['body'].Value -match '\brecursive\s*:\s*true') {
            Write-Finding 'WARN' 'file.rmdir recursive=true detected; verify the URI is a fixed internal://app/ subdirectory before deletion.'
        }
    }
}

$storageLocals = @('storage')
foreach ($match in [regex]::Matches($combined, 'import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+[''"]@system\.storage[''"]')) {
    $storageLocals += $match.Groups[1].Value
}
$storageLocals = @($storageLocals | Sort-Object -Unique)
$storageLocalPattern = '(?:' + (($storageLocals | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')'
$storageCallPrefix = '\b' + $storageLocalPattern + '\.'
$usesStorageApi = $combined -match '[''"]@system\.storage[''"]' -or $combined -match ($storageCallPrefix + '(get|set|clear|delete)\s*\(')
if ($usesStorageApi) {
    foreach ($operation in @('get', 'set', 'clear', 'delete')) {
        $count = [regex]::Matches($combined, ($storageCallPrefix + $operation + '\s*\(')).Count
        if ($count -gt 0) { Write-Finding 'INFO' ('storage.{0}: {1} call(s).' -f $operation, $count) }
    }
    if ($combined -match ('(?s)' + $storageCallPrefix + 'set\s*\(.{0,800}?\bvalue\s*:\s*JSON\.stringify\s*\(')) {
        Write-Finding 'INFO' 'JSON.stringify stored through @system.storage; verify the encoded value stays below 128 bytes and parsing peak fits the JS heap.'
    }
    if ($combined -match ($storageCallPrefix + 'clear\s*\(')) { Write-Finding 'INFO' 'storage.clear removes every app key; confirm a full reset is intended.' }
}

Write-Output '--- Audio ---'
$usesSystemAudio = $combined -match '[''\"]@system\.audio[''\"]'
if ($usesSystemAudio) {
    if ($configText -match 'ohos\.permission\.MODIFY_AUDIO_SETTINGS') { Write-Finding 'PASS' 'Audio permission MODIFY_AUDIO_SETTINGS is declared.' }
    else { Write-Finding 'WARN' '@system.audio is used but ohos.permission.MODIFY_AUDIO_SETTINGS was not found in Lite config.' }
    if ($combined -match 'internal://app/rawfile/audio/') { Write-Finding 'WARN' '@system.audio source appears to use rawfile directly; copy to internal://app/ before playback.' }
    if ($combined -notmatch '\baudio\.stop\s*\(') { Write-Finding 'WARN' '@system.audio is used without an audio.stop() call.' }
    if ($combined -notmatch '\bonDestroy\s*[:(]') {
        Write-Finding 'WARN' '@system.audio is used without a visible onDestroy lifecycle cleanup.'
    } elseif ($combined -notmatch '(?s)\bonDestroy\s*[:(].{0,1200}\baudio\.stop\s*\(') {
        Write-Finding 'WARN' 'onDestroy exists, but audio.stop() was not found near a destruction handler.'
    }
    if ($timerCreates -gt 0 -and $combined -notmatch '(?s)\bonDestroy\s*[:(].{0,1200}\bclear(Interval|Timeout)\s*\(') {
        Write-Finding 'WARN' 'Audio project creates timers, but timer cleanup was not found near onDestroy.'
    }
    foreach ($file in $jsFiles) {
        $audioText = Get-Content -Raw -LiteralPath $file.FullName
        foreach ($srcMatch in [regex]::Matches($audioText, '\baudio\.src\s*=')) {
            $prefixStart = [Math]::Max(0, $srcMatch.Index - 500)
            $nearbyPrefix = $audioText.Substring($prefixStart, $srcMatch.Index - $prefixStart)
            if ($nearbyPrefix -notmatch '\baudio\.stop\s*\(') {
                Write-Finding 'WARN' ('audio.src assignment has no nearby preceding audio.stop() at {0}:{1}' -f $file.FullName, (Get-LineNumber $audioText $srcMatch.Index))
            }
        }
    }
    if ($combined -notmatch 'internal://app/(music|audio)/') { Write-Finding 'INFO' 'No copied internal://app/music or internal://app/audio playback path was detected; verify the destination path.' }
    foreach ($match in [regex]::Matches($combined, '\baudio\.volume\s*=\s*(-?\d+(?:\.\d+)?)')) {
        $volume = [double]$match.Groups[1].Value
        if ($volume -lt 0 -or $volume -gt 1) { Write-Finding 'WARN' ('audio.volume literal outside 0.0-1.0: {0}' -f $volume) }
    }
    if ($combined -match ($fileCallPrefix + 'copy\s*\(') -and $combined -match ($fileCallPrefix + 'rmdir\s*\(')) {
        Write-Finding 'INFO' 'file.copy and file.rmdir coexist; verify rmdir runs only after every asynchronous copy and access check completes.'
    }
}
$audioBytes = ($audioFiles | Measure-Object -Property Length -Sum).Sum
if ($null -eq $audioBytes) { $audioBytes = 0 }
if ($audioFiles.Count -gt 0) { Write-Finding 'INFO' ('Audio assets: files={0}, compressed total={1:N2} MiB.' -f $audioFiles.Count, ($audioBytes / 1MB)) }
foreach ($file in $audioFiles) {
    if ($file.Extension.ToLowerInvariant() -eq '.mp3') {
        $bytes = [byte[]]::new(12)
        $stream = [System.IO.File]::OpenRead($file.FullName)
        try { $byteCount = $stream.Read($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
        if ($byteCount -lt $bytes.Length) { $bytes = @($bytes | Select-Object -First $byteCount) }
        $validMp3 = $bytes.Count -ge 3 -and (($bytes[0] -eq 0x49 -and $bytes[1] -eq 0x44 -and $bytes[2] -eq 0x33) -or ($bytes[0] -eq 0xFF -and (($bytes[1] -band 0xE0) -eq 0xE0)))
        if (-not $validMp3) { Write-Finding 'WARN' ('File has .mp3 extension but no ID3/MPEG header: {0}' -f $file.FullName) }
        if ($file.Length -gt 5MB) { Write-Finding 'INFO' ('MP3 exceeds the shalu2 guide experience target of 5 MiB; verify storage/device budget: {0}' -f $file.FullName) }
    } elseif ($file.Extension.ToLowerInvariant() -in @('.m4a', '.aac', '.ogg')) {
        Write-Finding 'INFO' ('Audio format requires explicit target-device decoder verification: {0}' -f $file.FullName)
    }
}

Write-Output '--- Image pool ---'
$imageBytes = ($imageFiles | Measure-Object -Property Length -Sum).Sum
if ($null -eq $imageBytes) { $imageBytes = 0 }
Write-Finding 'INFO' ('Compressed image assets total: {0:N0} bytes. This is not decoded pool usage.' -f $imageBytes)
$imageDetails = @()
if (-not $SkipImageDimensions) {
    try {
        Add-Type -AssemblyName System.Drawing
        foreach ($file in $imageFiles) {
            try {
                $image = [System.Drawing.Image]::FromFile($file.FullName)
                $imageDetails += [pscustomobject]@{ Path = $file.FullName; Width = $image.Width; Height = $image.Height; CompressedBytes = $file.Length; DecodedBytes = [int64]$image.Width * [int64]$image.Height * 4 }
                $image.Dispose()
            } catch { Write-Finding 'INFO' ('Could not inspect image dimensions: {0}' -f $file.FullName) }
        }
    } catch { Write-Finding 'INFO' 'System.Drawing is unavailable; decoded image estimates were skipped.' }
} else { Write-Finding 'INFO' 'Decoded image estimates skipped by -SkipImageDimensions.' }
if ($imageDetails.Count -gt 0) {
    $decodedTotal = ($imageDetails | Measure-Object -Property DecodedBytes -Sum).Sum
    Write-Finding 'INFO' ('All image assets would occupy approximately {0:N2} MiB if decoded simultaneously.' -f ($decodedTotal / 1MB))
    foreach ($item in @($imageDetails | Sort-Object DecodedBytes -Descending | Select-Object -First 10)) {
        Write-Finding 'INFO' ('Image {0}x{1}, decoded~{2:N2} MiB, file={3:N0} bytes: {4}' -f $item.Width, $item.Height, ($item.DecodedBytes / 1MB), $item.CompressedBytes, $item.Path)
    }
}

Write-Output 'Audit complete. Findings are heuristic and do not replace DevEco build, Lite Wearable simulator, or target-device testing.'
