{
    let strip = neopixelExtended.create(DigitalPin.P0, 24, neopixelExtended.Format.RGB);
    strip.setPixelColor(0, 0xff0000)
    strip.setPixelColor(1, 0x00ff00)
    strip.setPixelColor(2, 0x0000ff)
    strip.show()
    pause(2000)
    strip.showRainbow();
    for (let i = 0; i <= strip.length(); i++) { 
        strip.rotate();
        strip.show();
        basic.pause(100)
    }
    
    strip.showColor(0xff0000)
    basic.pause(2000)
    strip.showColor(0x00ff00)
    basic.pause(1000)
    for (let i = 0; i <= strip.length(); i++) {
        strip.setPixelColor(i, 0x0000ff)
        strip.show()
        basic.pause(100)
    }
    for (let i = 0; i <= strip.length(); i++) {
        strip.setPixelColor(i, 0x00ff00)
        strip.show()
        basic.pause(100)
    }
    let sub = strip.range(10, 20)
    sub.showColor(0x00ffff);
    basic.pause(200);

    sub.showBarGraph(5, 10);
    basic.pause(200);

    let br = 100;
    strip.setBrightness(100);
    input.onButtonPressed(Button.B, () => {
        br = br + 20;
        if (br > 255) {
            br = 5;
        }
        strip.setBrightness(br);
    });

    let rotationMode = false;
    input.onButtonPressed(Button.A, () => {
        rotationMode = !rotationMode;
        if (rotationMode) {
            basic.showLeds(`
            . # # # .
            # . . . #
            # . . . #
            # . . . #
            . # # # .
            `);
        } else {
            basic.showLeds(`
            . . # . .
            . . . # .
            # # # # #
            . . . # .
            . . # . .
            `);

        }
    });

    while (true) {
        let x = input.acceleration(Dimension.X) >> 1
        let y = input.acceleration(Dimension.Y) >> 1
        let z = input.acceleration(Dimension.Z) >> 1
        if (rotationMode) {
            strip.rotate();
        } else {
            strip.setPixelColor(0, neopixelExtended.rgb(x, y, -z));
            strip.shift(1);
        }
        strip.show();
        basic.pause(100);
    }
}
