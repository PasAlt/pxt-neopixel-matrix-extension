/**
 * Functions to operate NeoPixel strips.
 */
//% weight=1000 color=#3E7104 icon="\uf110"
namespace neopixelExtended {
    /**
    * Different formats for RGB or RGB+W NeoPixel strips
    */
    export enum Format {
        //% block="RGB (GRB format)"
        RGB = 1,
        //% block="RGB+W"
        RGBW = 2,
        //% block="RGB (RGB format)"
        RGB_RGB = 3
    }

    /**
     * Create a new NeoPixel driver for `numleds` LEDs with 
     * brightness set to 128 (~50%).
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     */
    //% blockId="neopixel_create" 
    //% block="NeoPixel at pin %pin|with %numleds|leds as %mode"
    //% weight=1000
    //% parts="neopixel"
    //% trackArgs=0,2
    //% blockSetVariable=strip
    //% group="Initialization"
    export function create(pin: DigitalPin, numleds: number, format: neopixelExtended.Format): Strip {
        let strip = new Strip();
        let stride = format === neopixelExtended.Format.RGBW ? 4 : 3;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.start = 0;
        strip._length = numleds;
        strip._matrixDirection = neopixelExtended.MatrixDirection.LeftTopToTheRight
        strip._format = format || neopixelExtended.Format.RGB;
        strip._matrixWidth = 0;
        strip.setBrightness(128)
        strip.setPin(pin)
        return strip;
    }

    /*
    * Different matrix wiring directions
    */
    export enum MatrixDirection {
        //% block="top right to the left"
        RightTopToTheLeft,
        //% block="top left to the right"
        LeftTopToTheRight,
        //% block="bottom left to the right"
        LeftBottomToTheRight,
        //% block="bottom right to the left"
        RightBottomToTheLeft,
        //% block="top left to the bottom"
        LeftTopToTheBottom,
        //% block="top right to the bottom"
        RightTopToTheBottom,
        //% block="bottom right to the top"
        RightBottomToTheTop,
        //% block="bottom left to the top"
        LeftBottomToTheTop
    }

    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _format: neopixelExtended.Format;
        _matrixWidth: number; // number of leds in a matrix - if any
        _matrixDirection: neopixelExtended.MatrixDirection

        /**
         * Send all the changes to the strip.
         */
        //% blockId="neopixel_show" 
        //% block="%strip|show"
        //% strip.defl=strip
        //% weight=10
        //% parts="neopixel"
        //% group="Show"
        show() {
            // only supported in beta
            // ws2812b.setBufferMode(this.pin, this._format);
            ws2812b.sendBuffer(this.buf, this.pin);
        }

        /**
         * Create a range of LEDs.
         * @param start offset in the NeoPixel strip to start the range
         * @param length number of NeoPixels in the range. eg: 4
         */
        //% weight=89
        //% blockId="neopixel_range" 
        //% block="%strip|range from %start|with %length|leds"
        //% strip.defl=strip
        //% parts="neopixel" 
        //% advanced=true
        //% blockSetVariable=range
        //% group="Initialization"
        range(start: number, length: number): Strip {
            start = start >> 0;
            length = length >> 0;
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            strip._matrixWidth = 0;
            strip._format = this._format;
            return strip;
        }

        /**
         * Sets all NeoPixel to a given color (range 0-255 for r, g, b) in the buffer.
         * Call ``show()`` to make the changes visible.
         * @param rgb RGB color of the NeoPixels
         */
        //% blockId="neopixel_set_strip_color_real" 
        //% block="%strip|set color %rgb"
        //% strip.defl=strip
        //% weight=85
        //% rgb.shadow="colorNumberPickerLarge"
        //% parts="neopixel"
        //% group="Colors"
        setColor(rgb: number) {
            rgb = rgb >> 0; // ensure rgb to be a (signed) integer
            this.setAllRGB(rgb);
        }

