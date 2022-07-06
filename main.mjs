import fs from "fs/promises"

export async function load(options) {

	let files = await fs.readdir(options.path || "./lyrics/")
	let list = []

	for(let f of files) {
		if(!f.endsWith(".lyrics")) {
			if(!options.silent) console.error(`load ${f}:`, "Lyrics files have to end with .lyrics")
			continue
		}
		let data = ""
		try {
			data = await fs.readFile("./lyrics/" + f, { encoding: "utf-8" })
		} catch(e) {
			if(!options.silent) console.error(`load ${f}:`, e)
			continue
		}
		if(data) {
			try {
				let l = new LyricsFile(data)
				list.push(l)
			} catch(e) {
				if(!options.silent) console.error(`load ${f}:`, e)
			}
		}
	}

	return list

}

export class LyricsFile {

	#length
	constructor(data) {

		this.author = undefined
		this.title = undefined
		this.features = []
		this.release = undefined
		this.url = ""
		this.credit = []
		this.alias = { author: [], title: [] }
		this.options = {}
		this.lines = []
		this.#length = undefined

		let lines = data.split(/\r\n|\r|\n/)

		for(let i in lines) {

			let line = lines[i]
			if(line.startsWith("#") || line.length == 0) continue

			if(line.startsWith("@")) {

				line = line.substr(1)
				let words = line.split(" ")

				if(words.length < 2) throw new LyricsSyntaxError(i, `incomplete meta tag`) + ""

				let k = words[0]
				words.shift()
				let v = words.join(" ")

				if(k == "author") this.author = v
				else if(k == "title") this.title = v
				else if(k == "release") this.release = v
				else if(k == "feat") this.features.push(v)
				else if(k == "url") this.url = v
				else if(k == "credit") this.credit = this.credit.concat(words)
				else if(k == "alias") {
					let k = words[0]
					words.shift()
					let v = words.join(" ")
					if(k == "author") this.alias.author.push(v)
					else if(k == "title") this.alias.title.push(v)
					else {
						throw new LyricsSyntaxError(i, `invalid alias '${k}'`) + ""
					}
				}
				else if(k == "option") {
					let k = words[0]
					words.shift()
					let v = words.join(" ")
					this.options[k] = v
				} else {
					throw new LyricsSyntaxError(i, `unknown meta tag '${k}'`) + ""
				}
				continue

			}

			let words = line.split(" ")
			let timestamp = this.options.timestamps == "auto" ? i * (parseFloat(this.options.delay) || 4000) : parseInt(words[0]) * 1000
			if(this.options.timestamps != "auto") words.shift()
			line = words.join(" ")

			if(!isNaN(timestamp) && timestamp >= 0) {
				this.lines.push({t: timestamp, s: line})
			} else {
				//console.log(this)
				throw new LyricsSyntaxError(i, `timestamp must be a non-negative integer`) + ""
			}

			if(line.length == 0) {
				throw new LyricsSyntaxError(i, `line must not be empty`) + ""
			}

		}

		if(!this.author || !this.title || !this.release || !this.url) {
			throw new LyricsFormatError(`missing meta tags: author, title and release are required`) + ""
		}

	}

	get length() {
		this.options.length || this.#length
	}

	set length(len) {
		if(len) this.#length = len
	}

}

class LyricsSyntaxError {
	constructor(line, reason, cause) {
		this.line   = line
		this.reason = reason
		this.cause  = cause
	}

	toString() {
		let s = `LyricsSyntaxError in line ${this.line}: ${this.reason}`
		if(this.cause) {
			s += "\nCaused by " + this.cause
		}
		return s
	}
}

class LyricsFormatError {
	constructor(reason, cause) {
		this.reason = reason
		this.cause  = cause
	}

	toString() {
		let s = `LyricsFormatError: ${this.reason}`
		if(this.cause) {
			s += "\nCaused by " + this.cause
		}
		return s
	}
}
