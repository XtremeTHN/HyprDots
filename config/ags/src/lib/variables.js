import Variable from "resource:///com/github/Aylur/ags/variable.js";
import { exec } from "resource:///com/github/Aylur/ags/utils.js";
import GLib from 'gi://GLib';

export const Time = Variable("00:00", {
  poll: [1000, () => GLib.DateTime.new_now_local().format("%H:%M")]
})

export const User = exec("whoami");

export const Uptime = Variable("up 0 hours, 0 minutes", {
  poll: [
    1000, ["uptime", "-p"]
  ]
})