        /**
         * Set NeoPixel at the given position to a given color (range 0-255 for r, g, b) in the buffer. 
         * 
         * Does leave all the other NeoPixels as they were.
         * 
         * Call ``show()`` to make the changes visible.
         * @param position position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" 
        //% block="%strip|set pixel color at %position|to %rgb"
        //% strip.defl=strip
        //% weight=80
        //% rgb.shadow="colorNumberPickerLarge"
        //% parts="neopixel" 
        //% group="Colors"
        setPixelColor(position: number, rgb: number): void {
            this.setPixelRGB(position >> 0, rgb >> 0);
        }

        /**
         * Sets the number of pixels in a matrix shaped strip
         * @param width number of pixels in a row
         */
        //% blockId=neopixel_set_matrix_width 
        //% block="%strip|set matrix width %width"
        //% strip.defl=strip
        //% weight=5
        //% parts="neopixel" 
        //% advanced=true
        //% group="Matrix"
        setMatrixWidth(width: number) {
            this._matrixWidth = Math.min(this._length, width >> 0);
        }

        /**
         * Set NeoPixel to a given color (range 0-255 for r, g, b) in a matrix shaped strip
         * Call ``show`` to make the changes visible.
         * @param x horizontal position
         * @param y horizontal position
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_matrix_color" 
        //% block="%strip|set matrix color at x %x|y %y|to %rgb"
        //% strip.defl=strip
        //% weight=4
        //% parts="neopixel" 
        //% rgb.shadow="colorNumberPickerLarge"
        //% advanced=true
        //% group="Matrix"
        setMatrixColor(x: number, y: number, rgb: number) {
            if (this._matrixWidth <= 0) return; // not a matrix, ignore
            x = x >> 0;
            y = y >> 0;
            rgb = rgb >> 0;
            const cols = Math.idiv(this._length, this._matrixWidth);
            if (x < 0 || x >= this._matrixWidth || y < 0 || y >= cols) return;
            let i = x + y * this._matrixWidth;
            this.setPixelColor(i, rgb);
        }

        /**
         * For NeoPixels with RGB+W LEDs, set the white LED brightness. This only works for RGB+W NeoPixels.
         * @param position position of the LED in the strip
         * @param white brightness of the white LED
         */
        //% blockId="neopixel_set_pixel_white" 
        //% block="%strip|set pixel white LED at %position|to %white"
        //% strip.defl=strip
        //% weight=80
        //% parts="neopixel" 
        //% advanced=true
        //% group="Colors"
        setPixelWhiteLED(position: number, white: number): void {
            if (this._format === neopixelExtended.Format.RGBW) {
                this.setPixelW(position >> 0, white >> 0);
            }
        }

        /**
         * Turn off all NeoPixels.
         * 
         * Call ``show`` to make the changes visible.
         */
        //% blockId="neopixel_clear" 
        //% block="%strip|clear"
        //% strip.defl=strip
        //% weight=76
        //% parts="neopixel"
        //% group="Manipulation"
        clear(): void {
            const stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }

        /**
         * Gets the number of NeoPixels declared on the strip
         */
        //% blockId="neopixel_length" 
        //% block="%strip|length"
        //% strip.defl=strip
        //% weight=60 
        //% advanced=true
        //% group="Initialization"
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of NeoPixel brightness in 0-255. eg: 255
         */
        //% blockId="neopixel_set_brightness" 
        //% block="%strip|set brightness %brightness"
        //% strip.defl=strip
        //% weight=59
        //% parts="neopixel" 
        //% advanced=true
        //% group="Colors"
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /**
         * Apply brightness to current colors using a quadratic easing function.
         **/
        //% blockId="neopixel_each_brightness" 
        //% block="%strip|ease brightness" 
        //% strip.defl=strip
        //% weight=58
        //% parts="neopixel" 
        //% advanced=true
        //% group="Colors"
        easeBrightness(): void {
            const stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            const br = this.brightness;
            const buf = this.buf;
            const end = this.start + this._length;
            const mid = Math.idiv(this._length, 2);
            for (let i = this.start; i < end; ++i) {
                const k = i - this.start;
                const ledoffset = i * stride;
                const br = k > mid
                    ? Math.idiv(255 * (this._length - 1 - k) * (this._length - 1 - k), (mid * mid))
                    : Math.idiv(255 * k * k, (mid * mid));
                const r = (buf[ledoffset + 0] * br) >> 8; buf[ledoffset + 0] = r;
                const g = (buf[ledoffset + 1] * br) >> 8; buf[ledoffset + 1] = g;
                const b = (buf[ledoffset + 2] * br) >> 8; buf[ledoffset + 2] = b;
                if (stride == 4) {
                    const w = (buf[ledoffset + 3] * br) >> 8; buf[ledoffset + 3] = w;
                }
            }
        }

