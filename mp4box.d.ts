declare module 'mp4box' {
  export interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number
  }

  export interface MP4VideoTrack {
    id: number
    codec: string
    track_width: number
    track_height: number
    timescale: number
    duration: number
    nb_samples: number
    bitrate: number
  }

  export interface MP4Info {
    duration: number
    timescale: number
    videoTracks: MP4VideoTrack[]
  }

  export interface MP4Sample {
    number: number
    track_id: number
    timescale: number
    description_index: number
    description: unknown
    dts: number
    cts: number
    duration: number
    size: number
    is_sync: boolean
    data: ArrayBuffer | Uint8Array
  }

  export interface MP4BoxBuffer {
    buffer: ArrayBuffer
  }

  export interface MP4CodecBox {
    write: (stream: DataStream) => void
  }

  export interface MP4SampleEntry {
    avcC?: MP4CodecBox
    hvcC?: MP4CodecBox
    vpcC?: MP4CodecBox
    av1C?: MP4CodecBox
  }

  export interface MP4Track {
    mdia?: {
      minf?: {
        stbl?: {
          stsd?: {
            entries: MP4SampleEntry[]
          }
        }
      }
    }
  }

  export class DataStream {
    static BIG_ENDIAN: boolean
    buffer: ArrayBuffer
    constructor(buffer?: ArrayBuffer | undefined, byteOffset?: number, endianness?: boolean)
  }

  export interface ISOFile {
    onReady: ((info: MP4Info) => void) | null
    onError: ((module: string, message: string) => void) | null
    onSamples: ((id: number, user: unknown, samples: MP4Sample[]) => void) | null
    appendBuffer: (data: MP4ArrayBuffer) => number | void
    flush: () => void
    start: () => void
    stop: () => void
    setExtractionOptions: (
      trackId: number,
      user: unknown,
      options: { nbSamples?: number; rapAlignment?: boolean },
    ) => void
    getTrackById: (id: number) => MP4Track | undefined
  }

  export function createFile(): ISOFile

  const MP4Box: {
    createFile: typeof createFile
    DataStream: typeof DataStream
  }

  export default MP4Box
}
