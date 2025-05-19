#!/usr/bin/env python3
"""
SVG to PNG Icon Converter for Domain Tab Grouper Extension

This script converts SVG icons to PNG format with the correct dimensions
for use in the Chrome extension.

Requirements:
    pip install cairosvg pillow

Usage:
    python convert_icons.py
"""

import os
import sys
try:
    import cairosvg
    from PIL import Image
except ImportError:
    print("Required libraries not found. Please install them using:")
    print("pip install cairosvg pillow")
    sys.exit(1)

def convert_svg_to_png(input_file, output_file, width, height):
    """Convert an SVG file to PNG with specified dimensions."""
    try:
        # First convert SVG to PNG using cairosvg
        temp_output = f"{output_file}.temp.png"
        cairosvg.svg2png(url=input_file, write_to=temp_output, output_width=width, output_height=height)
        
        # Then use Pillow to ensure the exact dimensions
        with Image.open(temp_output) as img:
            img = img.resize((width, height), Image.LANCZOS)
            img.save(output_file, "PNG", optimize=True)
        
        # Remove temporary file
        if os.path.exists(temp_output):
            os.remove(temp_output)
        
        return True
    except Exception as e:
        print(f"Error converting {input_file}: {e}")
        return False

def main():
    # Define the current directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the icons directory
    icons_dir = os.path.join(script_dir, "icons")
    
    # Make sure the icons directory exists
    if not os.path.exists(icons_dir):
        print(f"Error: Icons directory not found at {icons_dir}")
        sys.exit(1)
    
    # Define icon sizes and files
    icons = [
        {"svg": "icon16.svg", "png": "icon16.png", "size": 16},
        {"svg": "icon48.svg", "png": "icon48.png", "size": 48},
        {"svg": "icon128.svg", "png": "icon128.png", "size": 128},
    ]
    
    # Process each icon
    success_count = 0
    for icon in icons:
        svg_path = os.path.join(icons_dir, icon["svg"])
        png_path = os.path.join(icons_dir, icon["png"])
        size = icon["size"]
        
        if not os.path.exists(svg_path):
            print(f"Warning: SVG file not found: {svg_path}")
            continue
        
        print(f"Converting {icon['svg']} to {icon['png']} ({size}x{size})...")
        if convert_svg_to_png(svg_path, png_path, size, size):
            success_count += 1
            print(f"Successfully created {png_path}")
    
    # Display summary
    if success_count == len(icons):
        print("\nSuccess! All icons were converted.")
        print("\nYou can now use the extension with the following steps:")
        print("1. Open Chrome and go to chrome://extensions/")
        print("2. Enable 'Developer mode' in the top right")
        print("3. Click 'Load unpacked' and select this extension directory")
    else:
        print(f"\nPartial success: {success_count} of {len(icons)} icons were converted.")
        print("Please fix the errors and try again.")

if __name__ == "__main__":
    main() 