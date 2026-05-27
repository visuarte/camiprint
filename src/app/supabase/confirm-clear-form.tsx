'use client'

import { useState } from 'react'

type ConfirmClearFormProps = {
  action: (formData: FormData) => void | Promise<void>
}

export default function ConfirmClearForm({ action }: ConfirmClearFormProps) {
  const [confirmText, setConfirmText] = useState('')

  const canSubmit = confirmText.trim().toUpperCase() === 'BORRAR'

  return (
    <form
      action={action}
      className="mt-4"
      onSubmit={(event) => {
        if (!canSubmit) {
          event.preventDefault()
          return
        }

        const accepted = window.confirm(
          'Esta accion eliminara todos los todos visibles. ¿Quieres continuar?',
        )

        if (!accepted) {
          event.preventDefault()
        }
      }}
    >
      <label className="mb-2 block text-sm font-medium text-red-800">
        Escribe <span className="font-bold">BORRAR</span> para habilitar la limpieza global.
      </label>
      <input
        type="text"
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        placeholder="BORRAR"
        className="mb-3 w-full rounded border border-red-300 px-3 py-2 text-sm"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Limpiar toda la lista
      </button>
    </form>
  )
}
