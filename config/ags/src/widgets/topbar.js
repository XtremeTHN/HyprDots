import Widget from 'resource:///com/github/Aylur/ags/widget.js';

const TopBarLeft = () => Widget.Box({
  children: [

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