        /**
         * Shift NeoPixel colors stored in buffer forward. Clear with zeros.
         * 
         * Call ``show`` to make the changes visible.
         * @param offset number of NeoPixel to shift forward, eg: 1
         */
        //% blockId="neopixel_shift" 
        //% block="%strip|shift pixels by %offset" 
        //% strip.defl=strip
        //% weight=40
        //% parts="neopixel"
        //% group="Manipulation"
        shift(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Rotate NeoPixel colors stored in buffer forward.
         * 
         * Call ``show`` to make the changes visible.
         * @param offset number of pixels to rotate forward, eg: 1
         */
        //% blockId="neopixel_rotate" 
        //% block="%strip|rotate pixels by %offset" 
        //% strip.defl=strip
        //% weight=39
        //% parts="neopixel"
        //% group="Manipulation"
        rotate(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Set the pin where the neopixel is connected, defaults to P0.
         * 
         * @param pin pin to connect to
         */
        //% weight=10
        //% parts="neopixel" 
        //% advanced=true
        //% group="Initialization"
        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);
            // don't yield to avoid races on initialization
        }

        /**
         * Estimates the electrical current (mA) consumed by the current light configuration.
         */
        //% weight=9 
        //% blockId=neopixel_power 
        //% block="%strip|power (mA)"
        //% strip.defl=strip
        //% advanced=true
        //% group="Variables"
        power(): number {
            const stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            const end = this.start + this._length;
            let p = 0;
            for (let i = this.start; i < end; ++i) {
                const ledoffset = i * stride;
                for (let j = 0; j < stride; ++j) {
                    p += this.buf[i + j];
                }
            }
            return Math.idiv(this.length() * 7, 10) /* 0.7mA per neopixel */
                + Math.idiv(p * 480, 10000); /* rought approximation */
        }

        /**
         * Shows all NeoPixel in a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the NeoPixels
         */
        //% blockId="neopixel_set_strip_color" 
        //% block="%strip|show color %rgb"
        //% strip.defl=strip
        //% weight=85 
        //% rgb.shadow="colorNumberPickerLarge"
        //% parts="neopixel" 
        //% advanced=true
        //% group="Show"
        showColor(rgb: number) {
            rgb = rgb >> 0; // ensure rgb to be a (signed) integer
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Shows a rainbow pattern on all LEDs.
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% blockId="neopixel_set_strip_rainbow" 
        //% block="%strip|show rainbow from %startHue|to %endHue"
        //% strip.defl=strip
        //% weight=85 
        //% parts="neopixel" 
        //% advanced=true
        //% group="Show"
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;
            const direction = neopixelExtended.HueInterpolationDirection.Clockwise;

            //hue
            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStepCW = Math.idiv((hDistCW * 100), steps);
            const hDistCCW = ((h1 + 360) - h2) % 360;
            const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
            let hStep: number;
            if (direction === neopixelExtended.HueInterpolationDirection.Clockwise) {
                hStep = hStepCW;
            } else if (direction === neopixelExtended.HueInterpolationDirection.CounterClockwise) {
                hStep = hStepCCW;
            } else {
                hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
            }
            const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //sat
            const s1 = saturation;
            const s2 = saturation;
            const sDist = s2 - s1;
            const sStep = Math.idiv(sDist, steps);
            const s1_100 = s1 * 100;

            //lum
            const l1 = luminance;
            const l2 = luminance;
            const lDist = l2 - l1;
            const lStep = Math.idiv(lDist, steps);
            const l1_100 = l1 * 100

            //interpolate
            if (steps === 1) {
                this.setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
            } else {
                this.setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    const s = Math.idiv((s1_100 + i * sStep), 100);
                    const l = Math.idiv((l1_100 + i * lStep), 100);
                    this.setPixelColor(i, hsl(h, s, l));
                }
                this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            this.show();
        }

