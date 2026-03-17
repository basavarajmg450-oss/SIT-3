import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function SharedBackground() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()

  // The landing page ALWAYS uses dark / tunnel background.
  // We check the route directly here so the background is correct on the
  // very first render — before Landing's useEffect has had a chance to call
  // setForceDark(true). This prevents the white-flash / stuck-white issue
  // in production when the user's localStorage theme is set to 'light'.
  // However, with our new ThemeContext, 'isDark' already accounts for the 
  // forced theme on the landing page, and even if it didn't, we can add a 
  // secondary check here for safety.
  const isLanding = pathname === '/'
  const effectiveDark = isDark || isLanding

  return (
    <div
      className={`fixed inset-0 z-0 transition-colors duration-500 ${effectiveDark ? 'bg-slate-900' : 'bg-[#fcfdff]'}`}
      style={effectiveDark ? {
        backgroundImage: 'url(/tunnel-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      {effectiveDark ? (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-slate-900/95" />
      ) : (
        <div className="absolute inset-0 bg-mesh opacity-60" />
      )}
    </div>
  )
}
