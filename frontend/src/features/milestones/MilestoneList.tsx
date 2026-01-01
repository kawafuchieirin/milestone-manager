import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import type { Milestone, MilestoneStatus, CreateMilestoneInput } from '../../types'
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useUpdateMilestoneStatus,
  useReorderMilestones,
} from './useMilestones'
import { MilestoneFormModal } from './MilestoneFormModal'
import { styles } from '../../lib/styles'
import { PlusIcon } from '@heroicons/react/24/outline'

interface MilestoneListProps {
  goalId: string
  goalEndDate: string
}

const statusConfig: Record<
  MilestoneStatus,
  { icon: typeof CheckCircleIcon; color: string; label: string }
> = {
  pending: { icon: ClockIcon, color: 'text-gray-400', label: '未着手' },
  in_progress: { icon: PlayIcon, color: 'text-blue-500', label: '進行中' },
  completed: { icon: CheckCircleSolidIcon, color: 'text-green-500', label: '完了' },
}

interface SortableMilestoneItemProps {
  milestone: Milestone
  onStatusChange: (milestone: Milestone, status: MilestoneStatus) => void
  onEdit: (milestone: Milestone) => void
  onDelete: (milestone: Milestone) => void
}

function SortableMilestoneItem({
  milestone,
  onStatusChange,
  onEdit,
  onDelete,
}: SortableMilestoneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const config = statusConfig[milestone.status]
  const StatusIcon = config.icon

  function isOverdue(m: Milestone) {
    if (m.status === 'completed') return false
    return new Date(m.dueDate) < new Date()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  const overdue = isOverdue(milestone)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-lg border bg-white p-4 ${
        overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            const nextStatus: Record<MilestoneStatus, MilestoneStatus> = {
              pending: 'in_progress',
              in_progress: 'completed',
              completed: 'pending',
            }
            onStatusChange(milestone, nextStatus[milestone.status])
          }}
          className="rounded-full p-1 hover:bg-gray-100"
          title={`ステータス: ${config.label}`}
        >
          <StatusIcon className={`h-6 w-6 ${config.color}`} />
        </button>
        <div>
          <p
            className={`font-medium ${
              milestone.status === 'completed'
                ? 'text-gray-400 line-through'
                : 'text-gray-900'
            }`}
          >
            {milestone.title}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className={overdue ? 'font-medium text-red-600' : 'text-gray-500'}>
              期限: {formatDate(milestone.dueDate)}
              {overdue && ' (期限切れ)'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                milestone.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : milestone.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {config.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(milestone)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(milestone)}
          className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function MilestoneList({ goalId, goalEndDate }: MilestoneListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  const { data: milestones, isLoading } = useMilestones(goalId)
  const createMilestone = useCreateMilestone()
  const updateMilestone = useUpdateMilestone()
  const deleteMilestone = useDeleteMilestone()
  const updateStatus = useUpdateMilestoneStatus()
  const reorderMilestones = useReorderMilestones()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortedMilestones = [...(milestones || [])].sort((a, b) => a.order - b.order)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedMilestones.findIndex((m) => m.id === active.id)
      const newIndex = sortedMilestones.findIndex((m) => m.id === over.id)
      const newOrder = arrayMove(sortedMilestones, oldIndex, newIndex)
      const orderedIds = newOrder.map((m) => m.id)

      reorderMilestones.mutate({ goalId, orderedIds })
    }
  }

  function handleCreate(data: CreateMilestoneInput) {
    createMilestone.mutate(
      { goalId, data },
      {
        onSuccess: () => {
          setIsModalOpen(false)
        },
      }
    )
  }

  function handleUpdate(data: CreateMilestoneInput) {
    if (!editingMilestone) return
    updateMilestone.mutate(
      { id: editingMilestone.id, goalId, data },
      {
        onSuccess: () => {
          setEditingMilestone(null)
        },
      }
    )
  }

  function handleDelete(milestone: Milestone) {
    if (!window.confirm(`「${milestone.title}」を削除しますか？`)) return
    deleteMilestone.mutate({ id: milestone.id, goalId })
  }

  function handleStatusChange(milestone: Milestone, newStatus: MilestoneStatus) {
    updateStatus.mutate({ id: milestone.id, goalId, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">マイルストーン</h2>
        <button type="button" className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          追加
        </button>
      </div>

      {sortedMilestones.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedMilestones.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sortedMilestones.map((milestone) => (
                <SortableMilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingMilestone}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">マイルストーンがありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            目標を達成するためのマイルストーンを追加しましょう
          </p>
          <div className="mt-4">
            <button type="button" className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              マイルストーンを追加
            </button>
          </div>
        </div>
      )}

      <MilestoneFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMilestone.isPending}
        goalEndDate={goalEndDate}
      />

      <MilestoneFormModal
        isOpen={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        onSubmit={handleUpdate}
        milestone={editingMilestone}
        isLoading={updateMilestone.isPending}
        goalEndDate={goalEndDate}
      />
    </div>
  )
}
