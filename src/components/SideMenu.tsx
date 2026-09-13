import { Fragment, type ReactNode } from "react";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/8bit/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/8bit/button-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/8bit/popover";
import { CHARACTERS, type CharacterId } from "@/game/characters";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Below this the labels go and the menu becomes a grouped icon panel under
 * the board. Kept in step with the `max-width: 72rem` block in style.css by
 * hand; the two describe the same breakpoint from either side.
 */
export const COMPACT_QUERY = "(max-width: 72rem)";

/**
 * A sideways phone. Here the panel stacks into a column beside the board
 * instead of a bar under it, so it costs width rather than the height the
 * board needs. Matches the block of the same condition in style.css.
 */
export const LANDSCAPE_PHONE_QUERY =
  "(max-height: 30rem) and (orientation: landscape) and (pointer: coarse)";

/**
 * The game's controls as a vertical menu down the left edge, built from the
 * 8bitcn button so the chunky border and press state match the rest of the
 * kit. Every item is the same width and carries a text label — the icons sit
 * alongside the words rather than replacing them. Narrow screens hide the
 * labels and keep only the icons, and the mission rail collapses into the
 * level button's popover.
 */
export function SideMenu({
  character,
  canUndo,
  muted,
  levelIndex,
  levelCount,
  levelPanel,
  onUndo,
  onReset,
  onToggleMuted,
  onSwitchAgent,
}: {
  character: CharacterId;
  canUndo: boolean;
  muted: boolean;
  levelIndex: number;
  levelCount: number;
  /** The mission panel, shown here only when the rail beside the board is
      hidden. Rendered lazily by the popover, so on a wide screen — where the
      trigger is hidden and can never open — it never mounts at all. */
  levelPanel: ReactNode;
  onUndo: () => void;
  onReset: () => void;
  onToggleMuted: () => void;
  onSwitchAgent: () => void;
}) {
  const characterName = CHARACTERS.find((c) => c.id === character)?.name ?? "Agent";
  const levelLabel = String(levelIndex + 1).padStart(2, "0");
  const compact = useMediaQuery(COMPACT_QUERY);
  const landscapePhone = useMediaQuery(LANDSCAPE_PHONE_QUERY);

  // An array rather than a fragment: the grouped variant interleaves pixel
  // separators between them, which needs the items one at a time.
  const items = [
    /* First in the bar: it says which level you are on as well as opening the
       panel, so it reads as a heading for the group rather than an action.
       Only reachable on a narrow screen — CSS hides it wherever the mission
       rail that carries the same panel is itself on show. */
    <Popover key="level">
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="menu__item menu__item--level"
          title={`Level ${levelLabel} of ${levelCount} — mission details`}
        >
          <span className="menu__icon menu__icon--level" aria-hidden="true">
            {levelLabel}
          </span>
          <span className="menu__label">Level</span>
        </Button>
      </PopoverTrigger>

      {/* The offset clears the button's own frame, which the 8bitcn button
          draws 6px outside its box. Opens upward over the board when the menu
          is a bar underneath it, and sideways whenever it is a column. */}
      <PopoverContent
        side={compact && !landscapePhone ? "top" : "right"}
        align="center"
        sideOffset={12}
        collisionPadding={12}
        className="mission-popover"
      >
        {levelPanel}
      </PopoverContent>
    </Popover>,

    /* Both glyphs come from the Arrows block (U+21xx) so they share a
       fallback font and line up at the same size — reset used to be ⟳ from
       Supplemental Arrows-B, which resolved to a different font and drew
       small and off-centre. The hooked arrow also keeps undo distinct from
       reset once the labels are hidden on a narrow screen; two mirrored
       circles would be indistinguishable. */
    <Button
      key="undo"
      variant="secondary"
      className="menu__item"
      onClick={onUndo}
      disabled={!canUndo}
    >
      {/* U+FE0E forces text presentation. Without it iOS draws U+21A9 as the
          emoji ↩️ — a blue rounded key that looks nothing like the rest of
          the set. Desktop browsers pick text on their own, so this only
          shows up on a real phone. */}
      <span className="menu__icon menu__icon--undo" aria-hidden="true">
        {"↩︎"}
      </span>
      <span className="menu__label">Undo</span>
    </Button>,

    <Button key="reset" variant="secondary" className="menu__item" onClick={onReset}>
      <span className="menu__icon menu__icon--reset" aria-hidden="true">
        ↻
      </span>
      <span className="menu__label">Reset</span>
    </Button>,

    <Button
      key="sound"
      variant="secondary"
      className="menu__item"
      onClick={onToggleMuted}
      aria-pressed={!muted}
      title={muted ? "Sound off — click to unmute" : "Sound on — click to mute"}
    >
      <span className="menu__icon menu__icon--sound" aria-hidden="true">
        {muted ? "🔇" : "🔊"}
      </span>
      <span className="menu__label">Sound</span>
      <span className="menu__state">{muted ? "off" : "on"}</span>
    </Button>,

    <Button
      key="agent"
      variant="secondary"
      className="menu__item menu__item--agent"
      onClick={onSwitchAgent}
      title={`Switch agent — currently ${characterName}`}
    >
      <span className="menu__icon menu__icon--avatar" aria-hidden="true">
        <Avatar character={character} portrait className="menu__avatar" />
      </span>
      {/* The portrait already shows who is selected, so the label says what
          the button does rather than repeating the name. */}
      <span className="menu__label">Switch agent</span>
    </Button>,

  ];

  // A grouped bar rather than a list of separate keys: on a phone the menu
  // sits under the board as a strip of icons, and one shared frame reads as a
  // control panel instead of five buttons that happen to be adjacent. The
  // group hides each button's own decorations, so this cannot be CSS alone.
  if (compact) {
    const orientation = landscapePhone ? "vertical" : "horizontal";
    return (
      <nav className="menu menu--panel" aria-label="Game controls">
        <ButtonGroup orientation={orientation}>
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 && (
                <ButtonGroupSeparator
                  orientation={orientation === "vertical" ? "horizontal" : "vertical"}
                />
              )}
              {item}
            </Fragment>
          ))}
        </ButtonGroup>
      </nav>
    );
  }

  return (
    <nav className="menu" aria-label="Game controls">
      {items}
    </nav>
  );
}
