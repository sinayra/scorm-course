$copyPaths = @("content", "shared")
$copyFiles = @("imsmanifest.xml")
$folderName = (Get-Item -Path "./").name
$fileName = "./"
$fileName += $folderName
$fileName += ".zip"

$exists = Test-Path $fileName -PathType Leaf
if($exists){
    Remove-Item -Path $fileName -Recurse
}

$exists = Test-Path -Path './temp'
if(-not $exists){
    New-Item -Path "./" -Name "temp" -ItemType "directory"
}

foreach($path in $copyPaths){
    $s = "./"
    $s += $path
    Copy-Item $s './temp/' -Recurse -Force
}

foreach($file in $copyFiles){
    $s = "./"
    $s += $file
    Copy-Item $s -Destination './temp/' -Recurse -Force
}

Compress-Archive -Path './temp/*' -DestinationPath $filename -Force

Remove-Item -Path './temp' -Recurse