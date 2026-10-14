const kicks: number[] = []
let clock: AudioContext | null = null

function markKick(time: number) {
  kicks.push(time)
  while (kicks.length > 16) kicks.shift()
}

export function beatLevel() {
  if (clock?.state !== "running") return 0
  const now = clock.currentTime
  const last = kicks.findLast((time) => time <= now)
  return last === undefined ? 0 : Math.exp(-(now - last) * 7)
}

const BASS_HZ = 150

export function createTrack(src: string) {
  const audio = new Audio(src)
  audio.loop = true
  const ctx = new AudioContext()
  clock = ctx

  const source = ctx.createMediaElementSource(audio)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.2
  const gain = ctx.createGain()
  gain.gain.value = 0
  source.connect(analyser)
  source.connect(gain).connect(ctx.destination)

  const bins = new Uint8Array(analyser.frequencyBinCount)
  const bassBins = Math.ceil(BASS_HZ / (ctx.sampleRate / analyser.fftSize))
  let average = 0
  let lastKick = 0
  let timer = 0
  let playing = false

  const listen = () => {
    analyser.getByteFrequencyData(bins)
    let energy = 0
    for (let i = 0; i < bassBins; i++) energy += bins[i]
    energy /= bassBins
    const now = ctx.currentTime
    if (energy > average * 1.25 && energy > 90 && now - lastKick > 0.28) {
      lastKick = now
      markKick(now)
    }
    average = average * 0.92 + energy * 0.08
  }

  const fadeTo = (value: number, seconds: number) => {
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(value, ctx.currentTime + seconds)
  }

  return {
    async play() {
      playing = true
      await ctx.resume()
      await audio.play()
      fadeTo(0.55, 1.2)
      window.clearInterval(timer)
      timer = window.setInterval(listen, 16)
    },
    pause() {
      playing = false
      fadeTo(0, 0.4)
      window.setTimeout(() => {
        if (playing) return
        window.clearInterval(timer)
        audio.pause()
      }, 450)
    },
  }
}
