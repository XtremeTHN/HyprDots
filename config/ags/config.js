import App from 'resource:///com/github/Aylur/ags/app.js';
import TopBarWindow from './src/lib/topbar.js'; 
import QuickSettingsWindow from './src/lib/quicksettings.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js';

globalThis['Bluetooth'] = Bluetooth

const css_path = `${App.configDir}/src/styles/style.css`

const CompileScss = () => {
  Utils.exec(`sass ${App.configDir}/src/styles/main.scss ${css_path}`)
}

CompileScss()

Utils.monitorFile(`${App.configDir}/src/styles/style.css`, (file, event) => {
  console.log("Reloading css...")
  App.applyCss(css_path)
})

export default {
  style: `${App.configDir}/src/styles/style.css`,
  windows: [
    TopBarWindow(),
    QuickSettingsWindow()
  ]
}
