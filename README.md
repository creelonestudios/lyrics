# lyrics
###### lyrics file format and loader

Lyrics files used to store lyrics with timestamps and general song information.

It is used by [SongGuesser](https://github.com/creelonestudios/songguesser).
This means pull requested or suggested lyrics are added to SongGuesser, if approved.

## Import
Note that it is currently not on npm, so you'll have to clone the repo
### ES2015 Module
```js
import * as lyrics from "/path/to/lyrics/main.mjs"
```
### Common JS
```js
const lyrics = require("/path/to/lyrics/main.mjs")
```

## Load files
### Load all files from a directory
```js
let list = await lyrics.load({ path: "./path", silent: false }) // e.g. "./lyrics/"
```
`silent: true` means stay quiet about any format or syntax errors.
`list` will be an array of LyricsFiles, like:
```js
LyricsFile {
  author: 'Village People',
  title: 'YMCA',
  features: [],
  release: '1978',
  url: 'https://www.youtube.com/watch?v=CS9OO0S5w2k',
  credit: [],
  alias: { title: [], author: [] },
  options: { length: "217" },
  lines: [
    { t: 12000, s: "Young man, there's no need to feel down" }, //...
  ]
}
```
### Single file
```js
// you have to load the file via fs yourself
// suppose data are the file contents returned from fs.readFile()
// obviously, you can also load the data from somewhere else (e.g. cdn or db)

let info = new lyrics.LyricsFile(data)
```

<br>

---

<br>

## File Format
The format consists of two main parts: meta data and lyrics.
### meta data
Meta data is usally placed at the beginning of the file.
Meta tags begin with `@` and end with a new line (`CRLF`, `LF` or `CR`)
```
@metatag value
```
metatag can be one of `author`, `title`, `release`, `feat`, `alias`, or `option`.
value can be anything, including spaces.
`author`, `title`, and `release` are required, whilst the others are optional.

#### Options
`@option` can be used to store customized key-value pairs.
```
@option key value

@option length 50
```
length is special as in it used for `lyricsfile.length`, which can be overwritten without affecting `lyricsfile.options.length`

#### Features
```
@feat Shawn Mendes
@feat Camila Cabello
```
Features are special because they are an array, so defining the meta tag multiple times won't override it.

#### Aliases
```
@title Never Gonna Give You Up
@alias title rickroll
@alias author that guy from the nineties
```
Just like features, aliases are arrays, so defining `alias title <value>` multiple times won't override it.

It can be used as a short form or alternative name.
In [SongGuesser](https://github.com/creelonestudios/songguesser), they are used as alternatives for guessing author or title.

#### Credit
`@credit` is used to keep track of who wrote which lyrics file.

When submitting a lyrics file, you have to provide your name or nickname.
When submitting more than one, you have to be consistent, inconsistent naming will be rejected.

Just like features, credit is an array, so you can keep track of who edited the file.

### lyrics
Lyrics are just the song text with an integer timestamp (in seconds) in front, e.g.
```
42 I ain't the sharpest tool in the shed
```
Using the same timestamp for multiple lines is possible.

As for SongGuesser, keep in mind that it'll send the lyrics in order, so
```
100 It's hard to say that I'd rather stay awake when I'm asleep
125 'Cause everything is never as it seems (when I fall asleep)
113 Leave my door open just a crack
116 Please take me away from here
119 'Cause I feel like such an insomniac
```
will cause it to send "It's hard [...]" at after 100 seconds (1:40),
wait 25 seconds (until 2:05) and then spam the following lines.
This will cause your lyrics to be rejected (or at least we'll point it out and request changes)

### Examples
Examples can be found [here](https://github.com/creelonestudios/lyrics/tree/main/lyrics).
