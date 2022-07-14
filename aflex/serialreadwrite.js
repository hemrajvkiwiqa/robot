input.onButtonPressed(Button.A, function () {
    serial.writeString("CMD+OK")
    getheartbit()
})
serial.onDataReceived(serial.delimiters(Delimiters.CarriageReturn), function () {
    cmdMsg = serial.readUntil(serial.delimiters(Delimiters.CarriageReturn))
    if (cmdMsg.includes("CMD+") == false) {
        return;
    }
    cmd = cmdMsg.split("+")[1]
    switch (cmd) {
        case "ON":
            keeplogon = 1;
            break;
        case "OFF":
            keeplogon = 0;
            break;
        case "TEMP":
            if(!fixValue)
                cmdResp = input.temperature().toString();
            else
                cmdResp = tempValue;
            break;
        case "ACCEL":
            if (!fixValue)
                cmdResp = input.acceleration(Dimension.Strength).toString();
            else
                cmdResp = accelValue;
            break;
        case "X":
            if (!fixValue)
                cmdResp = input.acceleration(Dimension.X).toString();
            else
                cmdResp = xVal;
            break;
        case "Y":
            if (!fixValue)
                cmdResp = input.acceleration(Dimension.Y).toString();
            else
                cmdResp = yVal;
            break;
        case "Z":
            if (!fixValue)
                cmdResp = input.acceleration(Dimension.Z).toString();
            else
                cmdResp = zVal;
            break;
        case "CURR":
            if (!fixValue)
                cmdResp = input.temperature().toString(); //ToDo
            else
                cmdResp = currVal;
            break;
        case "HRTBT":
            if (!fixValue) {
                cmdResp = hrtbtActVal;
            }
            else
                cmdResp = hrtbtVal;
            break;
        case "SET":
            cmdResp = fixCmd  = cmdMsg.split("+")[2]
            
            switch (fixCmd) {
                case "ON":
                    fixValue = 1;
                    break;
                case "OFF":
                    fixValue = 0;
                    break;
                case "TEMP":
                    tempValue = cmdMsg.split("+")[3];
                    break;
                case "ACCEL":
                    accelValue = cmdMsg.split("+")[3];
                    break;
                case "X":
                    xVal = cmdMsg.split("+")[3];
                    break;
                case "Y":
                    yVal = cmdMsg.split("+")[3];
                    break;
                case "Z":
                    zVal = cmdMsg.split("+")[3];
                    break;
                case "CURR":
                    currVal = cmdMsg.split("+")[3];
                    break;
                case "HRTBT":
                    hrtbtVal = cmdMsg.split("+")[3];
                    break;
            }

    }
// basic.showString(serial.readUntil(serial.delimiters(Delimiters.CarriageReturn)))
    basic.showString("" + (cmd))
    serial.writeString("CMDRESP+" + cmd + "=" + cmdResp + "+OK")
})
let cmdMsg = ""
let cmdResp = ""
let cmd = ""
let fixCmd = ""
let keeplogon = 0
let fixValue = 0
let tempValue = ""
let accelValue = ""
let xVal = ""
let yVal = ""
let zVal = ""
let currVal =""
let hrtbtVal = ""
let hrtbtActVal = ""
declare var require: any
basic.forever(function () {
    if (keeplogon == 1) {
        if (fixValue == 0) {
            serial.writeString("LOG+" + "TEMP=" + input.temperature() + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "ACCEL=" + input.acceleration(Dimension.Strength) + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "X=" + input.acceleration(Dimension.X) + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "Y=" + input.acceleration(Dimension.Y) + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "Z=" + input.acceleration(Dimension.Z) + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "CURR=" + input.acceleration(Dimension.Z) + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "HRTBT=" + hrtbtVal + "+OK")
            basic.pause(100)
        } else {
            serial.writeString("LOG+" + "TEMP=" + tempValue + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "ACCEL=" + accelValue + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "X=" + xVal + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "Y=" + yVal + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "Z=" + zVal + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "CURR=" + currVal + "+OK")
            basic.pause(100)
            serial.writeString("LOG+" + "HRTBT=" + hrtbtVal + "+OK")
            basic.pause(100)
        }
    }
})

function getheartbit() {
    // Configure constants and variables before main loop:
    // Timing settings
    let SECONDS_PER_MINUTE = 60
    let MILLISECONDS_PER_SECOND = 1000
    let MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND

    // Sampling rate & interval settings(ms)
    // Caution:
    // Sending output too frequently may exceed bandwidth per second ...
    //  - we can send through REPL between micro: bit and PC / host device.
    // - Effect may show as backlog / lag / staggering in REPL output or Plotter graph.
    let SAMPLING_RATE = 25  //(Hz) typically 25 - 100 samples per second
    let SAMPLING_INTERVAL = (MILLISECONDS_PER_SECOND / SAMPLING_RATE)

    let threshold_on = 550
    let threshold_off = 500
    let beat = 0

    //  BPM(beats per minute) calculation using moving average buffer.
    let bpm = 0
    let bpm_avg = 0
    // used buffer to calculate average BPM over buffer's values
    let beats_buffer = 0
    let BEATS_BUFFER_SIZE = 15
    let samples_between_beats = 0
    // track time between start and end of a single beat.
    let current_time = input.runningTime()
    let start_time = current_time

    let signal = 0

    while (1) {
        signal = pins.analogReadPin(AnalogPin.P1);
        serial.writeString("signal=" + signal + "+OK")
        //increment count of samples_between_beats
        samples_between_beats += 1;
        //calculate latest BPM(beats per minute):
        //BPM = (ms in one minute / time passed since last beat)
        if ( (beat == 0) && (signal > threshold_on)) {
            beat = 1
        }  

        if ( (beat == 1) && (signal < threshold_off)) {
            beat = 0
            for (let i = 0; i < BEATS_BUFFER_SIZE; i++) {
                bpm = MILLISECONDS_PER_MINUTE / (input.runningTime() - start_time)
                beats_buffer += bpm
            }

            //  calculate moving average of bpm = sum(bpm's) // count(bpm's)
            bpm_avg = beats_buffer / BEATS_BUFFER_SIZE
            hrtbtActVal = bpm_avg.toString()
            serial.writeString("HRTBT=" + hrtbtActVal + "+OK")

            //  reset count of samples and time between beats
            samples_between_beats = 0
            start_time = input.runningTime()
        }

        //  output signal value to REPL
        //  Scaling: x2 then subtract 1000 to use full y - range of Plotter graph.
        signal = 2 * signal - 1000
        basic.pause(SAMPLING_INTERVAL)
    }
}
