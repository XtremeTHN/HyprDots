import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

export const BatteryIcon = () => Widget.Icon({
    icon: Battery.bind('icon_name'),
    visible: Battery.bind('available'),
    tooltip_text: Battery.bind('percent').transform(p => `${p}%`)
})