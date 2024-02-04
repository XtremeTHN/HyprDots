export class Logger {
    #color="\u001b[34m"
    #reset="\x1b[0m"
    #name="root"
    #subtitle
    constructor(name, subtitle) {
        this.#name = name
        this.#subtitle = subtitle
    }

    log(msg) {
        console.log(`${this.#name} [${this.#subtitle}]: ${msg}`)
    }

    warn(msg) {
        console.warn(`${this.#name} [${this.#subtitle}]: ${msg}`)
    }

    error(msg) {
        console.error(`${this.#name} [${this.#subtitle}]: ${msg}`)
    }
}