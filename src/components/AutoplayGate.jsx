export default function AutoplayGate({ onStart }) {
  return (
    <div className="autoplay-gate">
      <div className="autoplay-gate__card">
        <h3>Tap to start audio</h3>
        <p>Browser autoplay rules require a user gesture to begin playback.</p>
        <button className="btn" onClick={onStart}>
          Start
        </button>
      </div>
    </div>
  );
}
