export class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private musicNodes: OscillatorNode[] = []
  private musicPlaying = false
  private volume = 0.5

  constructor() {
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = this.volume
    this.masterGain.connect(this.ctx.destination)
    this.musicGain = this.ctx.createGain()
    this.musicGain.gain.value = 0.08
    this.musicGain.connect(this.masterGain)
  }

  isReady(): boolean {
    return this.ctx !== null && this.ctx.state === 'running'
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume
    }
  }

  private ensureResumed(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const sr = ctx.sampleRate
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buf
  }

  private sfxNode(
    config: {
      type?: OscillatorType
      freqStart?: number
      freqEnd?: number
      noise?: boolean
      noiseDuration?: number
      duration: number
      gainStart?: number
      gainEnd?: number
      filter?: { type: BiquadFilterType; freq: number; Q?: number }
      delay?: number
    },
    time: number,
  ): void {
    const ctx = this.ctx!
    const t = time + (config.delay ?? 0)
    const dur = config.duration
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(config.gainStart ?? 0.3, t)
    gainNode.gain.exponentialRampToValueAtTime(config.gainEnd ?? 0.001, t + dur)
    gainNode.connect(this.masterGain!)

    let output: AudioNode = gainNode

    if (config.filter) {
      const filter = ctx.createBiquadFilter()
      filter.type = config.filter.type
      filter.frequency.value = config.filter.freq
      if (config.filter.Q !== undefined) filter.Q.value = config.filter.Q
      filter.connect(gainNode)
      output = filter
    }

    if (config.noise) {
      const noiseDur = config.noiseDuration ?? dur
      const buf = this.createNoiseBuffer(ctx, noiseDur)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(output)
      src.start(t)
      src.stop(t + dur)
    }

    if (config.type) {
      const osc = ctx.createOscillator()
      osc.type = config.type
      osc.frequency.setValueAtTime(config.freqStart ?? 440, t)
      if (config.freqEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(config.freqEnd, 20),
          t + dur,
        )
      }
      osc.connect(output)
      osc.start(t)
      osc.stop(t + dur)
    }
  }

  playSound(name: string): void {
    this.ensureResumed()
    const ctx = this.ctx!
    if (!ctx) return
    const now = ctx.currentTime

    switch (name) {
      case 'attack':
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 800,
            freqEnd: 200,
            noise: true,
            noiseDuration: 0.05,
            duration: 0.1,
            gainStart: 0.35,
          },
          now,
        )
        break

      case 'hit':
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 300,
            freqEnd: 80,
            noise: true,
            noiseDuration: 0.04,
            duration: 0.08,
            gainStart: 0.4,
            filter: { type: 'lowpass', freq: 1000 },
          },
          now,
        )
        break

      case 'enemyHit':
        this.sfxNode(
          {
            type: 'sawtooth',
            freqStart: 600,
            freqEnd: 100,
            duration: 0.15,
            gainStart: 0.3,
            filter: { type: 'lowpass', freq: 2000 },
          },
          now,
        )
        break

      case 'death':
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 400,
            freqEnd: 40,
            noise: true,
            noiseDuration: 0.2,
            duration: 0.3,
            gainStart: 0.4,
          },
          now,
        )
        break

      case 'pickup': {
        const t = now
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 800,
            freqEnd: 1600,
            duration: 0.06,
            gainStart: 0.15,
          },
          t,
        )
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 1200,
            freqEnd: 2400,
            duration: 0.06,
            gainStart: 0.1,
            delay: 0.06,
          },
          t,
        )
        break
      }

      case 'levelup': {
        const t = now
        const notes = [523, 659, 784]
        notes.forEach((f, i) => {
          this.sfxNode(
            {
              type: 'sine',
              freqStart: f,
              freqEnd: f * 1.01,
              duration: 0.12,
              gainStart: 0.2,
              delay: i * 0.12,
            },
            t,
          )
        })
        break
      }

      case 'heal':
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 400,
            freqEnd: 1200,
            duration: 0.3,
            gainStart: 0.15,
          },
          now,
        )
        break

      case 'fireball':
        this.sfxNode(
          {
            type: 'sawtooth',
            freqStart: 600,
            freqEnd: 120,
            noise: true,
            noiseDuration: 0.15,
            duration: 0.2,
            gainStart: 0.3,
          },
          now,
        )
        break

      case 'explosion':
        this.sfxNode(
          {
            noise: true,
            noiseDuration: 0.3,
            duration: 0.4,
            gainStart: 0.5,
            filter: { type: 'lowpass', freq: 800, Q: 0.5 },
          },
          now,
        )
        break

      case 'coin': {
        const t = now
        this.sfxNode(
          {
            type: 'square',
            freqStart: 2000,
            freqEnd: 2000,
            duration: 0.03,
            gainStart: 0.2,
          },
          t,
        )
        this.sfxNode(
          {
            type: 'square',
            freqStart: 3000,
            freqEnd: 3000,
            duration: 0.03,
            gainStart: 0.15,
            delay: 0.05,
          },
          t,
        )
        break
      }

      case 'dialogue':
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 600,
            freqEnd: 600,
            duration: 0.02,
            gainStart: 0.06,
          },
          now,
        )
        break

      case 'gameover':
        this.sfxNode(
          {
            type: 'sine',
            freqStart: 400,
            freqEnd: 40,
            duration: 1.0,
            gainStart: 0.3,
          },
          now,
        )
        break

      case 'victory': {
        const t = now
        const notes = [523, 659, 784, 1047, 1319]
        notes.forEach((f, i) => {
          this.sfxNode(
            {
              type: 'sine',
              freqStart: f,
              freqEnd: f * 1.02,
              duration: 0.15,
              gainStart: 0.2,
              delay: i * 0.15,
            },
            t,
          )
        })
        break
      }

      case 'step':
        this.sfxNode(
          {
            noise: true,
            noiseDuration: 0.03,
            duration: 0.05,
            gainStart: 0.15,
            filter: { type: 'lowpass', freq: 600 },
          },
          now,
        )
        break

      case 'ambient':
        this.sfxNode(
          {
            noise: true,
            noiseDuration: 0.1,
            duration: 0.1,
            gainStart: 0.03,
            filter: { type: 'lowpass', freq: 200 },
          },
          now,
        )
        break
    }
  }

  playMusic(): void {
    this.ensureResumed()
    if (this.musicPlaying) return
    this.musicPlaying = true
    const ctx = this.ctx!
    if (!ctx) return

    const mg = this.musicGain!

    const bass = ctx.createOscillator()
    bass.type = 'sine'
    bass.frequency.value = 55
    const bassGain = ctx.createGain()
    bassGain.gain.value = 0.04
    bass.connect(bassGain)
    bassGain.connect(mg)
    bass.start()
    this.musicNodes.push(bass)

    const padLFO = ctx.createOscillator()
    padLFO.type = 'sine'
    padLFO.frequency.value = 0.3
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 300
    padLFO.connect(lfoGain)
    padLFO.start()

    const pad = ctx.createOscillator()
    pad.type = 'sine'
    pad.frequency.value = 220
    const padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = 400
    padFilter.Q.value = 2
    lfoGain.connect(padFilter.frequency)
    const padGain = ctx.createGain()
    padGain.gain.value = 0.03
    pad.connect(padFilter)
    padFilter.connect(padGain)
    padGain.connect(mg)
    pad.start()
    this.musicNodes.push(pad, padLFO)

    const pentatonic = [262, 294, 330, 392, 440, 524, 588, 660]
    const playMelody = () => {
      if (!this.musicPlaying) return
      const now = ctx.currentTime
      const noteIdx = Math.floor(Math.random() * pentatonic.length)
      const freq = pentatonic[noteIdx]
      const melOsc = ctx.createOscillator()
      melOsc.type = 'sine'
      melOsc.frequency.value = freq
      const melGain = ctx.createGain()
      melGain.gain.setValueAtTime(0, now)
      melGain.gain.linearRampToValueAtTime(0.02, now + 0.05)
      melGain.gain.linearRampToValueAtTime(0.02, now + 0.4)
      melGain.gain.linearRampToValueAtTime(0, now + 0.5)
      melOsc.connect(melGain)
      melGain.connect(mg)
      melOsc.start(now)
      melOsc.stop(now + 0.5)
      const h = setTimeout(playMelody, 4000)
      this.musicNodes.push(melOsc as any)
      const origStop = melOsc.stop.bind(melOsc)
      melOsc.stop = ((t: number) => {
        clearTimeout(h)
        return origStop(t)
      }) as typeof melOsc.stop
    }
    playMelody()
  }

  stopMusic(): void {
    this.musicPlaying = false
    for (const node of this.musicNodes) {
      try {
        node.stop()
        node.disconnect()
      } catch {
      }
    }
    this.musicNodes = []
  }
}