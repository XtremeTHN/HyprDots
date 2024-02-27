import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import Service from 'resource:///com/github/Aylur/ags/service.js'

class QRScanner extends Service {
  static {
    Service.register(
      this,
      {
        'qrcode-decoded': ['jsobject'],
      },
      {
        'decoded-value': ['jsobject','r']
      }
    )
  }

  #value = ""
  #proxy=Gio.DBusProxy.new_for_bus_sync(
    Gio.BusType.SESSION,
    Gio.DBusProxyFlags.NONE,
    null,
    "com.github.XtremeTHN.QRScanner",
    "/com/github/XtremeTHN/QRScanner",
    "com.github.XtremeTHN.QRScanner",
    null
  )

  get decoded_value() {
    return this.#value
  }

  constructor() {
    super();
    this.#proxy.connect("g-signal", this.#onDetectedQR)
  }

  #onDetectedQR=(dBusProxy, sender_name, signal_name, params) => {
    if (signal_name === "detected_qr") {
      print("llegue")
      this.#proxy.call("get_data", null, Gio.DBusCallFlags.NONE, -1, null, (src_obj, res, data) => {
          let finished = src_obj.call_finish(res)
          if (finished !== null) {
              this.#value = finished.get_child_value(0).get_string()[0]
              if (res !== "") {
                this.#value = JSON.parse(res)
                console.log(this.#value)
                this.emit('changed')
                this.notify("decoded-value")
        
                this.emit('qrcode-decoded', this.#value)
              }
          } else {
            console.error("something went wrong")
          }
      })
    }
  }
  
  start() {
    console.log("llegue tambien")
    this.#proxy.call_sync("start_scan", null, Gio.DBusCallFlags.NONE, -1, null)  
  }

  stop() {
    console.log("llegue tambien")

    this.#proxy.call_sync("stop_scan", null, Gio.DBusCallFlags.NONE, -1, null)
  }

  get_decoded_data(cb) {
      let response = this.#proxy.call_sync("get_data", null, Gio.DBusCallFlags.NONE, -1, null)
      return response.get_child_value(0).get_string()[0]
  }
}

export const qrscanner = new QRScanner()

export default qrscanner