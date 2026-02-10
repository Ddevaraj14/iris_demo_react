export default function Navigation({
  sections,
  activeIndex,
  isMuted,
  onMuteToggle,
  onSectionChange,
}) {
  return (
    <header className="nav">
      <div className="brand">Iris Demo</div>
      <div className="controls">
        <button className="btn" onClick={onMuteToggle}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <select
          className="select"
          value={activeIndex}
          onChange={(e) => onSectionChange(Number(e.target.value))}
        >
          {sections.map((section, index) => (
            <option key={section.id} value={index}>
              {section.title}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
