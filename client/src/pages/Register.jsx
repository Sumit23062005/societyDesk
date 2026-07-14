import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { request, setSessionUser } from '../lib/api.js'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    unitNumber: '',
    phone: '',
    email: '',
    password: '',
    terms: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.terms) {
      window.alert('Please accept the terms to continue.')
      return
    }

    const phoneDigits = form.phone.replace(/\D/g, '')

    try {
      setSubmitting(true)
      const response = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.fullName,
          flatNumber: form.unitNumber,
          phone: phoneDigits,
          email: form.email,
          password: form.password,
        }),
      })

      const user = response?.data?.user
      if (user) {
        setSessionUser(user)
      }

      navigate('/complaints', { replace: true })
    } catch (error) {
      window.alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-surface">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary-fixed/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-secondary-container/40 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest">
        {/* Left: Branding */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-primary relative overflow-hidden">
          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-12">
              <Icon name="domain" filled className="text-secondary-fixed text-4xl" />
              <h1 className="text-white font-headline-md text-headline-md tracking-tight">UrbanLink</h1>
            </div>
            <h2 className="text-white font-headline-xl text-headline-xl mb-6">
              Experience Better Living Together.
            </h2>
            <p className="text-on-primary/80 font-body-lg text-body-lg max-w-md">
              Join thousands of residents using UrbanLink to streamline society maintenance,
              track complaints, and stay updated with community notices.
            </p>
          </div>

          <div className="relative z-20 flex gap-6">
            <div className="flex flex-col">
              <span className="text-white font-headline-md text-headline-md">2.4k+</span>
              <span className="text-on-primary/70 font-label-sm text-label-sm uppercase tracking-widest">
                Active Units
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-headline-md text-headline-md">98%</span>
              <span className="text-on-primary/70 font-label-sm text-label-sm uppercase tracking-widest">
                Resolution Rate
              </span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <div className="md:hidden flex items-center gap-2 mb-6">
              <Icon name="domain" filled className="text-primary text-3xl" />
              <span className="text-primary font-bold text-headline-md">UrbanLink</span>
            </div>
            <h2 className="text-on-surface font-headline-lg text-headline-lg mb-2">Create Account</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Fill in your details to join your society portal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-on-surface-variant font-label-md text-label-md" htmlFor="full_name">
                Full Name
              </label>
              <div className="relative group">
                <Icon
                  name="person"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                />
                <input
                  id="full_name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all font-body-md text-body-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-on-surface-variant font-label-md text-label-md" htmlFor="unit_number">
                  Unit / Apt No.
                </label>
                <div className="relative group">
                  <Icon
                    name="apartment"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                  />
                  <input
                    id="unit_number"
                    type="text"
                    value={form.unitNumber}
                    onChange={(e) => update('unitNumber', e.target.value)}
                    placeholder="B-402"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all font-body-md text-body-md"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-on-surface-variant font-label-md text-label-md" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative group">
                  <Icon
                    name="call"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                  />
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all font-body-md text-body-md"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-on-surface-variant font-label-md text-label-md" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Icon
                  name="mail"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all font-body-md text-body-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-on-surface-variant font-label-md text-label-md" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Icon
                  name="lock"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all font-body-md text-body-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={form.terms}
                onChange={(e) => update('terms', e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-secondary-fixed"
              />
              <label className="text-on-surface-variant font-label-sm text-label-sm" htmlFor="terms">
                I agree to the{' '}
                <a className="text-primary font-bold hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-primary font-bold hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white font-label-md text-label-md py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="text-center mt-8">
              <p className="text-on-surface-variant font-body-md text-body-md">
                Already have an account?
                <Link to="/" className="text-primary font-bold hover:underline ml-1">
                  Log In
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col items-center">
            <span className="text-outline font-label-sm text-label-sm uppercase tracking-widest mb-4">
              Trusted by the best developers
            </span>
            <div className="flex gap-8 opacity-40 grayscale">
              <div className="h-6 w-24 bg-surface-container-highest rounded flex items-center justify-center font-bold text-xs">
                Vanguard
              </div>
              <div className="h-6 w-24 bg-surface-container-highest rounded flex items-center justify-center font-bold text-xs">
                Evergreen
              </div>
              <div className="h-6 w-24 bg-surface-container-highest rounded flex items-center justify-center font-bold text-xs">
                Skyline
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
