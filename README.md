# Domain Tab Grouper

A Chrome extension that automatically groups browser tabs by their domain.

## Features

- Automatically groups tabs with the same domain
- Configure whether subdomains should be grouped with the main domain
- Customize the color for each domain group
- Add custom names to domain groups
- Option to enable/disable automatic grouping for new tabs
- Manually trigger regrouping of all tabs

## Installation

### From Source Code

1. Clone this repository or download the source code
2. Convert the SVG icons to PNG format (see Icon Conversion section below)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked" and select the extension directory

### From Chrome Web Store

*Coming soon*

## Usage

### Basic Usage

1. After installation, the extension will automatically group your open tabs by domain
2. Each domain will have its own color for easy identification
3. Click on the extension icon to open the settings popup

### Configuration Options

- **Group subdomains together**: When enabled, treats subdomains as part of the main domain (e.g., `mail.google.com` will be grouped with `google.com`)
- **Auto-group new tabs**: When enabled, new tabs are automatically added to their respective domain groups
- **Domain Settings**: Customize the color and name for each domain group
- **Regroup Tabs**: Manually trigger regrouping of all open tabs (useful after changing settings)

## Icon Conversion

The extension includes SVG icon files that need to be converted to PNG format before using the extension.

### Using the Provided Python Script

The easiest way to convert icons is to use the included Python script:

1. Make sure you have Python 3.6+ installed
2. Install the required packages:

   ```
   pip install cairosvg pillow
   ```

3. Run the conversion script:

   ```
   python convert_icons.py
   ```

4. The script will automatically create PNG versions of all icons with the correct dimensions

### Manual Conversion Options

You can also convert the icons manually using:

1. **Online converters**: Use websites like [SVGPNG.com](https://svgpng.com/), [Convertio](https://convertio.co/svg-png/), or [SVG2PNG](https://svg2png.com/)
2. **Graphics editors**: Use Adobe Illustrator, Inkscape, GIMP, or Photoshop to open the SVG and export as PNG
3. **Command line**: Use tools like ImageMagick or svgexport

Ensure you maintain the correct dimensions:

- icon16.svg → 16×16 pixels
- icon48.svg → 48×48 pixels
- icon128.svg → 128×128 pixels

## Development

### Project Structure

- `manifest.json`: Extension configuration and metadata
- `background.js`: Core functionality for tab monitoring and grouping
- `popup.html` & `popup.js`: User interface for configuration
- `icons/`: SVG and PNG icons for the extension
- `convert_icons.py`: Script to convert SVG icons to PNG format

### Build and Packaging

To package the extension for distribution:

1. Make sure all files are in place and SVG icons are converted to PNG
2. Create a ZIP file of the entire directory
3. This file can be uploaded to the Chrome Web Store or shared for manual installation

## License

MIT License

## Contact

For support or feature requests, please open an issue on the GitHub repository.

---

*Note: Chrome's tab groups feature must be enabled in your browser for this extension to work.*
