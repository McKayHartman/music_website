from PIL import Image, ImageDraw, ImageFont
import io

def add_watermark_to_png(png_bytes, watermark_text="SAMPLE", font_path=None):
    """
    Adds a diagonal watermark to a PNG image from bytes.

    Args:
        png_bytes (bytes): PNG image data from database
        watermark_text (str): Text to use as watermark
        font_path (str): Path to TTF font (optional)
    Returns:
        bytes: Watermarked PNG image bytes
    """
    # Open image from bytes
    image = Image.open(io.BytesIO(png_bytes)).convert("RGBA")

    # Make a transparent layer for the watermark
    watermark_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)

    # Choose font
    font_size = int(min(image.size) / 5)  # font scales with image
    try:
        font = ImageFont.truetype(font_path or "arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    # Calculate position roughly centered
    text_width, text_height = draw.textsize(watermark_text, font=font)
    x = (image.width - text_width) / 2
    y = (image.height - text_height) / 2

    # Draw watermark in light gray with some transparency
    draw.text((x, y), watermark_text, fill=(200, 200, 200, 128), font=font)

    # Rotate the watermark layer
    rotated = watermark_layer.rotate(45, expand=1)

    # Composite watermark over original image
    watermarked = Image.alpha_composite(image, rotated.crop((0, 0, image.width, image.height)))

    # Convert back to RGB if you want PNG without alpha
    final_image = watermarked.convert("RGB")

    # Save to bytes
    output_bytes = io.BytesIO()
    final_image.save(output_bytes, format="PNG")
    return output_bytes.getvalue()


# Example usage: read PNG from file (replace with database bytes)
with open("sheet.png", "rb") as f:
    png_data = f.read()

watermarked_bytes = add_watermark_to_png(png_data)

# Save the result to disk
with open("sheet_sample.png", "wb") as f:
    f.write(watermarked_bytes)

print("Watermarked image saved as sheet_sample.png")
