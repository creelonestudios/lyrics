import * as lyrics from "./main.mjs"

let list = await lyrics.load({ path: "./lyrics" })

console.dir(list, {depth: 1})
