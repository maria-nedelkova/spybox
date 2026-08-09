export type SpriteRow = readonly string[];
export type SpriteMatrix = readonly SpriteRow[];
export type Palette = Readonly<Record<string, string>>;

export function PixelSprite({
  matrix,
  palette,
  className,
}: {
  matrix: SpriteMatrix;
  palette: Palette;
  className?: string;
}) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        imageRendering: "pixelated",
      }}
    >
      {matrix.flatMap((row, r) =>
        row.map((token, c) => (
          <div key={`${r}-${c}`} style={{ background: palette[token] ?? "transparent" }} />
        )),
      )}
    </div>
  );
}
