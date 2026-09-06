import { supabase, type ClientRow, type LeadRow } from "@/lib/supabase"

/** A client Raz types in himself is the same thing as a lead that arrived from
 * the site: someone he is trying to sell to. Keeping the two in step means the
 * pipeline, the call history and the follow-up reminders see every client, not
 * only the ones who happened to fill in a form. */
export async function ensureLeadForClient(
  client: Pick<ClientRow, "id" | "name" | "email" | "phone" | "company">,
  options: { projectType?: string; message?: string } = {}
): Promise<LeadRow | null> {
  const email = client.email.trim().toLowerCase()

  const { data: existing } = await supabase
    .from("leads")
    .select("*")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)

  const found = (existing ?? [])[0] as LeadRow | undefined
  if (found) {
    // An existing lead just gains the link back to the client row.
    if (!found.client_id) {
      await supabase.from("leads").update({ client_id: client.id }).eq("id", found.id)
      return { ...found, client_id: client.id }
    }
    return found
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      project_type: options.projectType ?? "נוסף ידנית",
      message: options.message ?? null,
      status: "contacted",
      source: "manual",
      client_id: client.id,
    })
    .select()
    .single()

  if (error) return null
  return data as LeadRow
}

/** The other direction: a call started from a name and an email needs a client
 * row before it can become a contract. */
export async function ensureClientForContact(contact: {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
}): Promise<ClientRow | null> {
  const email = contact.email?.trim()
  if (!email) return null

  const { data: existing } = await supabase.from("clients").select("*").ilike("email", email.toLowerCase()).limit(1)
  const found = (existing ?? [])[0] as ClientRow | undefined
  if (found) return found

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: contact.name.trim(),
      email,
      phone: contact.phone || null,
      company: contact.company || null,
    })
    .select()
    .single()

  if (error) return null
  const client = data as ClientRow
  await ensureLeadForClient(client)
  return client
}
