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
  const isLanding = pathname === '/'
  const useDark = isLanding || isDark

  return (
    <div
      className={`fixed inset-0 z-0 transition-colors duration-500 ${useDark ? 'bg-slate-900' : 'bg-[#fcfdff]'}`}
      style={useDark ? {
        backgroundImage: 'url(/tunnel-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      {useDark ? (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-slate-900/95" />
      ) : (
        <div className="absolute inset-0 bg-mesh opacity-60" />
      )}
    </div>
  )
}
