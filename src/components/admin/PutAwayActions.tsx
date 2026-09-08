import { Archive, Trash2, Undo2 } from "lucide-react"
import { RowActions } from "./RowActions"

/** Archive and bin, as buttons you can see.
 *
 * `SwipeRow` puts the same two actions behind a sideways drag, which is right
 * on a phone and does not exist at all with a mouse: on a laptop there was no
 * way to archive or bin anything, because a swipe never happens. These are the
 * same handlers, always visible, and the swipe stays for the thumb.
 *
 * Still two steps · the delete asks first · for the reason the swipe was two
 * steps: nothing in these lists should disappear because of one stray click. */
export function PutAwayActions({
  archived,
  label,
  onArchive,
  onRestore,
  onDelete,
  className,
}: {
  archived?: boolean
  /** Named in the confirm, so it says which row is going. */
  label: string
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
  className?: string
}) {
  return (
    <RowActions
      className={className}
      actions={[
        archived
          ? { icon: Undo2, label: "החזרה לרשימה", onClick: (e) => { e.stopPropagation(); onRestore() } }
          : { icon: Archive, label: "העברה לארכיון", onClick: (e) => { e.stopPropagation(); onArchive() } },
        {
          icon: Trash2,
          label: "העברה לפח",
          variant: "danger",
          onClick: (e) => {
            e.stopPropagation()
            if (confirm(`להעביר את ${label} לפח?`)) onDelete()
          },
        },
      ]}
    />
  )
}
