import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptToken } from '@/lib/fhir/crypto'

const CMS_REVOKE_URL = 'https://sandbox.bluebutton.cms.gov/v2/o/revoke/'

async function revokeCMSToken(refreshToken: string) {
  try {
    await fetch(CMS_REVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.FHIR_CMS_CLIENT_ID}:${process.env.FHIR_CMS_CLIENT_SECRET}`
        ).toString('base64'),
      },
      body: new URLSearchParams({ token: refreshToken }),
    })
  } catch {
    // Non-blocking — proceed with deletion even if revocation fails
  }
}

export async function POST() {
  const supabase      = await createClient()
  const adminClient   = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Revoke CMS OAuth token (best-effort)
  const { data: tokenRow } = await supabase
    .from('fhir_tokens')
    .select('refresh_token')
    .eq('user_id', user.id)
    .single()

  if (tokenRow?.refresh_token) {
    const refreshToken = decryptToken(tokenRow.refresh_token)
    if (refreshToken) await revokeCMSToken(refreshToken)
  }

  // Delete all user data
  await supabase.from('fhir_tokens').delete().eq('user_id', user.id)
  await supabase.from('profiles').delete().eq('id', user.id)

  // Delete auth user (requires service role)
  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('Failed to delete auth user:', error.message)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