        /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, eg: 255
         */
        //% weight=84
        //% blockId=neopixel_show_bar_graph 
        //% block="%strip|show bar graph of %value|up to %high"
        //% strip.defl=strip
        //% parts="neopixel" 
        //% advanced=true
        //% group="Show"
        showBarGraph(value: number, high: number): void {
            if (high <= 0) {
                this.clear();
                this.setPixelColor(0, 0xFFFF00);
                this.show();
                return;
            }

            value = Math.abs(value);
            const n = this._length;
            const n1 = n - 1;
            let v = Math.idiv((value * n), high);
            if (v == 0) {
                this.setPixelColor(0, 0x666600);
                for (let i = 1; i < n; ++i)
                    this.setPixelColor(i, 0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        const b = Math.idiv(i * 255, n1);
                        this.setPixelColor(i, rgb(b, 0, 255 - b));
                    }
                    else this.setPixelColor(i, 0);
                }
            }
            this.show();
        }

        /**
        * Sets the direction how the matrix is wired on the
        * board.
        * 
        * It always expects the wiring to be
        * arranged in "snake" format e.g.
        *
        * ---->
        * <---' 
        * '--->
        */
        //% block="%strip set NeoPixel matrix wiring to %dir"
        //% strip.defl=strip
        //% parts="neopixel"
        //% weight=0
        //% group="Matrix"
        // direction.shadow="neopixel_matrix_direction_selector"
        setMatrixWiring(dir : neopixelExtended.MatrixDirection) {
            this._matrixDirection = dir
        }

        /**
         * Sets the NeoPixel colors in the buffer 
         * of a strip of 25 NeoPixels 
         * Expecting strip to be arranged in a 5x5 matrix.
         *
         * Call ``show`` to make the changes visible.
         * @param v1-v5 matrix rows as number[]
         */
        //% block="set NeoPixel 5x5 %strip | %v1 %v2 %v3 %v4 %v5"
        //% v1.shadow="rowOf5"
        //% v2.shadow="rowOf5"
        //% v3.shadow="rowOf5"
        //% v4.shadow="rowOf5"
        //% v5.shadow="rowOf5"
        //% inlineInputMode=external
        //% strip.defl=strip
        //% parts="neopixel"
        //% weight=23
        //% group="Matrix"
        setMatrix25(v1: number[],
            v2: number[],
            v3: number[],
            v4: number[],
            v5: number[]): void {
            if (this.length() != 25) {
                throw "Matrix is not 5x5. You need to set matrix to 25 NeoPixels. Please check your initialization!"
            }
            this.setMatrixWidth(5)

            let rows : number[][] = [v1, v2, v3, v4, v5]
            rows = this.adjustMatrixForDirection(rows)
            this.setBufferWithMatrix(rows)
        }

        private setBufferWithMatrix(rows : number[][]) {
            let index = 0
            rows.forEach((row: number[]) => {
                row.forEach((color: number) => {
                    this.setPixelColor(index++, color)
                })
            })
        }

        private adjustMatrixForDirection(rows : number[][]) : number[][] {
            if (this._matrixDirection == neopixelExtended.MatrixDirection.LeftTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheTop) {
                rows = this.rotateMatrixClockwise(rows)
            }
            else if (this._matrixDirection == neopixelExtended.MatrixDirection.RightTopToTheBottom,
                this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop) {
                rows = this.rotateMatrixCounterClockwise(rows)
            }

            if (this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheRight
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheLeft
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheTop
            ) {
                rows.reverse()
            }

            if (this._matrixDirection == neopixelExtended.MatrixDirection.LeftTopToTheRight
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheRight
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheTop) {
                this.reverseOddRows(rows)
            }
            else if (this._matrixDirection == neopixelExtended.MatrixDirection.RightTopToTheLeft
                || this._matrixDirection == neopixelExtended.MatrixDirection.RightBottomToTheLeft
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftTopToTheBottom
                || this._matrixDirection == neopixelExtended.MatrixDirection.LeftBottomToTheTop) {
                this.reverseEvenRows(rows)
            }

            return rows
        }

        private rotateMatrixClockwise(rows : number[][]) : number[][] {
            // from https://stackoverflow.com/a/58668351
            // Nitin Jadhav under CC-BY-SA 4.0
            return rows[0].map((_, index) => { // traverse over each element of first column
                let row = rows.map(row => row[index]) // get elements at column given by index
                row.reverse() // reverse order of elements in column
                return row
            })
        }

        private rotateMatrixCounterClockwise(rows: number[][]): number[][] {
            // from https://stackoverflow.com/a/58668351 (see comments)
            // Karan Ratan under CC-BY-SA 4.0
            return rows.map((_, index) => {
                return rows.map(row => row[row.length - 1 - index])
            })
        }

        private reverseOddRows(rows : number[][]) {
            rows.forEach((row, index) => {
                if(index % 2 == 1) {
                    row.reverse()
                }
            })
        }

        private reverseEvenRows(rows : number[][]) {
            rows.forEach((row, index) => {
                if (index % 2 == 0) {
                    row.reverse()
                }
            })
        }

        /**
         * Sets the LED in a NeoPixel strip of
         * 64 NeoPixels expecting them to be
         * arranged in a 8x8 matrix.
         * 
         * You will to need to use #show() to make
         * the changes visible.
         */
        //% block="set NeoPixel 8x8 %strip | %v1 %v2 %v3 %v4 %v5 %v6 %v7 %v8"
        //% v1.shadow="rowOf8"
        //% v2.shadow="rowOf8"
        //% v3.shadow="rowOf8"
        //% v4.shadow="rowOf8"
        //% v5.shadow="rowOf8"
        //% v6.shadow="rowOf8"
        //% v7.shadow="rowOf8"
        //% v8.shadow="rowOf8"
        //% inlineInputMode=external
        //% strip.defl=strip
        //% parts="neopixel"
        //% group="Matrix"
        //% weight="63"
        setMatrix64(v1: number[],
            v2: number[],
            v3: number[],
            v4: number[],
            v5: number[],
            v6: number[],
            v7: number[],
            v8: number[]) {
            if (this.length() != 64) {
                throw "Matrix is not 8x8. You need to set matrix to 64 NeoPixels. Please check your initialization!"
            }
            this.setMatrixWidth(8)
            let rows = [v1, v2, v3, v4, v5, v6, v7, v8]
            rows = this.adjustMatrixForDirection(rows)
            this.setBufferWithMatrix(rows)
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._format === neopixelExtended.Format.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }

        private setAllW(white: number) {
            if (this._format !== neopixelExtended.Format.RGBW)
                return;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 4;
                buf[ledoffset + 3] = white;
            }
        }

        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._format === neopixelExtended.Format.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }
        
        private setPixelW(pixeloffset: number, white: number): void {
            if (this._format !== neopixelExtended.Format.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 4;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
        }
    }

    // ---- END OF STRIP ---- //

    /**
     * RGB Color selection from a range
     * of 64 colors.
     * @param color color
     */
    //% blockId="colorNumberPickerLarge" 
    //% block="%value"
    //% group="Colors"
    //% weight=1
    //% shim=TD_ID colorSecondary="#FFFFFF"
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.defl='0xff0000'
    //% value.fieldOptions.colours='["#FFFFFF", "#FFF1E6", "#FFE4B5", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#E60026", "#FFB6C1", "#FF69C1", "#FF1493", "#DA70D6", "#BA55D3", "#8A2BE2", "#4B0082", "#2E0854", "#E6E6FA", "#B0C4DE", "#87CEEB", "#00BFFF", "#1E90FF", "#0000CD", "#191970", "#000080", "#E0FFFF", "#AFEEEE", "#40E0D0", "#00CED1", "#008B8B", "#2E8B57", "#006400", "#003300", "#F0FFF0", "#ADFF2F", "#7FFF00", "#32CD32", "#228B22", "#9ACD32", "#6B8E23", "#556B2F", "#FFFFE0", "#FFFACD", "#FFEFD5", "#FFDAB9", "#D2B48C", "#A0522D", "#8B4513", "#1A1A1A", "#FAFAFA", "#E0E0E0", "#B8B8B8", "#909090", "#686868", "#404040", "#202020", "#000000", "#000000", "#0000FF", "#00FF00", "#00FFFF", "#FF0000", "#FF00FF", "#FFFF00", "#FFFFFF"]'
    //% value.fieldOptions.columns=8 value.fieldOptions.className='rgbColorPicker'
    export function colorNumberPicker(value: number) {
        return value;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=1
    //% blockId="neopixel_rgb" 
    //% block="red %red|green %green|blue %blue"
    //% group="Colors"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=neopixelHSL 
    //% block="hue %h|saturation %s|luminosity %l"
    //% advanced=true
    //% group="Colors"
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    //% block="%v1 %v2 %v3 %v4 %v5 %v6 %v7 %v8"
    //% blockId="rowOf8"
    //% v1.shadow="colorNumberPickerLarge"
    //% v2.shadow="colorNumberPickerLarge"
    //% v3.shadow="colorNumberPickerLarge"
    //% v4.shadow="colorNumberPickerLarge"
    //% v5.shadow="colorNumberPickerLarge"
    //% v6.shadow="colorNumberPickerLarge"
    //% v7.shadow="colorNumberPickerLarge"
    //% v8.shadow="colorNumberPickerLarge"
    //% inlineInputMode=inline
    //% group="Matrix"
    //% weight=64
    export function rowOf8(v1: number,
        v2: number,
        v3: number,
        v4: number,
        v5: number,
        v6: number,
        v7: number,
        v8: number): number[] {
        return [v1, v2, v3, v4, v5, v6, v7, v8]
    }

    //% block="%v1 %v2 %v3 %v4 %v5"
    //% blockId="rowOf5"
    //% v1.shadow="colorNumberPickerLarge"
    //% v2.shadow="colorNumberPickerLarge"
    //% v3.shadow="colorNumberPickerLarge"
    //% v4.shadow="colorNumberPickerLarge"
    //% v5.shadow="colorNumberPickerLarge"
    //% inlineInputMode=inline
    //% group="Matrix"
    //% weight=24
    export function rowOf5(v1: number,
        v2: number,
        v3: number,
        v4: number,
        v5: number): number[] {
        return [v1, v2, v3, v4, v5]
    }

    /**
     * Combines/packs three numbers into one 
     * 24 bit RGB number.
     * 
     * First 8 bit are red,
     * second 8 bits are green and
     * third 8 bits are blue
     * 
     * @param r - red part (0-255)
     * @param g - green part (0-255)
     * @param b - blue part (0-255)
     */
    function packRGB(r: number, g: number, b: number): number {
        return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }

    /**
     * Extracts/unpacks the red part from 
     * a number representing an rgb number.
     * 
     * @param rgb : rgb number
     */
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }

    /**
     * Extracts/unpacks the green part from
     * a number representing an rgb number.
     *
     * @param rgb : rgb number
     */
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }

    /**
     * Extracts/unpacks the blue part from
     * a number representing an rgb number.
     *
     * @param rgb : rgb number
     */
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
}
