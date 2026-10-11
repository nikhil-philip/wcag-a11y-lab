import { useEffect, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const VIDEO_SRC = '/movie.mp4'
const CAPTIONS_SRC = '/movieCaptions.vtt'

const cueText = (cues: TextTrackCueList | null) =>
  cues
    ? Array.from(cues, (c) => (c as VTTCue).text.replace(/<[^>]+>/g, '').replace(/\s*\n\s*/g, ' ')).join(' ')
    : ''

export function CaptionsDemo({ variant }: { variant: DemoVariant }) {
  // Keyed so switching variant starts a fresh player with fresh state.
  return <CaptionedVideo key={variant} pass={variant === 'pass'} />
}

function CaptionedVideo({ pass }: { pass: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLTrackElement>(null)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [heard, setHeard] = useState('')

  useEffect(() => {
    const video = videoRef.current
    const track = trackRef.current?.track
    if (!video || !track) return

    // Keep the track at least "hidden" so its cues load and drive the panel below even while captions are off.
    // The player's own captions menu switches it to "showing" (on) and "disabled" (off).
    const syncMode = () => {
      if (track.mode === 'disabled') track.mode = 'hidden'
      setCaptionsOn(track.mode === 'showing')
    }
    const onCueChange = () => setHeard(cueText(track.activeCues))

    syncMode()
    video.textTracks.addEventListener('change', syncMode)
    track.addEventListener('cuechange', onCueChange)
    return () => {
      video.textTracks.removeEventListener('change', syncMode)
      track.removeEventListener('cuechange', onCueChange)
      video.pause()
    }
  }, [])

  const showCaptions = pass && captionsOn && heard !== '' && !ended

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Play the video{pass ? ', then turn on captions from the player’s CC / captions menu' : ''}. The panel below
        compares what hearing and Deaf viewers get.
      </p>

      <div className="overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          controls
          playsInline
          preload="metadata"
          className="block h-[min(70vh,28rem)] w-full bg-black object-contain"
          onPlay={() => {
            setStarted(true)
            setEnded(false)
          }}
          onEnded={() => setEnded(true)}
        >
          {pass ? (
            <track ref={trackRef} kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" />
          ) : (
            // Intentional failure: no captions track, so the player has no CC option. This metadata track is
            // never shown to viewers; it only feeds the "Hearing viewers hear" panel below.
            <track ref={trackRef} kind="metadata" src={CAPTIONS_SRC} />
          )}
        </video>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold text-slate-600">Hearing viewers hear</dt>
        <dd className="text-slate-900">
          {ended ? 'The video has ended.' : !started ? 'Nothing yet: press Play.' : heard || '…'}
        </dd>
        <dt className="font-semibold text-slate-600">Deaf viewers get</dt>
        <dd className={`font-semibold ${showCaptions ? 'text-green-800' : !pass && started && !ended ? 'text-red-800' : 'text-slate-900'}`}>
          {showCaptions
            ? `The same, as captions: ${heard}`
            : !pass
              ? started && !ended
                ? 'Only moving pictures. The thunder and the whole conversation are lost.'
                : 'No captions are available for this video.'
              : captionsOn
                ? 'Captions are on.'
                : 'Captions are off. Turn them on from the player’s CC / captions menu.'}
        </dd>
      </dl>
    </div>
  )
}
