// Quick test script to verify Supabase connection and authentication
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.log('❌ Error:', error.message)
      if (error.message.includes('infinite recursion')) {
        console.log('🚨 RLS RECURSION ERROR DETECTED!')
        console.log('📋 Execute the RLS_FIX_INSTRUCTIONS.md script in Supabase Dashboard')
        return false
      }
    } else {
      console.log('✅ Connection successful!')
      return true
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message)
    return false
  }
}

async function testAuth() {
  console.log('🔍 Testing authentication...')
  
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Auth error:', error.message)
      return false
    }
    
    console.log('✅ Auth system working!')
    console.log('Current session:', data.session ? 'Logged in' : 'Not logged in')
    return true
  } catch (err) {
    console.log('❌ Auth test failed:', err.message)
    return false
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Running Clini.One tests...\n')
  
  const connectionOk = await testConnection()
  const authOk = await testAuth()
  
  console.log('\n📊 Results:')
  console.log(`- Connection: ${connectionOk ? '✅' : '❌'}`)
  console.log(`- Auth: ${authOk ? '✅' : '❌'}`)
  
  if (!connectionOk || !authOk) {
    console.log('\n🔧 Next steps:')
    console.log('1. Execute RLS_FIX_INSTRUCTIONS.md in Supabase Dashboard')
    console.log('2. Test login at http://localhost:5175/login')
    console.log('3. Use: admin@clinica.com / Clinica123!')
  } else {
    console.log('\n🎉 All tests passed! System ready!')
    console.log('🌐 Visit: http://localhost:5175')
  }
}

runTests()