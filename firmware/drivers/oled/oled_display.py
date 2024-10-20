import time
import sys
import board
import digitalio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont



if __name__ == "__main__": 

    output = sys.argv[1]

    # Create the I2C interface
    i2c = board.I2C()
    oled = adafruit_ssd1306.SSD1306_I2C(128, 96, i2c)
    oled.fill(0)
    oled.show()
    image = Image.new("1", (oled.width, oled.height))

    # create an object to draw on the image
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()
    draw.text((0, 0), "Hello, OLED!", font=font, fill=255)

    # display the image on the OLED
    oled.image(image)
    oled.show()
