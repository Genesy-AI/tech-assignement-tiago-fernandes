import { useState, useRef, useCallback, useEffect } from 'react'

export const EditableCell = ({
  updateValue,
  displayName,
  value,
}: {
  updateValue: (newValue: string) => void
  displayName: string
  value: string
  index: number
  keyName: string
}) => {
  return (
    <td title={`Edit '${displayName}'`} className="px-3 py-2 text-sm text-gray-900">
      <EditableField
        value={value}
        onSave={(newValue) => {
          console.log('onSave', newValue)
          updateValue(newValue)
        }}
      />
    </td>
  )
}

export const EditableField = ({
  value,
  onSave,
  placeholder = '-',
}: {
  value: string | undefined
  onSave?: (newValue: string) => void
  placeholder?: string
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const commit = useCallback(() => {
    const next = draft.trim()
    console.log('commit', next)

    if (onSave) onSave(next)
    setIsEditing(false)
  }, [draft, onSave])

  if (!isEditing) {
    const display = (value ?? '').trim() || placeholder
    return (
      <div className="w-full text-left hover:underline cursor-pointer" onClick={() => setIsEditing(true)}>
        <span className="ml-2">📝</span>
        <span className="ml-2">{display}</span>
      </div>
    )
  }
  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={(e) => {
        console.log('onchange', e.target.value)
        setDraft(e.target.value)
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit()
        }
      }}
      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
