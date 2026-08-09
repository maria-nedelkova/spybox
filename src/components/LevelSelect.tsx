import { cn } from "@/lib/utils";

export function LevelSelect({
  names,
  activeIndex,
  onSelect,
}: {
  names: readonly string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="level-select">
      {names.map((name, i) => (
        <button
          key={name}
          type="button"
          className={cn("level-select__item", i === activeIndex && "level-select__item--active")}
          onClick={() => onSelect(i)}
        >
          {i + 1}. {name}
        </button>
      ))}
    </div>
  );
}
