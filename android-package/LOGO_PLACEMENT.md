# ArBonKas Android App - Logo Placement

## Logo File Required

The ArBonKas Android application requires a logo image file for proper display.

### Logo Specifications:
- **Filename**: `arbonkas_logo.png`
- **Recommended size**: 512x512 pixels (will be scaled automatically)
- **Format**: PNG with transparency
- **Design**: ArBonKas branding logo

### Placement Locations:

Place the `arbonkas_logo.png` file in the following directories:

1. **Main drawable folder** (used by app):
   - `android-package/app/src/main/res/drawable/arbonkas_logo.png`

2. **Density-specific folders** (optional, for better quality):
   - `android-package/app/src/main/res/drawable-mdpi/arbonkas_logo.png` (48x48)
   - `android-package/app/src/main/res/drawable-hdpi/arbonkas_logo.png` (72x72)
   - `android-package/app/src/main/res/drawable-xhdpi/arbonkas_logo.png` (96x96)
   - `android-package/app/src/main/res/drawable-xxhdpi/arbonkas_logo.png` (144x144)
   - `android-package/app/src/main/res/drawable-xxxhdpi/arbonkas_logo.png` (192x192)

### Usage in App:

The logo appears in two places:
1. **Splash Screen**: Animated logo displayed on app launch
2. **Main Activity**: Watermark logo in background of financial content

### Notes:

- If the logo file is missing, the app will still run but the ImageView components will show placeholder graphics
- For best results, use a transparent background PNG
- The logo should be recognizable at small sizes
- Consider using vector drawable (SVG converted to XML) for scalability

## Creating the Logo

If you need to create a logo for ArBonKas:

1. Design a logo representing financial management and carbon modification
2. Export as PNG with transparent background
3. Size at 512x512 pixels
4. Save with filename `arbonkas_logo.png`
5. Place in the drawable folder(s) listed above
