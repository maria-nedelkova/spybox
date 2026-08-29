import { LevelSelect } from "@/components/LevelSelect";
import { Badge } from "@/components/ui/8bit/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Separator } from "@/components/ui/8bit/separator";

/**
 * Everything about the current mission, in the right-hand rail: which level
 * you're on, the live counters, your record, and the briefing. Built on the
 * 8bitcn card so the panel's frame matches the menu buttons opposite it.
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
    <Card className="mission" aria-label="Mission status" asChild={false}>
      <CardHeader className="mission__head">
        <LevelSelect names={levelNames} activeIndex={levelIndex} onSelect={onSelectLevel} />
        <CardTitle className="mission__name">{levelName}</CardTitle>
      </CardHeader>

      <CardContent className="mission__body">
        <Separator />

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
            <dd>
              {best === null ? (
                <span className="mission__none">—</span>
              ) : (
                <Badge variant="secondary" className="mission__best">
                  {best}
                </Badge>
              )}
            </dd>
          </div>
        </dl>

        <Separator />

        <p className="mission__briefing">{briefing}</p>
      </CardContent>
    </Card>
  );
}
