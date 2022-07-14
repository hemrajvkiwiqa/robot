bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.No)
})
input.onButtonPressed(Button.A, function () {
    bluetooth.uartWriteLine("hello")
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    // basic.showString(serial.readUntil(serial.delimiters(Delimiters.CarriageReturn)))
    basic.showString(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
})
let cmdResp = ""
let cmd = ""
bluetooth.startUartService()
