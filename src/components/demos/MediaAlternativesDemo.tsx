import { FileText, Headphones, LoaderCircle, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white'
const CONTROL = `inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-lg px-2 text-sm font-semibold text-white hover:bg-white/15 ${FOCUS}`

type Mode = 'video' | 'audio'

interface Media {
  label: string
  title: string
  /** Offered in the pass version as "Read transcript". */
  transcript: readonly string[]
}

const MEDIA: Record<Mode, Media> = {
  video: {
    label: 'Video-only Content',
    title: 'Preparing Vada Pav',
    // A descriptive transcript of the video-only clip (what is seen), which also meets 1.2.1 and 1.2.3.
    transcript: [
      '[Video only, no soundtrack. Buns are prepared.]',
      'A person cuts the inside of a sliced bun, spreading green chutney on one half and dusting garlic powder on the other. Alongside a second bun, a potato patty is placed inside each before giving a quick thumbs-up.',
    ],
  },
  audio: {
    label: 'Audio-only content',
    title: 'The Delivery Guy',
    transcript: [
      '[SFX: Heavy rain falls. Thunder rumbles.]',
      '[SFX: Someone knocks on a door.]',
      'Woman (hesitantly): Who is it?',
      'Man (slowly, in a smooth and deep voice): Food delivery! A pizza and... a coke.',
      "Woman (confused): But I didn't order anything. You must be at the wrong house.",
      "Man: No... this is the right address. Please open the door ma'am.",
      '[SFX: Heavy banging on the door.]',
    ],
  },
}

const MODES = Object.keys(MEDIA) as Mode[]

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const VIDEO_SRC = '/bun-prep.mp4'
const DESCRIPTION_SRC = '/audiodescription-bun.m4a'
/** A short audio drama: sound effects and dialogue, no picture. */
const AUDIO_SRC = '/audio-only.m4a'
/** The clip is a fragmented MP4 with no duration in its header, so a browser may report Infinity until it has read it all. */
const FALLBACK_DURATION_S = 15.1
/** How far the description may drift from the picture during playback before it is snapped back. */
const MAX_DRIFT_S = 0.3

const VIDEO_CLASS = 'block h-[min(70vh,28rem)] w-full bg-black object-contain'

/**
 * The recorded video plays real files: a silent video, and (pass version) the audio description as a
 * separate track. The video is the master clock. The description always plays alongside it, muted unless
 * AD is on, so turning AD on mid-clip is instant and already in sync. Sync runs from the video's own
 * events, not our buttons, so it also holds for media keys and picture-in-picture.
 */
function RecordedVideo({ pass, describedOn, onDescribedChange }: { pass: boolean; describedOn: boolean; onDescribedChange: (on: boolean) => void }) {
  const id = useId()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(FALLBACK_DURATION_S)
  const [ended, setEnded] = useState(false)
  const [buffering, setBuffering] = useState<'video' | 'description' | null>(null)
  /** True while the video is paused only because the description is still loading, to resume it after. */
  const pausedForDescription = useRef(false)

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = !describedOn
  }, [describedOn])

  // Removing a media element pauses it, but stop both explicitly when the mode or variant changes.
  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    return () => {
      video?.pause()
      audio?.pause()
    }
  }, [])

  /**
   * Brings the description into line with the video. Idempotent, so every video event can call it: the
   * description plays only while the video is actually advancing (not paused, ended, seeking or stalled).
   */
  function syncDescription({ forceTime = false } = {}) {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) return
    if (audio.playbackRate !== video.playbackRate) audio.playbackRate = video.playbackRate

    const advancing = !video.paused && !video.ended && !video.seeking && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
    // The description may be a few frames shorter than the picture; don't restart it past its end.
    const inRange = !Number.isFinite(audio.duration) || video.currentTime < audio.duration

    const drift = Math.abs(audio.currentTime - video.currentTime)

    if (advancing && inRange) {
      if (audio.paused) {
        // Every seek costs the audio a moment of silence, so only move it when it is really out of step.
        if (forceTime || drift > MAX_DRIFT_S) audio.currentTime = video.currentTime
        audio.play().catch((error: unknown) => {
          // AbortError just means a pause() overtook this play(). Anything else (e.g. autoplay blocked) is worth knowing.
          if (!(error instanceof DOMException && error.name === 'AbortError')) console.warn('Audio description could not play:', error)
        })
      } else if (!audio.seeking && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && (forceTime || drift > MAX_DRIFT_S)) {
        // Don't correct while the audio is still seeking or starting up: its clock isn't moving yet, so it
        // would look behind and be snapped again and again.
        audio.currentTime = video.currentTime
      }
    } else {
      if (!audio.paused) audio.pause()
      if (forceTime) audio.currentTime = video.currentTime
    }
  }

  function resumeAfterDescription() {
    pausedForDescription.current = false
    setBuffering(null)
    videoRef.current?.play().catch(() => {})
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (pausedForDescription.current) {
      // Already paused, waiting on the description: Pause means stay paused.
      pausedForDescription.current = false
      setBuffering(null)
      setPlaying(false)
    } else if (video.paused || video.ended) video.play().catch(() => {})
    else video.pause()
  }

  function toggleDescription(on: boolean) {
    // Unmute here, inside the click, so browsers that require a user gesture for audible playback allow it.
    if (audioRef.current) audioRef.current.muted = !on
    onDescribedChange(on)
    // No one is listening any more, so there's nothing to wait for.
    if (!on && pausedForDescription.current) resumeAfterDescription()
  }

  function seek(seconds: number) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = seconds
    setTime(seconds)
  }

  function readDuration() {
    const d = videoRef.current?.duration
    if (d !== undefined && Number.isFinite(d) && d > 0) setDuration(d)
  }

  if (!pass) {
    // Intentional failure: a silent video and nothing else. No audio description, no transcript.
    return <video src={VIDEO_SRC} controls playsInline preload="metadata" className={VIDEO_CLASS} />
  }

  const timeText = `${formatTime(time * 1000)} / ${formatTime(duration * 1000)}`

  return (
    <>
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        playsInline
        preload="metadata"
        className={VIDEO_CLASS}
        onLoadedMetadata={readDuration}
        onDurationChange={readDuration}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
          syncDescription()
        }}
        onPlaying={() => {
          setBuffering((b) => (b === 'video' ? null : b))
          syncDescription()
        }}
        onPause={() => {
          if (!pausedForDescription.current) {
            setPlaying(false)
            setBuffering(null)
          }
          syncDescription()
        }}
        onWaiting={() => {
          setBuffering('video')
          syncDescription()
        }}
        onSeeking={() => syncDescription({ forceTime: true })}
        onCanPlay={() => setBuffering((b) => (b === 'video' ? null : b))}
        onSeeked={() => {
          setTime(videoRef.current?.currentTime ?? 0)
          syncDescription({ forceTime: true })
        }}
        onTimeUpdate={() => {
          const video = videoRef.current
          if (!video) return
          setTime(video.currentTime)
          if (!video.seeking) syncDescription()
        }}
        onRateChange={() => syncDescription()}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
          syncDescription()
        }}
      />
      <audio
        ref={audioRef}
        src={DESCRIPTION_SRC}
        preload="auto"
        onWaiting={() => {
          // The description has run out of data. If anyone is listening, hold the picture until it catches up.
          // A seek (ours, to keep it in sync) also fires "waiting", but that resolves on its own in a few
          // milliseconds. Pausing the video for it would restart the sync, seek again, and loop forever.
          const video = videoRef.current
          const audio = audioRef.current
          if (!describedOn || !video || !audio || video.paused || audio.seeking) return
          pausedForDescription.current = true
          setBuffering('description')
          video.pause()
        }}
        onCanPlay={() => {
          if (pausedForDescription.current) resumeAfterDescription()
        }}
      />

      <div className="px-3 pt-2">
        <label htmlFor={`${id}-seek`} className="sr-only">
          Seek
        </label>
        <input
          id={`${id}-seek`}
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={Math.min(time, duration)}
          aria-valuetext={timeText}
          onChange={(e) => seek(Number(e.target.value))}
          className={`h-6 w-full cursor-pointer accent-sky-400 ${FOCUS}`}
        />
      </div>

      <div role="group" aria-label="Video controls" className="flex flex-wrap items-center gap-1 p-1.5 text-white">
        <button type="button" onClick={togglePlay} className={CONTROL}>
          {playing ? <Pause className="size-5" aria-hidden="true" /> : ended ? <RotateCcw className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
          <span className="sr-only">{playing ? 'Pause' : ended ? 'Replay' : 'Play'}</span>
        </button>
        <span className="ml-1 font-mono text-xs text-slate-300">{timeText}</span>
        {buffering && (
          <span className="flex items-center gap-1 text-xs text-slate-300">
            <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            {buffering === 'video' ? 'Buffering…' : 'Loading description…'}
          </span>
        )}
        <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold hover:bg-white/15 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-white">
          <input
            type="checkbox"
            role="switch"
            checked={describedOn}
            onChange={(e) => toggleDescription(e.target.checked)}
            className="size-4 accent-sky-400 focus:outline-none"
          />
          Enable Audio Description (AD)
        </label>
      </div>
    </>
  )
}

