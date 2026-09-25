import { useCallback, useEffect, useRef, useState } from 'react'
import mp4box, { type ISOFile, type MP4ArrayBuffer, type MP4Sample } from 'mp4box'

type MP4BoxApi = {
  createFile: () => ISOFile
  DataStream: typeof import('mp4box').DataStream
}

function mp4boxLib(): MP4BoxApi {
  const mod = mp4box as unknown as Partial<MP4BoxApi> & { default?: Partial<MP4BoxApi> }
  const root = mod.createFile ? mod : mod.default
  if (!root?.createFile || !root.DataStream) {
    throw new Error('mp4box exports missing createFile/DataStream')
  }
  return { createFile: root.createFile, DataStream: root.DataStream }
}

const { createFile, DataStream } = mp4boxLib()

const LERP_TAU = 8
const SNAP = 0.002
const LRU_MAX = 24
const LEAD = 24
const WATCHDOG = 60_000

export type FrameBankEntry = { ts: number; blob: Blob }

type VideoScrubState = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  scrollProgress: number
  canvasLive: boolean
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function codecDescription(file: ISOFile, trackId: number): Uint8Array | undefined {
  const trak = file.getTrackById(trackId)
  const entries = trak?.mdia?.minf?.stbl?.stsd?.entries ?? []
  for (const entry of entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C
    if (!box) continue
    const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN)
    box.write(stream)
    return new Uint8Array(stream.buffer, 8)
  }
  return undefined
}

function nearestIndex(tSec: number, bank: FrameBankEntry[]) {
  if (bank.length === 0) return 0
  const t = tSec * 1e6
  let lo = 0
  let hi = bank.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (bank[mid].ts < t) lo = mid + 1
    else hi = mid - 1
  }
  if (lo <= 0) return 0
  if (lo >= bank.length) return bank.length - 1
  return t - bank[lo - 1].ts <= bank[lo].ts - t ? lo - 1 : lo
}

async function frameToBlob(frame: VideoFrame): Promise<Blob> {
  const w = frame.displayWidth
  const h = frame.displayHeight
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2d context unavailable')
    ctx.drawImage(frame, 0, 0)
    return canvas.convertToBlob({ type: 'image/webp', quality: 0.82 })
  }
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  ctx.drawImage(frame, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/webp',
      0.82,
    )
  })
}

