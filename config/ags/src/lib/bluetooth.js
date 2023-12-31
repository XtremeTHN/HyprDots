import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";

const _get_ico = () => Bluetooth.enabled === true ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic" 
const _bluetooth_ico = Variable(_get_ico())
Bluetooth.connect("notify::enable", (_) => {
  _bluetooth_ico.value = _get_ico()
})

export const BluetoothIcon = () => Widget.Icon({
  size: 16,
  connections: [
    [_bluetooth_ico, self => {
      self.icon = _bluetooth_ico.value
    }]
  ]
})