export function MediaAlternativesDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [mode, setMode] = useState<Mode>('video')
  const media = MEDIA[mode]
  const [describedOn, setDescribedOn] = useState(false)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const transcriptHeadingRef = useRef<HTMLHeadingElement>(null)
  const focusTranscript = useRef(false)

  const pass = variant === 'pass'

  function switchMode(next: Mode) {
    setMode(next)
    setTranscriptOpen(false)
  }

  // "Read transcript" opens the transcript and moves focus to it, like following an in-page link.
  function openTranscript() {
    focusTranscript.current = true
    setTranscriptOpen(true)
  }
  useEffect(() => {
    if (transcriptOpen && focusTranscript.current) transcriptHeadingRef.current?.focus()
    focusTranscript.current = false
  }, [transcriptOpen])

  // What the people this criterion protects actually get, right now.
  let audienceLabel: string
  let audienceText: string
  let good: boolean
  if (mode === 'video') {
    audienceLabel = 'Blind viewers hear'
    good = pass && describedOn
    audienceText = !pass
      ? 'Silence: the video has no soundtrack, no audio description and no transcript.'
      : describedOn
        ? 'An audio description of what is on screen, in time with the picture.'
        : 'Silence for now. Turn on AD to hear what is on screen, or read the transcript.'
  } else {
    audienceLabel = 'Deaf listeners get'
    good = pass
    audienceText = pass ? 'A full transcript, linked below the player.' : 'Nothing: there is no transcript.'
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-slate-900">Media</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <label
              key={m}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-400 px-3 text-sm text-slate-900 has-checked:border-blue-700 has-checked:bg-blue-50 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-700"
            >
              <input
                type="radio"
                name={`${id}-mode`}
                checked={mode === m}
                onChange={() => switchMode(m)}
                className="size-4 accent-blue-700 focus:outline-none"
              />
              {MEDIA[m].label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="overflow-hidden rounded-lg bg-slate-950">
        {mode === 'video' ? (
          <RecordedVideo key={variant} pass={pass} describedOn={describedOn} onDescribedChange={setDescribedOn} />
        ) : (
          // The same real audio in both versions. Only the pass version links a transcript (below).
          <>
            <div className="flex aspect-[3/1] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
              <Headphones className="size-14 text-sky-300" aria-hidden="true" />
            </div>
            <div className="p-3">
              <audio key={variant} src={AUDIO_SRC} controls preload="metadata" aria-label={media.title} className="block w-full" />
            </div>
          </>
        )}
      </div>

      <p className="-mt-2 text-sm font-semibold text-slate-900">{media.title}</p>

      {/* Intentional failure (fail version): no audio description and no transcript, whatever the media. */}
      {pass && (
        <a
          href={`#${id}-transcript`}
          onClick={(e) => {
            e.preventDefault()
            openTranscript()
          }}
          className="inline-flex items-center gap-1.5 self-start rounded text-sm font-semibold text-blue-800 underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <FileText className="size-4" aria-hidden="true" />
          Read transcript
        </a>
      )}

      {pass && transcriptOpen && (
        <section id={`${id}-transcript`} aria-labelledby={`${id}-transcript-title`} className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
          <h5
            id={`${id}-transcript-title`}
            ref={transcriptHeadingRef}
            tabIndex={-1}
            className="text-sm font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
          >
            Transcript: {media.title}
          </h5>
          <ul className="flex flex-col gap-1 text-sm text-slate-800">
            {media.transcript.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setTranscriptOpen(false)}
            className="inline-flex min-h-11 cursor-pointer items-center self-start rounded-lg border-2 border-slate-500 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Hide transcript
          </button>
        </section>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold text-slate-600">{audienceLabel}</dt>
        <dd
          className={`font-semibold ${
            good ? 'text-green-800' : !pass ? 'text-red-800' : 'text-slate-900'
          }`}
        >
          {audienceText}
        </dd>
      </dl>
    </div>
  )
}
