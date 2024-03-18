import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Sway from '../lib/sway.js';

const TopBarLeft = () => Widget.Box({
  children: [
    Widget.Label({
      label: Sway.active.client.bind('name')
    })
  ]
})

export default () => Widget.Window({
  name: "topbar",
  anchor: ['top', 'left', 'right'],
  exclusivity: "exclusive",
  child: Widget.CenterBox({
    startWidget: TopBarLeft()
  })
})
