import { createServiceRoleClient } from '../src/lib/database/supabase'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const ADMIN_EMAIL = 'admin@sova.ai'
const ADMIN_PASSWORD = 'Admin123!'
const ADMIN_NAME = 'Admin'

async function createAdmin() {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: ADMIN_NAME,
      role: 'admin',
    },
  })

  if (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }

  console.log('Admin user created:', data.user.email)
  console.log('Admin ID:', data.user.id)
  console.log('Password:', ADMIN_PASSWORD)
}

createAdmin()
