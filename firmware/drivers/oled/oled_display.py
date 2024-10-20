import time
import board
import digitalio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont

# Create the I2C interface
i2c = board.I2C()

# Create the OLED display object (128x96 dimensions)
oled = adafruit_ssd1306.SSD1306_I2C(128, 96, i2c)

# Clear the display
oled.fill(0)
oled.show()

# Create a blank image for drawing (1-bit color)
image = Image.new("1", (oled.width, oled.height))

# Create an object to draw on the image
draw = ImageDraw.Draw(image)

# Load a font (optional)
font = ImageFont.load_default()

# Draw something (for example, text)
draw.text((0, 0), "Hello, OLED!", font=font, fill=255)

# Display the image on the OLED
oled.image(image)
oled.show()

time.sleep(5)

# Clear the display after showing content
oled.fill(0)
oled.show()
