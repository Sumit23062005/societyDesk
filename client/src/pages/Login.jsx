import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { request, setSessionUser } from '../lib/api.js'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSubmitting(true)
      const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      const user = response?.data?.user
      if (user) {
        setSessionUser(user)
      }

      navigate(user?.role === 'admin' ? '/dashboard' : '/complaints', { replace: true })
    } catch (error) {
      window.alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter-mobile md:p-0 overflow-hidden relative bg-surface">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-surface via-transparent to-primary-fixed-dim/20 pointer-events-none" />
      </div>

      <main className="relative z-10 w-full max-w-[1100px] grid md:grid-cols-2 shadow-2xl rounded-xl overflow-hidden bg-surface-container-lowest">
        {/* Left: Branding */}
        <div className="hidden md:flex relative overflow-hidden bg-primary p-12 flex-col justify-between">
          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center shadow-lg">
                <Icon name="domain" filled className="text-primary text-[24px]" />
              </div>
              <span className="font-headline-md text-headline-md font-bold text-on-primary tracking-tight">
                UrbanLink
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-primary mb-6 leading-tight">
              Elevating Civic Trust in Urban Living.
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary/80 max-w-sm">
              Manage society maintenance, track complaints, and stay updated with official
              notices in one seamless dashboard.
            </p>
          </div>

          <div className="relative z-20 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-on-primary/10 border border-on-primary/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-secondary-fixed bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                SJ
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-primary">
                  "UrbanLink changed how we communicate."
                </p>
                <p className="font-label-sm text-label-sm text-on-primary/70">
                  Sarah Jenkins, Estate Manager
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary-fixed/10 rounded-full blur-3xl" />
          <div className="absolute top-[20%] left-[-5%] w-32 h-32 bg-secondary-fixed/5 rounded-full blur-2xl" />
        </div>

        {/* Right: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
          <div className="md:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Icon name="domain" filled className="text-white text-[18px]" />
            </div>
            <span className="font-headline-md text-headline-md font-extrabold text-primary">
              UrbanLink
            </span>
          </div>

          <div className="max-w-[360px] mx-auto w-full">
            <header className="mb-10">
              <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">
                Welcome Back
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Access your society portal and maintenance dashboard.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@residence.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus-ring transition-all placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <a className="font-label-sm text-label-sm text-secondary font-semibold hover:underline" href="#">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <Icon
                    name="lock"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus-ring transition-all placeholder:text-outline-variant"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1 rounded-md"
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary transition-all"
                />
                <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer" htmlFor="remember">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
                <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">New to UrbanLink?</p>
              <Link
                to="/register"
                className="w-full inline-block py-3.5 bg-transparent border-2 border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                Register Your Residence
              </Link>
            </div>

            <footer className="mt-12 text-center">
              <div className="flex justify-center gap-6 mb-4">
                <Icon name="language" className="text-outline-variant cursor-pointer hover:text-primary transition-colors" />
                <Icon name="help" className="text-outline-variant cursor-pointer hover:text-primary transition-colors" />
                <Icon name="info" className="text-outline-variant cursor-pointer hover:text-primary transition-colors" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-outline font-bold">
                © 2024 UrbanLink Systems Inc.
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  )
}
