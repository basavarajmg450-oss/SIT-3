import { useTheme } from '../../context/ThemeContext'

export default function SharedBackground() {
  const { isDark } = useTheme()

  return (
    <div
      className={`fixed inset-0 z-0 transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-[#fcfdff]'}`}
      style={isDark ? {
        backgroundImage: 'url(/tunnel-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      {isDark ? (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-slate-900/95" />
      ) : (
        <div className="absolute inset-0 bg-mesh opacity-60" />
      )}
    </div>
  )
}
