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
$siteStream = [System.IO.File]::Open($siteArchivePath,[System.IO.FileMode]::Create)
$siteArchive = New-Object System.IO.Compression.ZipArchive($siteStream,[System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach($siteFile in $siteEntries){
    $siteText = [System.IO.File]::ReadAllText((Join-Path $siteOutputRoot $siteFile.Source))
    if($siteFile.Target -eq 'index.html'){$siteText=$siteText.Replace('poverkadoma-design-site.css','site.css').Replace('poverkadoma-design-site-data.js','data.js').Replace('poverkadoma-design-site.js','site.js')}
    $siteEntry=$siteArchive.CreateEntry($siteFile.Target,[System.IO.Compression.CompressionLevel]::Optimal)
    $siteWriter=New-Object System.IO.StreamWriter($siteEntry.Open(),(New-Object System.Text.UTF8Encoding($false)))
    try{$siteWriter.Write($siteText)}finally{$siteWriter.Dispose()}
  }
}finally{$siteArchive.Dispose();$siteStream.Dispose()}
$siteReadStream=[System.IO.File]::OpenRead($siteArchivePath)
$siteReadArchive=New-Object System.IO.Compression.ZipArchive($siteReadStream,[System.IO.Compression.ZipArchiveMode]::Read)
try {
  if($siteReadArchive.Entries.Count -ne 5){throw 'Unexpected archive entries'}
  foreach($siteExpected in $siteEntries){if(-not $siteReadArchive.GetEntry($siteExpected.Target)){throw ('Missing archive entry '+$siteExpected.Target)}}
  $siteIndexReader=New-Object System.IO.StreamReader($siteReadArchive.GetEntry('index.html').Open())
  try{$siteIndex=$siteIndexReader.ReadToEnd()}finally{$siteIndexReader.Dispose()}
  foreach($siteResource in @('site.css','site.js','data.js')){if(-not $siteIndex.Contains('"'+$siteResource+'"')){throw ('Missing portable resource '+$siteResource)}}
}finally{$siteReadArchive.Dispose();$siteReadStream.Dispose()}
$siteManifestPath=Join-Path $siteOutputRoot 'poverkadoma-design-site-manifest.json'
$siteManifest=Get-Content -LiteralPath $siteManifestPath -Raw | ConvertFrom-Json
$sitePackageInfo=[pscustomobject]@{file='poverkadoma-design-site.zip';bytes=(Get-Item -LiteralPath $siteArchivePath).Length;sha256=(Get-FileHash -LiteralPath $siteArchivePath -Algorithm SHA256).Hash;entries=@('index.html','site.css','site.js','data.js','README.txt');verified=$true}
$siteManifest | Add-Member -NotePropertyName package -NotePropertyValue $sitePackageInfo -Force
[System.IO.File]::WriteAllText($siteManifestPath,($siteManifest | ConvertTo-Json -Depth 30),(New-Object System.Text.UTF8Encoding($false)))
$sitePackageInfo | ConvertTo-Json -Compress
