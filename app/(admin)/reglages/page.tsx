import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ReglagesClient } from './ReglagesClient'

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'GROQ_API_KEY',
]

export default async function ReglagesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const envStatus = REQUIRED_VARS.map(v => ({
    name: v,
    present: !!process.env[v],
  }))

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { version } = require('../../../package.json') as { version: string }

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <ReglagesClient
        email={user?.email ?? ''}
        envStatus={envStatus}
        version={version}
      />
    </div>
  )
}