export function useVideoScrub(videoSrc: string): VideoScrubState {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [canvasLive, setCanvasLive] = useState(false)

  const bankRef = useRef<FrameBankEntry[]>([])
  const lruRef = useRef<Map<number, ImageBitmap | null>>(new Map())
  const currentRef = useRef(0)
  const targetRef = useRef(0)
  const readyRef = useRef(false)
  const revertedRef = useRef(false)
  const paintedRef = useRef(false)
  const buildingRef = useRef(false)
  const durRef = useRef(0)
  const spanRef = useRef(1)
  const seekingRef = useRef(false)
  const lastPRef = useRef(-1)

  const getProgress = useCallback(() => {
    const span = spanRef.current
    if (span <= 0) return 0
    return Math.min(1, Math.max(0, window.scrollY / span))
  }, [])

  const recomputeSpan = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    spanRef.current = el.offsetHeight - window.innerHeight
  }, [])

  const revert = useCallback(() => {
    revertedRef.current = true
    readyRef.current = false
    setCanvasLive(false)
  }, [])

  const warmLRU = useCallback(async (i: number) => {
    const bank = bankRef.current
    const lru = lruRef.current
    for (let k = i - 1; k <= i + 2; k++) {
      if (k < 0 || k >= bank.length) continue
      if (lru.has(k)) {
        const existing = lru.get(k) ?? null
        lru.delete(k)
        lru.set(k, existing)
        continue
      }
      lru.set(k, null)
      try {
        const bmp = await createImageBitmap(bank[k].blob)
        if (!lru.has(k)) {
          bmp.close()
          continue
        }
        lru.set(k, bmp)
        while (lru.size > LRU_MAX) {
          const oldest = lru.keys().next().value
          if (oldest === undefined) break
          const prev = lru.get(oldest)
          prev?.close()
          lru.delete(oldest)
        }
      } catch {
        lru.delete(k)
      }
    }
  }, [])

  const drawNearest = useCallback(
    (tSec: number) => {
      const canvas = canvasRef.current
      const bank = bankRef.current
      if (!canvas || bank.length === 0) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const i = nearestIndex(tSec, bank)
      const bmp = lruRef.current.get(i)
      if (bmp) {
        ctx.drawImage(bmp, 0, 0, 1920, 1080)
        if (!paintedRef.current) {
          paintedRef.current = true
          setCanvasLive(true)
        }
      }
      void warmLRU(i)
    },
    [warmLRU],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        durRef.current = video.duration
      }
    }
    const onSeeking = () => {
      seekingRef.current = true
    }
    const onSeeked = () => {
      seekingRef.current = false
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('durationchange', onMeta)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('seeked', onSeeked)
    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('durationchange', onMeta)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [])

  useEffect(() => {
    recomputeSpan()
    window.addEventListener('resize', recomputeSpan)
    window.addEventListener('orientationchange', recomputeSpan)
    return () => {
      window.removeEventListener('resize', recomputeSpan)
      window.removeEventListener('orientationchange', recomputeSpan)
    }
  }, [recomputeSpan])

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const p = getProgress()
      if (Math.abs(p - lastPRef.current) > 0.0002) {
        lastPRef.current = p
        setScrollProgress(p)
      }

      const dur = durRef.current
      if (dur > 0) {
        targetRef.current = p * dur
        if (prefersReducedMotion()) {
          currentRef.current = targetRef.current
        } else {
          currentRef.current +=
            (targetRef.current - currentRef.current) * (1 - Math.exp(-dt * LERP_TAU))
          if (Math.abs(targetRef.current - currentRef.current) < SNAP) {
            currentRef.current = targetRef.current
          }
        }

        if (readyRef.current && !revertedRef.current) {
          drawNearest(currentRef.current)
        } else {
          const video = videoRef.current
          if (
            video &&
            !seekingRef.current &&
            Math.abs(video.currentTime - currentRef.current) > 0.01
          ) {
            video.currentTime = currentRef.current
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [drawNearest, getProgress])

  useEffect(() => {
    let cancelled = false
    let decoder: VideoDecoder | null = null
    let mp4: ISOFile | null = null
    let watchdog: number | undefined

    const cleanupDecoder = () => {
      try {
        decoder?.close()
      } catch {
        /* already closed */
      }
      decoder = null
    }

    const buildBank = async () => {
      if (cancelled) return
      if (prefersReducedMotion() || typeof VideoDecoder === 'undefined') return

      buildingRef.current = true
      watchdog = window.setTimeout(() => {
        if (!readyRef.current) revert()
      }, WATCHDOG)

      try {
        const res = await fetch(videoSrc)
        if (!res.ok) throw new Error(`fetch ${res.status}`)
        const buf = (await res.arrayBuffer()) as MP4ArrayBuffer
        if (cancelled) return
        buf.fileStart = 0

        await new Promise<void>((resolve, reject) => {
          mp4 = createFile()
          const samples: MP4Sample[] = []
          let trackId = 0
          let codec = ''
          let codedWidth = 0
          let codedHeight = 0
          let timescale = 1
          let description: Uint8Array | undefined
          let extracted = 0
          let expected = 0
          let decodeStarted = false

          mp4.onError = (_module, message) => reject(new Error(message))

          mp4.onReady = (info) => {
            const track = info.videoTracks[0]
            if (!track || !mp4) {
              reject(new Error('no video track'))
              return
            }
            trackId = track.id
            codec = track.codec
            codedWidth = track.track_width
            codedHeight = track.track_height
            timescale = track.timescale || info.timescale || 1
            expected = track.nb_samples
            try {
              description = codecDescription(mp4, track.id)
            } catch (err) {
              reject(err instanceof Error ? err : new Error('codec description failed'))
              return
            }
            mp4.setExtractionOptions(track.id, null, { nbSamples: 10000 })
            mp4.start()
          }

          mp4.onSamples = (id, _user, chunk) => {
            if (id !== trackId) return
            samples.push(...chunk)
            extracted += chunk.length
            if (expected > 0 && extracted >= expected) {
              void decodeAll()
            }
          }

          const decodeAll = async (preferSoftware = false) => {
            if (cancelled) {
              resolve()
              return
            }
            if (decodeStarted && !preferSoftware) return
            decodeStarted = true

            cleanupDecoder()

            let decoded = 0
            let encoded = 0
            let cursor = 0
            const localBank: FrameBankEntry[] = []
            let settled = false

            const finish = (err?: Error) => {
              if (settled) return
              settled = true
              if (err) reject(err)
              else resolve()
            }

            const pump = () => {
              if (!decoder || decoder.state !== 'configured') return
              while (cursor < samples.length && decoded - encoded < LEAD) {
                const sample = samples[cursor++]
                const data =
                  sample.data instanceof Uint8Array ? sample.data : new Uint8Array(sample.data)
                const chunk = new EncodedVideoChunk({
                  type: sample.is_sync ? 'key' : 'delta',
                  timestamp: (sample.cts * 1_000_000) / (sample.timescale || timescale),
                  duration: (sample.duration * 1_000_000) / (sample.timescale || timescale),
                  data,
                })
                try {
                  decoder.decode(chunk)
                  decoded += 1
                } catch (err) {
                  finish(err instanceof Error ? err : new Error('decode failed'))
                  return
                }
              }
              if (cursor >= samples.length && decoder.state === 'configured') {
                try {
                  decoder.flush()
                } catch {
                  /* ignore */
                }
              }
            }

            const output = (frame: VideoFrame) => {
              const ts = frame.timestamp
              void frameToBlob(frame)
                .catch(() => null)
                .then((blob) => {
                  frame.close()
                  encoded += 1
                  if (blob) localBank.push({ ts, blob })
                  pump()
                  if (encoded >= decoded && cursor >= samples.length && !cancelled) {
                    localBank.sort((a, b) => a.ts - b.ts)
                    bankRef.current = localBank
                    readyRef.current = localBank.length > 0
                    if (!readyRef.current) revert()
                    finish()
                  }
                })
            }

            const config: VideoDecoderConfig = {
              codec,
              codedWidth,
              codedHeight,
              ...(description ? { description } : {}),
              ...(preferSoftware ? { hardwareAcceleration: 'prefer-software' as const } : {}),
            }

            decoder = new VideoDecoder({
              output,
              error: (err) => {
                if (!preferSoftware) {
                  void decodeAll(true)
                  return
                }
                finish(err instanceof Error ? err : new Error('VideoDecoder failed'))
              },
            })

            try {
              decoder.configure(config)
            } catch (err) {
              if (!preferSoftware) {
                void decodeAll(true)
                return
              }
              finish(err instanceof Error ? err : new Error('configure failed'))
              return
            }

            pump()
          }

          mp4.appendBuffer(buf)
          mp4.flush()

          window.setTimeout(() => {
            if (!cancelled && samples.length > 0 && !readyRef.current && !revertedRef.current) {
              void decodeAll()
            } else if (!cancelled && samples.length === 0) {
              reject(new Error('no samples'))
            }
          }, 1500)
        })
      } catch (err) {
        console.warn('[useVideoScrub] frame bank failed, seeking fallback', err)
        if (!cancelled) revert()
      } finally {
        if (watchdog) window.clearTimeout(watchdog)
        buildingRef.current = false
        cleanupDecoder()
        try {
          mp4?.stop()
        } catch {
          /* ignore */
        }
      }
    }

    const onLoad = () => {
      void buildBank()
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad)

    return () => {
      cancelled = true
      window.removeEventListener('load', onLoad)
      if (watchdog) window.clearTimeout(watchdog)
      cleanupDecoder()
      for (const bmp of lruRef.current.values()) bmp?.close()
      lruRef.current.clear()
    }
  }, [revert, videoSrc])

  return { videoRef, canvasRef, containerRef, scrollProgress, canvasLive }
}
