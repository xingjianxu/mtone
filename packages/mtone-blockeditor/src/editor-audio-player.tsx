import * as React from "react";
import { Button, Popover } from "@bixlab/mtone";
import { Ellipsis, Pause, Play, Volume2, VolumeX } from "lucide-react";

export const AudioLocale = React.createContext<"zh" | "en">("en");

const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
function timeLabel(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const tail = String(total % 60).padStart(2, "0");
  const minutes = Math.floor(total / 60);
  return minutes < 60
    ? `${minutes}:${tail}`
    : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${tail}`;
}

export function AudioPlayer({ url, label }: { url: string; label?: string }) {
  const zh = React.useContext(AudioLocale) === "zh";
  const ref = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [position, setPosition] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [rate, setRate] = React.useState(1);
  const [error, setError] = React.useState(false);

  const syncPosition = ({
    currentTarget: audio,
  }: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : 0,
    );
    setPosition(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
  };
  const toggle = async () => {
    const audio = ref.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (audio.error || error) {
      setError(false);
      audio.load();
    }
    try {
      await audio.play();
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === "AbortError"))
        setError(true);
    }
  };
  const seek = (value: number) => {
    const audio = ref.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.min(duration, Math.max(0, value));
    setPosition(audio.currentTime);
  };
  const volumeLabel = zh ? "音量" : "Volume";
  const rateLabel = zh ? "播放倍速" : "Playback speed";
  const moreLabel = zh ? "更多音频选项" : "More audio options";
  const muteLabel = muted ? (zh ? "取消静音" : "Unmute") : zh ? "静音" : "Mute";
  const VolumeIcon = muted || volume === 0 ? VolumeX : Volume2;
  const volumeControls = () => (
    <div className="mt-block-editor-audio-popup-row">
      <Button
        type="button"
        variant="ghost"
        iconOnly
        aria-label={muteLabel}
        onClick={() => {
          if (ref.current) ref.current.muted = !ref.current.muted;
        }}
      >
        <VolumeIcon size={16} aria-hidden />
      </Button>
      <input
        className="mt-block-editor-audio-volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={muted ? 0 : volume}
        aria-label={volumeLabel}
        aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
        onChange={(event) => {
          if (!ref.current) return;
          ref.current.volume = Number(event.target.value);
          ref.current.muted = false;
        }}
      />
    </div>
  );
  const rateControls = () => (
    <div
      className="mt-block-editor-audio-popup-row mt-block-editor-audio-rates"
      role="group"
      aria-label={rateLabel}
    >
      {rates.map((value) => (
        <Button
          key={value}
          type="button"
          size="small"
          variant="ghost"
          aria-pressed={rate === value}
          onClick={() => {
            if (ref.current) ref.current.playbackRate = value;
          }}
        >
          {value}×
        </Button>
      ))}
    </div>
  );
  const PlayIcon = playing ? Pause : Play;
  const elapsed = timeLabel(position);
  const total = duration
    ? timeLabel(Math.max(1, Math.floor(duration)))
    : "–:––";

  return (
    <div
      className="mt-block-editor-audio"
      role="group"
      aria-label={label || (zh ? "音频播放器" : "Audio player")}
      data-mt-audio-control
      onClick={(event) => event.stopPropagation()}
    >
      <audio
        hidden
        ref={ref}
        src={url}
        preload="metadata"
        onLoadedMetadata={syncPosition}
        onDurationChange={syncPosition}
        onTimeUpdate={syncPosition}
        onSeeking={syncPosition}
        onSeeked={syncPosition}
        onPlay={() => {
          setPlaying(true);
          setError(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError(true);
        }}
        onVolumeChange={({ currentTarget }) => {
          setVolume(currentTarget.volume);
          setMuted(currentTarget.muted);
        }}
        onRateChange={({ currentTarget }) =>
          setRate(currentTarget.playbackRate)
        }
      />
      <div className="mt-block-editor-audio-row">
        <Button
          type="button"
          iconOnly
          variant="solid"
          className="mt-block-editor-audio-play"
          aria-label={
            playing
              ? zh
                ? "暂停音频"
                : "Pause audio"
              : zh
                ? "播放音频"
                : "Play audio"
          }
          onClick={toggle}
        >
          <PlayIcon size={15} fill="currentColor" aria-hidden />
        </Button>
        <div className="mt-block-editor-audio-timeline">
          <input
            type="range"
            className="mt-block-editor-audio-seek"
            min={0}
            max={duration || 1}
            step="any"
            value={Math.min(position, duration)}
            disabled={!duration}
            style={
              {
                "--mt-audio-progress": `${duration ? (position / duration) * 100 : 0}%`,
              } as React.CSSProperties
            }
            aria-label={zh ? "播放进度" : "Playback position"}
            aria-valuetext={`${elapsed} / ${total}`}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <div className="mt-block-editor-audio-time" aria-hidden="true">
            <span>{elapsed}</span>
            <span>{total}</span>
          </div>
        </div>
        <div className="mt-block-editor-audio-wide">
          <Popover
            align="end"
            label={volumeLabel}
            trigger={
              <Button
                type="button"
                variant="ghost"
                iconOnly
                aria-label={volumeLabel}
              >
                <VolumeIcon size={16} aria-hidden />
              </Button>
            }
            content={volumeControls()}
          />
          <Popover
            align="end"
            label={rateLabel}
            trigger={
              <Button
                type="button"
                size="small"
                variant="outline"
                aria-label={rateLabel}
              >
                {rate}×
              </Button>
            }
            content={rateControls()}
          />
        </div>
        <div className="mt-block-editor-audio-narrow">
          <Popover
            align="end"
            label={moreLabel}
            trigger={
              <Button
                type="button"
                variant="ghost"
                iconOnly
                aria-label={moreLabel}
              >
                <Ellipsis size={17} aria-hidden />
              </Button>
            }
            content={
              <div className="mt-block-editor-audio-popup">
                {volumeControls()}
                {rateControls()}
              </div>
            }
          />
        </div>
      </div>
      {error && (
        <div className="mt-block-editor-audio-error" role="status">
          {zh
            ? "无法播放音频。可再次点击播放重试。"
            : "Audio could not play. Press play again to retry."}
        </div>
      )}
    </div>
  );
}
