$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$siteOutputRoot = $PSScriptRoot
$siteArchivePath = Join-Path $siteOutputRoot 'poverkadoma-design-site.zip'
$siteEntries = @(
  @{Source='poverkadoma-design-site.html';Target='index.html'},
  @{Source='poverkadoma-design-site.css';Target='site.css'},
  @{Source='poverkadoma-design-site.js';Target='site.js'},
  @{Source='poverkadoma-design-site-data.js';Target='data.js'},
  @{Source='poverkadoma-design-site-README.txt';Target='README.txt'}
)
$siteEvidence = @((Get-Content -LiteralPath (Join-Path $siteOutputRoot 'poverkadoma-problems.json') -Raw | ConvertFrom-Json).items | Where-Object { $_.image } | Select-Object -ExpandProperty image -Unique)
$siteAssetUrls = @{}
foreach($siteAsset in $siteEntries | Where-Object { $_.Target -in @('site.css','site.js','data.js') }){
  $siteHash=(Get-FileHash -LiteralPath (Join-Path $siteOutputRoot $siteAsset.Source) -Algorithm SHA256).Hash.ToLowerInvariant().Substring(0,16)
  $siteAssetUrls[$siteAsset.Source]=$siteAsset.Target+'?v='+$siteHash
}
$siteStream = [System.IO.File]::Open($siteArchivePath,[System.IO.FileMode]::Create)
$siteArchive = New-Object System.IO.Compression.ZipArchive($siteStream,[System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach($siteFile in $siteEntries){
    $siteText = [System.IO.File]::ReadAllText((Join-Path $siteOutputRoot $siteFile.Source))
    if($siteFile.Target -eq 'index.html'){foreach($siteSource in $siteAssetUrls.Keys){$siteText=$siteText.Replace($siteSource,$siteAssetUrls[$siteSource])}}
    $siteEntry=$siteArchive.CreateEntry($siteFile.Target,[System.IO.Compression.CompressionLevel]::Optimal)
    $siteWriter=New-Object System.IO.StreamWriter($siteEntry.Open(),(New-Object System.Text.UTF8Encoding($false)))
    try{$siteWriter.Write($siteText)}finally{$siteWriter.Dispose()}
  }
  foreach($siteImage in $siteEvidence){
    $siteEntry=$siteArchive.CreateEntry($siteImage,[System.IO.Compression.CompressionLevel]::Optimal)
    $siteImageStream=$siteEntry.Open()
    try { $siteBytes=[System.IO.File]::ReadAllBytes((Join-Path $siteOutputRoot $siteImage)); $siteImageStream.Write($siteBytes,0,$siteBytes.Length) } finally { $siteImageStream.Dispose() }
  }
}finally{$siteArchive.Dispose();$siteStream.Dispose()}
$siteReadStream=[System.IO.File]::OpenRead($siteArchivePath)
$siteReadArchive=New-Object System.IO.Compression.ZipArchive($siteReadStream,[System.IO.Compression.ZipArchiveMode]::Read)
try {
  if($siteReadArchive.Entries.Count -ne (5 + $siteEvidence.Count)){throw 'Unexpected archive entries'}
  foreach($siteExpected in $siteEntries){if(-not $siteReadArchive.GetEntry($siteExpected.Target)){throw ('Missing archive entry '+$siteExpected.Target)}}
  foreach($siteImage in $siteEvidence){if(-not $siteReadArchive.GetEntry($siteImage)){throw ('Missing screenshot '+$siteImage)}}
  $siteIndexReader=New-Object System.IO.StreamReader($siteReadArchive.GetEntry('index.html').Open())
  try{$siteIndex=$siteIndexReader.ReadToEnd()}finally{$siteIndexReader.Dispose()}
  foreach($siteResource in $siteAssetUrls.Values){if(-not $siteIndex.Contains('"'+$siteResource+'"')){throw ('Missing versioned resource '+$siteResource)}}
}finally{$siteReadArchive.Dispose();$siteReadStream.Dispose()}
$siteManifestPath=Join-Path $siteOutputRoot 'poverkadoma-design-site-manifest.json'
$siteManifest=Get-Content -LiteralPath $siteManifestPath -Raw | ConvertFrom-Json
$sitePackageInfo=[pscustomobject]@{file='poverkadoma-design-site.zip';bytes=(Get-Item -LiteralPath $siteArchivePath).Length;sha256=(Get-FileHash -LiteralPath $siteArchivePath -Algorithm SHA256).Hash;entries=(@('index.html','site.css','site.js','data.js','README.txt') + $siteEvidence);verified=$true}
$siteManifest | Add-Member -NotePropertyName package -NotePropertyValue $sitePackageInfo -Force
[System.IO.File]::WriteAllText($siteManifestPath,($siteManifest | ConvertTo-Json -Depth 30),(New-Object System.Text.UTF8Encoding($false)))
$sitePackageInfo | ConvertTo-Json -Compress
