import { LevelSelect } from "@/components/LevelSelect";

/**
 * Everything about the current mission, moved off the centre column into the
 * right-hand rail: which level you're on, the live counters, your record, and
 * the briefing.
 */
export function MissionPanel({
  levelName,
  levelIndex,
  levelNames,
  briefing,
  moves,
  pushes,
  best,
  onSelectLevel,
}: {
  levelName: string;
  levelIndex: number;
  levelNames: readonly string[];
  briefing: string;
  moves: number;
  pushes: number;
  best: number | null;
  onSelectLevel: (index: number) => void;
}) {
  return (
    <aside className="mission" aria-label="Mission status">
      <LevelSelect names={levelNames} activeIndex={levelIndex} onSelect={onSelectLevel} />

      <h2 className="mission__name">{levelName}</h2>

      <dl className="mission__stats">
        <div className="mission__stat">
          <dt>Moves</dt>
          <dd>{moves}</dd>
        </div>
        <div className="mission__stat">
          <dt>Pushes</dt>
          <dd>{pushes}</dd>
        </div>
        <div className="mission__stat">
          <dt>Best</dt>
          <dd>{best ?? "—"}</dd>
        </div>
      </dl>

      <p className="mission__briefing">{briefing}</p>
    </aside>
  );
}
