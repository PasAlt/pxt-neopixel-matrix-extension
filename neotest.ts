{
    
    let strip = neopixelExtended.create(DigitalPin.P0, 24, neopixelExtended.Format.RGB);

    // 1
    // setPixelColor, show, length
    // Three pixel will light up: first one in red,
    // the one in the center in green and the one
    // at the end of the strip in blue
    basic.showString("1")
    strip.setPixelColor(0, 0xff0000)
    strip.setPixelColor(strip.length()/2, 0x00ff00)
    strip.setPixelColor(strip.length()-1, 0x0000ff)
    strip.show()
    basic.pause(2000)

    // 2
    // setPixelColor, show, length
    // The strip will fill itself with a blue set
    // overwriting the previous colors
    basic.showString("2")
    for (let i = 0; i <= strip.length(); i++) {
        strip.setPixelColor(i, 0x0000ff)
        strip.show()
        basic.pause(100)
    }

    // 3
    // setColor, show
    // The strip blinks three times magenta-green
    basic.showString("3")
    for (let i = 0; i < 3; i++) {
        strip.setColor(0xff00ff)
        strip.show()
        basic.pause(500)
        strip.setColor(0x00ff00)
        strip.show()
        basic.pause(500)
    }

    // 4
    // showRainbow, rotate, show, length
    // the strip shows rotating rainbow colors
    basic.showString("4")
    strip.showRainbow();
    for (let i = 0; i <= strip.length(); i++) { 
        strip.rotate();
        strip.show();
        basic.pause(100)
    }

    // 5
    // shift, showRainbow, show, length
    // the strip slowly empties itself 
    basic.showString("5")
    strip.showRainbow();
    for (let i = 0; i <= strip.length()/2; i++) {
        strip.shift(2);
        strip.show();
        basic.pause(200)
    }

    // 6
    // showColor, clear, show
    // The strip blinks three in time in yellow
    basic.showString("6")
    for (let i = 0; i < 3; i++) {
        strip.showColor(0xffff00)
        basic.pause(500)
        strip.clear()
        strip.show()
        basic.pause(500)
    }
    
    // 7
    // range, showColor, rgb
    // Shows 8 NeoPixels starting from NeoPixel at the 5th position blinking light blue and red
    basic.showString("7")
    let sub = strip.range(4, 8)
    for (let i = 0; i < 3; i++) {
        sub.showColor(neopixelExtended.rgb(0, 255, 255));
        basic.pause(200);
        sub.showColor(neopixelExtended.rgb(255, 0, 0));
        basic.pause(200);
    }
    sub.clear()
    sub.show()

    // 8
    // hsl, setPixelColor, length
    // Fills the strip with rainbow colors one after another. Restarts at the first NeoPixel when full.
    basic.showString("8")
    let position = 0
    for (let hue = 0; hue < 360; hue = hue + 10) {
        strip.setPixelColor(position, neopixelExtended.hsl(hue, 99, 50))
        strip.show()
        position += 1
        position = position > strip.length() ? 0 : position
        basic.pause(200)
    }

    // 9
    // showBarGraph, clear
    // Shows bar graph style column changing from half to one fifth to full and then empty. 
    basic.showString("9")
    strip.showBarGraph(5, 10);
    basic.pause(500)
    strip.showBarGraph(2, 10);
    basic.pause(500)
    strip.showBarGraph(10, 10);
    basic.pause(500)
    strip.showBarGraph(0, 10);
    basic.pause(500)

    // 10
    // setBrightness, setColor, show
    // This is not visible in the simulator
    basic.showString("10")
    for (let br = 255; br > 0; br = br - 20) {
        strip.setBrightness(br);
        strip.setColor(0x0000ff)
        strip.show()
        basic.pause(500)
    }

    // 11
    // easeBrightness, setBrightness, show
    // Eases brightness to the center of the strip multiple times
    basic.showString("11")
    strip.setBrightness(255)
    strip.setColor(0x00ff00)
    for (let i = 0; i < 10; i++) {
        strip.easeBrightness();
        strip.show()
        basic.pause(500)
    }

    // creates leds for 5x5 matrix
    strip = neopixelExtended.create(DigitalPin.P0, 25, neopixelExtended.Format.RGB);

    // 12
    // setMatrixWidth, setMatrixColor
    // Creates a yellow diagonal from top left to bottom
    basic.showString("12")
    for (let i = 0; i < 5; i++) {
        strip.setMatrixWidth(5)
        strip.setMatrixColor(i, i, 0xffff00)
        strip.show()
        basic.pause(500)
    }

    // 13 
    // setMatrix25, rowOf5
    // Shows twice an outward moving yellow ring on a red background
    basic.showString("13")
    for (let i = 0; i < 2; i++) {
        strip.setMatrix25(
            neopixelExtended.rowOf5(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xFF0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xFF0000, 0xFFD700, 0xff0000, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000)
        )
        strip.show()
        basic.pause(500)
        strip.setMatrix25(
            neopixelExtended.rowOf5(0xFF0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xFFD700, 0xFFD700, 0xFFD700, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xFFD700, 0xff0000, 0xFFD700, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xFFD700, 0xFFD700, 0xFFD700, 0xff0000),
            neopixelExtended.rowOf5(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xFF0000)
        )
        strip.show()
        basic.pause(500)
        strip.setMatrix25(
            neopixelExtended.rowOf5(0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700),
            neopixelExtended.rowOf5(0xFFD700, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf5(0xFFD700, 0xFF0000, 0xff0000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf5(0xFFD700, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf5(0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700)
        )
        strip.show()
        basic.pause(500)
    }

    // 14
    // Rotates a NeoPixel color configuration to the right
    // This will look wrong on a NeoPixel wired from left to right
    // setMatrixWiring, rowOf5, setMatrix25, setBrightness, show
    basic.showString("14")
    strip.setBrightness(255)
    strip.setMatrixWiring(neopixelExtended.MatrixDirection.LeftTopToTheRight)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let leftToptoTheRight = "20000e20000e10000f10000f10000f10000f10000f10000f10000f20000e10000f10000f10000f10000f10000f10000f10000f10000f10000f10000f10000f10000f10000f10000f10000f"
    if(strip.buf.toHex() != leftToptoTheRight) {
        throw "Left top to the right wiring has wrong byte stream. \n " + leftToptoTheRight + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()
    basic.pause(300)

    strip.setMatrixWiring(neopixelExtended.MatrixDirection.RightTopToTheBottom)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let rightTopToTheBottom = "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f20000e"
        + "20000e20000e10000f10000f10000f"
    if (strip.buf.toHex() != rightTopToTheBottom) {
        throw "Right top to the bottom wiring has wrong byte stream. \n " + rightTopToTheBottom + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()
    basic.pause(300)

    strip.setMatrixWiring(neopixelExtended.MatrixDirection.RightBottomToTheLeft)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let rightBottomToTheLeft = "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "20000e10000f10000f10000f10000f"
        + "10000f10000f10000f20000e20000e"
    if (strip.buf.toHex() != rightBottomToTheLeft) {
        throw "Right bottom to the left wiring has wrong byte stream. \n " + rightBottomToTheLeft + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()
    basic.pause(300)

    strip.setMatrixWiring(neopixelExtended.MatrixDirection.LeftBottomToTheTop)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let leftBottomToTheTop = "10000f10000f10000f20000e20000e"
        + "20000e10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
    if (strip.buf.toHex() != leftBottomToTheTop) {
        throw "Left bottom to the top wiring has wrong byte stream. \n " + leftBottomToTheTop + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()
    basic.pause(300)

    // 15
    // setMatrixWiring, rowOf5, setMatrix25, setBrightness, show
    // Rotates a NeoPixel color configuration to the left
    // This will look wrong on a NeoPixel wired from right to left
    basic.showString("15")
    strip.setBrightness(255)
    strip.setMatrixWiring(neopixelExtended.MatrixDirection.RightTopToTheLeft)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let rightTopToTheLeft = "10000f10000f10000f20000e20000e"
        + "20000e10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
    if (strip.buf.toHex() != rightTopToTheLeft) {
        throw "Right top to the left wiring has wrong byte stream. \n " + rightTopToTheLeft + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()

    basic.pause(300)
    strip.setMatrixWiring(neopixelExtended.MatrixDirection.LeftTopToTheBottom)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let leftTopToTheBottom = "20000e20000e10000f10000f10000f"
        + "10000f10000f10000f10000f20000e"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
    if (strip.buf.toHex() != leftTopToTheBottom) {
        throw "Right top to the bottom wiring has wrong byte stream. \n " + leftTopToTheBottom + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()

    basic.pause(300)
    strip.setMatrixWiring(neopixelExtended.MatrixDirection.LeftBottomToTheRight)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let leftBottomToTheRight = "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f20000e"
        + "20000e20000e10000f10000f10000f"
    if (strip.buf.toHex() != leftBottomToTheRight) {
        throw "Right bottom to the left wiring has wrong byte stream. \n " + leftBottomToTheRight + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()

    basic.pause(300)
    strip.setMatrixWiring(neopixelExtended.MatrixDirection.RightBottomToTheTop)
    strip.setMatrix25(
        neopixelExtended.rowOf5(0x00200E, 0x00200E, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00200E, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F),
        neopixelExtended.rowOf5(0x00100F, 0x00100F, 0x00100F, 0x00100F, 0x00100F)
    )
    let rightBottomToTheTop = "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "10000f10000f10000f10000f10000f"
        + "20000e10000f10000f10000f10000f"
        + "10000f10000f10000f20000e20000e"
    if (strip.buf.toHex() != rightBottomToTheTop) {
        throw "Left bottom to the top wiring has wrong byte stream. \n " + rightBottomToTheTop + " (expected) \n " + strip.buf.toHex() + " (actual) "
    }
    strip.show()
    basic.pause(300)

    // creates leds for 8x8 matrix
    strip = neopixelExtended.create(DigitalPin.P0, 64, neopixelExtended.Format.RGB);

    // 16
    // Blinks a smiley twice on an 8x8 NeoPixel matrix
    // setMatrix64, rowOf8
    basic.showString("16")
    for (let i = 0; i < 2; i++) {
        strip.setMatrix64(
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xFFD700, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFD700, 0xff0000),
            neopixelExtended.rowOf8(0xFFD700, 0xE60026, 0x000000, 0xff0000, 0xff0000, 0x000000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf8(0xFFD700, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf8(0xFFD700, 0xff0000, 0x000000, 0xff0000, 0xff0000, 0x000000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf8(0xFFD700, 0xff0000, 0xff0000, 0x000000, 0x000000, 0xff0000, 0xFF0000, 0xFFD700),
            neopixelExtended.rowOf8(0xff0000, 0xFFD700, 0xff0000, 0xff0000, 0xff0000, 0xFF0000, 0xFFD700, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700, 0xff0000, 0xff0000)
        )
        strip.show()
        basic.pause(500)
        strip.setMatrix64(
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000),
            neopixelExtended.rowOf8(0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000)
        )
        strip.show()
        basic.pause(500)
    }

    // 17
    // shows estimated power consumption
    basic.showString("17: " + strip.power()+" mA")

    // END
    strip.clear()
    strip.show()
    basic.showString("END")
}
