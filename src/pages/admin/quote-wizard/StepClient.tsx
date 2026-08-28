import { useState } from "react"
import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"

export function StepClient({ qb }: { qb: QuoteBuilder }) {
  const { clients, quote, setQuote, createAndAssignClient } = qb
  const [creatingClient, setCreatingClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [clientError, setClientError] = useState<string | null>(null)

  async function handleCreateClient() {
    const error = await createAndAssignClient(newClientName, newClientEmail)
    if (error) {
      setClientError(error)
      return
    }
    setClientError(null)
    setCreatingClient(false)
    setNewClientName("")
    setNewClientEmail("")
  }

  return (
    <div className="max-w-xl">
      <label className="text-dim text-xs uppercase font-mono mb-2 block">לקוח</label>
      {!quote.client_id && (
        <p className="text-dim text-xs mb-2 max-w-md">
          צריך לשייך לקוח כדי שההצעה תישמר ותהיה אפשר להמשיך לשלב הבא. אם הלקוח עדיין לא קיים במערכת — אפשר ליצור אותו כאן ישירות.
        </p>
      )}
      {!creatingClient ? (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={quote.client_id ?? ""}
            onChange={(e) => {
              const client = clients.find((c) => c.id === e.target.value)
              setQuote({ ...quote, client_id: client?.id ?? null, client_name: client?.name, client_email: client?.email })
            }}
            className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full max-w-sm"
          >
            <option value="">בחרו לקוח…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} · {c.email}</option>
            ))}
          </select>
          <button
            onClick={() => setCreatingClient(true)}
            className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors flex-none"
          >
            + לקוח חדש
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-3 flex-wrap border border-white/15 rounded-lg p-4">
          <div className="flex-1 min-w-[160px]">
            <label className="text-dim text-[10px] uppercase font-mono mb-1 block">שם</label>
            <input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-dim text-[10px] uppercase font-mono mb-1 block">אימייל</label>
            <input
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateClient}
              className="font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform"
            >
              יצירה ושיוך
            </button>
            <button
              onClick={() => { setCreatingClient(false); setClientError(null) }}
              className="font-mono text-xs uppercase tracking-wide text-dim p-2.5"
            >
              ביטול
            </button>
          </div>
          {clientError && <p className="text-red-400 text-xs w-full">{clientError}</p>}
        </div>
      )}
    </div>
  )
}
