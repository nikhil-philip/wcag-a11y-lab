import { ArrowLeftRight, GripVertical } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

type Column = 'todo' | 'done'

const COLUMNS: readonly { key: Column; title: string }[] = [
  { key: 'todo', title: 'To Do' },
  { key: 'done', title: 'Done' },
]

const TITLE: Record<Column, string> = { todo: 'To Do', done: 'Done' }
const OTHER: Record<Column, Column> = { todo: 'done', done: 'todo' }

interface Task {
  id: number
  title: string
  column: Column
}

const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: 'Write the Q3 report', column: 'todo' },
  { id: 2, title: 'Book the team offsite', column: 'todo' },
]

/** Movement (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4

interface Drag {
  id: number
  pointerId: number
  startX: number
  startY: number
  dx: number
  dy: number
  over: Column | null
}

export function DraggingMovementsDemo({ variant }: { variant: DemoVariant }) {
  const [tasks, setTasks] = useState<readonly Task[]>(INITIAL_TASKS)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [status, setStatus] = useState('')
  const columnRefs = useRef<Partial<Record<Column, HTMLElement | null>>>({})

  // Moving a card re-mounts it in the other column, which would drop keyboard focus. Put it back on the
  // same card's Move button.
  const moveButtons = useRef(new Map<number, HTMLButtonElement>())
  const refocusId = useRef<number | null>(null)
  useEffect(() => {
    if (refocusId.current === null) return
    moveButtons.current.get(refocusId.current)?.focus()
    refocusId.current = null
  }, [tasks])

  function move(task: Task, to: Column, how: 'drag' | 'button') {
    if (how === 'button') refocusId.current = task.id
    setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, column: to } : t)))
    setStatus(`Moved "${task.title}" to ${TITLE[to]} ${how === 'drag' ? 'by dragging' : 'with one click'}.`)
  }

  /** The column under a point, from the columns' boxes (the dragged card itself is under the pointer). */
  function columnAt(x: number, y: number): Column | null {
    for (const { key } of COLUMNS) {
      const r = columnRefs.current[key]?.getBoundingClientRect()
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key
    }
    return null
  }

  // The drag: press, hold and move across to the other column. Pointer capture keeps the card following
  // the pointer even when it moves faster than the card.
  function onPointerDown(e: PointerEvent<HTMLLIElement>, task: Task) {
    if (!e.isPrimary || e.button !== 0) return
    if (e.target instanceof Element && e.target.closest('button')) return // buttons stay buttons
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id: task.id, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0, over: null })
  }

  function onPointerMove(e: PointerEvent<HTMLLIElement>) {
    if (!drag || e.pointerId !== drag.pointerId) return
    setDrag({ ...drag, dx: e.clientX - drag.startX, dy: e.clientY - drag.startY, over: columnAt(e.clientX, e.clientY) })
  }

  function onPointerUp(e: PointerEvent<HTMLLIElement>, task: Task) {
    if (!drag || e.pointerId !== drag.pointerId) return
    const moved = Math.hypot(drag.dx, drag.dy) > DRAG_THRESHOLD
    if (moved && drag.over && drag.over !== task.column) move(task, drag.over, 'drag')
    setDrag(null)
  }

  const dragged = drag && Math.hypot(drag.dx, drag.dy) > DRAG_THRESHOLD ? drag : null

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Move "Write the Q3 report" to Done.</p>

      <div className="grid grid-cols-2 gap-2">
        {COLUMNS.map(({ key, title }) => {
          const cards = tasks.filter((t) => t.column === key)
          const isTarget = dragged !== null && dragged.over === key && tasks.find((t) => t.id === dragged.id)?.column !== key
          return (
            <section
              key={key}
              ref={(el) => {
                columnRefs.current[key] = el
              }}
              aria-label={title}
              className={`flex min-h-40 min-w-0 flex-col gap-2 rounded-lg border-2 p-2 transition-colors ${
                isTarget ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-slate-100'
              }`}
            >
              <h5 className="text-sm font-bold text-slate-900">
                {title} <span className="font-normal text-slate-600">({cards.length})</span>
              </h5>
              <ul className="flex flex-col gap-2">
                {cards.map((task) => {
                  const offset = dragged?.id === task.id ? dragged : null
                  return (
                    <li
                      key={task.id}
                      onPointerDown={(e) => onPointerDown(e, task)}
                      onPointerMove={onPointerMove}
                      onPointerUp={(e) => onPointerUp(e, task)}
                      onPointerCancel={() => setDrag(null)}
                      style={offset ? { transform: `translate(${offset.dx}px, ${offset.dy}px) rotate(2deg)` } : undefined}
                      className={`relative flex cursor-grab touch-none flex-col gap-2 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 select-none ${
                        offset ? 'z-10 cursor-grabbing shadow-lg' : 'shadow-sm'
                      }`}
                    >
                      <p className="flex items-start gap-1">
                        <GripVertical className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
                        <span className="min-w-0 font-medium break-words">{task.title}</span>
                      </p>
                      {/* Intentional failure (fail version): no way to move a card except dragging it. */}
                      {variant === 'pass' && (
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) moveButtons.current.set(task.id, el)
                            else moveButtons.current.delete(task.id)
                          }}
                          onClick={() => move(task, OTHER[task.column], 'button')}
                          className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-blue-700 bg-white px-2 text-xs font-semibold text-blue-800 hover:bg-blue-50 ${FOCUS}`}
                        >
                          <ArrowLeftRight className="size-3.5 shrink-0" aria-hidden="true" />
                          Move to {TITLE[OTHER[task.column]]}
                          <span className="sr-only">: {task.title}</span>
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
              {cards.length === 0 && <p className="text-xs text-slate-600">No tasks</p>}
            </section>
          )
        })}
      </div>

      <p role="status" className="min-h-5 text-sm font-semibold text-slate-900">
        {status ||
          (variant === 'fail'
            ? 'Dragging is the only way to move a card: press, hold and move it across.'
            : 'Drag a card, or use its Move button with a single click or tap.')}
      </p>

      {tasks.some((t, i) => t.column !== INITIAL_TASKS[i]?.column) && (
        <button
          type="button"
          onClick={() => {
            setTasks(INITIAL_TASKS)
            setStatus('')
          }}
          className={`inline-flex min-h-11 cursor-pointer items-center self-start rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
        >
          Reset demo
        </button>
      )}
    </div>
  )
}
