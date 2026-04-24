import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

async function checkSupabase() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getSession()
    return !error && data !== null
  } catch {
    return false
  }
}

async function checkStripe() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    })
    await stripe.balance.retrieve()
    return true
  } catch {
    return false
  }
}

async function checkOpenAI() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

function checkPostHog() {
  return !!(
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  )
}

export default async function Home() {
  const [supabaseOk, stripeOk, openaiOk] = await Promise.all([
    checkSupabase(),
    checkStripe(),
    checkOpenAI(),
  ])
  const posthogOk = checkPostHog()

  const services = [
    { name: 'Supabase', status: supabaseOk },
    { name: 'Stripe', status: stripeOk },
    { name: 'OpenAI', status: openaiOk },
    { name: 'PostHog', status: posthogOk },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-4xl font-bold">AI SaaS MVP Status</h1>
      <div className="w-full max-w-md space-y-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span className="text-lg font-medium">{service.name}</span>
            <span
              className={`rounded px-3 py-1 text-sm font-semibold ${
                service.status
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {service.status ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 space-x-4">
        <a href="/auth/signup" className="text-blue-500 underline">
          Sign Up
        </a>
        <a href="/auth/login" className="text-blue-500 underline">
          Login
        </a>
      </div>
    </div>
  )
}
