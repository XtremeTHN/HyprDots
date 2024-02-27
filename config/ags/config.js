import App from 'resource:///com/github/Aylur/ags/app.js';
import TopBarWindow from './src/lib/topbar.js';
import QuickSettingsWindow from './src/lib/quicksettings.js';
import { NotificationPopupWindow } from './src/lib/notifications.js';
import { IncrementVolume, DecreaseVolume } from './src/lib/audio.js';
import QRScanner from './src/lib/services/qr.js';

import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

globalThis['IncrementVolume'] = IncrementVolume
globalThis['DecreaseVolume'] = DecreaseVolume

const css_path = `${App.configDir}/src/styles/style.css`

const CompileScss = () => {
  Utils.exec(`sass ${App.configDir}/src/styles/main.scss ${css_path}`)
}

CompileScss()

Utils.monitorFile(`${App.configDir}/src/styles/style.css`, (file, event) => {
  console.log("Reloading css...")
  App.applyCss(css_path)
})

/*QRScanner.start()
QRScanner.connect("qrcode-decoded", (self, value) => {
  console.warn(value)
})*/
// QRScanner.stop()

export default {
  style: `${App.configDir}/src/styles/style.css`,
  windows: [
    QuickSettingsWindow(),
    NotificationPopupWindow
  ],
}
