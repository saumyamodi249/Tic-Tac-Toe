Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(128, 128)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

# Draw dark rounded squircle
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 28
$d = $radius * 2
$path.AddArc(6, 6, $d, $d, 180, 90)
$path.AddArc(122 - $d, 6, $d, $d, 270, 90)
$path.AddArc(122 - $d, 122 - $d, $d, $d, 0, 90)
$path.AddArc(6, 122 - $d, $d, $d, 90, 90)
$path.CloseFigure()

# Border gradient brush from cyan to rose
$pt1 = New-Object System.Drawing.PointF(6, 122)
$pt2 = New-Object System.Drawing.PointF(122, 6)
$c1 = [System.Drawing.Color]::FromArgb(255, 56, 189, 248)
$c2 = [System.Drawing.Color]::FromArgb(255, 251, 113, 133)
$gb = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $c1, $c2)
$penBorder = New-Object System.Drawing.Pen($gb, 3.5)
$darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 15, 24))

$g.FillPath($darkBrush, $path)
$g.DrawPath($penBorder, $path)

# Outer circle: cyan #38bdf8
$cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 56, 189, 248), 6.0)
$g.DrawEllipse($cyanPen, 26, 26, 76, 76)

# Middle circle: rose #fb7185
$rosePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 251, 113, 133), 5.5)
$g.DrawEllipse($rosePen, 39, 39, 50, 50)

# Center circle: cyan #38bdf8
$cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.FillEllipse($cyanBrush, 53, 53, 22, 22)

$bmp.Save("c:\Users\saumy\OneDrive\Documents\Tic-Tac-Toe\public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Generated public/logo.png successfully"
