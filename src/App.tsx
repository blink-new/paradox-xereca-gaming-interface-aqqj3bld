import { useState, useEffect, useRef } from 'react'
import { 
  Menu,
  X,
  Crown,
  Crosshair,
  Eye,
  Radar,
  FileText,
  User,
  Clock,
  Settings,
  Moon,
  Sun,
  Target,
  Zap,
  Power,
  Palette,
  Sparkles
} from 'lucide-react'

// Particle interface
interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  type: 'dot' | 'spark' | 'line'
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showUI, setShowUI] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('aimbot')
  const [darkMode, setDarkMode] = useState(true)
  const [showShutdownModal, setShowShutdownModal] = useState(false)
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  
  // Particle system state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [particleConfig, setParticleConfig] = useState({
    enabled: true,
    count: 50,
    speed: 2,
    particleColor: '#ef4444', // red
    accentColor: '#dc2626', // darker red
    particleType: 'dot' as 'dot' | 'spark' | 'line'
  })
  
  // Settings state with working toggles
  const [aimbotSettings, setAimbotSettings] = useState({
    slider: 76,
    enabled: true,
    triggerBot: true,
    head: false,
    gun: true,
    armov: true
  })
  
  const [wallhackSettings, setWallhackSettings] = useState({
    positionX: 45,
    positionXEnabled: true,
    positionY: 30,
    positionYEnabled: false,
    positionZ: 60,
    positionZEnabled: true,
    visuals: false,
    fov: 58,
    fovEnabled: true
  })

  // Particle system setup
  useEffect(() => {
    if (!particleConfig.enabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < particleConfig.count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * particleConfig.speed,
          vy: (Math.random() - 0.5) * particleConfig.speed,
          size: Math.random() * 3 + 1,
          life: Math.random() * 100 + 50,
          maxLife: 150,
          type: particleConfig.particleType
        })
      }
      setParticles(newParticles)
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => {
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          particle.life -= 1

          // Bounce off edges
          if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
          if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1

          // Reset if dead
          if (particle.life <= 0) {
            particle.x = Math.random() * canvas.width
            particle.y = Math.random() * canvas.height
            particle.life = particle.maxLife
          }

          return particle
        })

        // Draw particles
        updatedParticles.forEach(particle => {
          const alpha = particle.life / particle.maxLife
          ctx.globalAlpha = alpha * 0.8

          if (particle.type === 'dot') {
            ctx.fillStyle = particleConfig.particleColor
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
            
            // Add glow effect
            ctx.shadowBlur = 10
            ctx.shadowColor = particleConfig.accentColor
            ctx.fill()
            ctx.shadowBlur = 0
          } else if (particle.type === 'spark') {
            ctx.strokeStyle = particleConfig.particleColor
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5)
            ctx.stroke()
          } else if (particle.type === 'line') {
            ctx.strokeStyle = particleConfig.accentColor
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particle.x + particle.vx * 10, particle.y + particle.vy * 10)
            ctx.stroke()
          }
        })

        ctx.globalAlpha = 1
        return updatedParticles
      })

      requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [particleConfig])

  // Handle loader animation and progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 60)

    // Hide loader after 3 seconds
    const loaderTimeout = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => {
        setShowUI(true)
      }, 200)
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(loaderTimeout)
    }
  }, [])

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Shutdown animation
  const handleShutdown = () => {
    setIsShuttingDown(true)
    
    // Fade to black with dying light effect
    setTimeout(() => {
      document.body.style.transition = 'all 3s ease-out'
      document.body.style.filter = 'brightness(0.1) contrast(0.5)'
      document.body.style.background = 'black'
    }, 500)

    // Complete shutdown after 4 seconds
    setTimeout(() => {
      document.body.style.filter = 'brightness(0)'
      // In a real app, this would close the window or redirect
      setTimeout(() => {
        window.location.reload() // Simulate restart
      }, 2000)
    }, 4000)
  }

  const sidebarItems = [
    { id: 'information', icon: FileText, label: 'Information', active: false },
    { id: 'aimbot', icon: Crosshair, label: 'Aimbot', active: true },
    { id: 'visuals', icon: Eye, label: 'Visuals', active: false },
    { id: 'radar', icon: Radar, label: 'Radar', active: false },
    { id: 'config', icon: Settings, label: 'Config', active: false }
  ]

  const GothicToggleSwitch = ({ 
    checked, 
    onChange, 
    color = 'red',
    disabled = false 
  }: { 
    checked: boolean, 
    onChange: () => void,
    color?: 'red' | 'crimson' | 'purple',
    disabled?: boolean
  }) => {
    const colorClasses = {
      red: {
        active: 'bg-red-600 shadow-red-500/50',
        inactive: 'bg-gray-700/50 border-red-900/30',
        thumb: 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-400/30',
        activeThumb: 'bg-gradient-to-r from-green-500 to-green-400 shadow-green-400/50'
      },
      crimson: {
        active: 'bg-red-800 shadow-red-600/50',
        inactive: 'bg-gray-800/50 border-red-900/30',
        thumb: 'bg-gradient-to-r from-red-600 to-red-700 shadow-red-500/30',
        activeThumb: 'bg-gradient-to-r from-green-500 to-green-400 shadow-green-400/50'
      },
      purple: {
        active: 'bg-purple-600 shadow-purple-500/50',
        inactive: 'bg-gray-700/50 border-purple-900/30',
        thumb: 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-400/30',
        activeThumb: 'bg-gradient-to-r from-green-500 to-green-400 shadow-green-400/50'
      }
    }

    const colors = colorClasses[color]

    return (
      <div className="relative inline-block">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="opacity-0 w-0 h-0"
        />
        <div 
          className={`
            relative cursor-pointer w-14 h-7 rounded-full transition-all duration-500 ease-out
            border backdrop-blur-sm
            ${checked 
              ? `${colors.active} shadow-lg` 
              : `${colors.inactive} border-gray-600/50`
            }
            ${!disabled && 'hover:scale-105 hover:shadow-xl'}
            ${disabled && 'opacity-50 cursor-not-allowed'}
          `}
          onClick={!disabled ? onChange : undefined}
        >
          <div 
            className={`
              absolute top-1 w-5 h-5 rounded-full transition-all duration-500 ease-out
              ${checked 
                ? `left-8 ${colors.activeThumb} shadow-lg` 
                : `left-1 ${colors.thumb} shadow-md`
              }
              ${!disabled && 'hover:scale-110'}
            `}
          >
            {/* Inner glow effect */}
            <div className={`
              absolute inset-0 rounded-full 
              ${checked 
                ? 'animate-pulse bg-green-300/20' 
                : 'bg-red-300/10'
              }
            `} />
          </div>
          
          {/* Gothic energy lines */}
          <div className={`
            absolute inset-0 rounded-full overflow-hidden
            ${checked && 'animate-pulse'}
          `}>
            <div className={`
              absolute top-0 left-0 w-full h-full
              bg-gradient-to-r from-transparent via-white/10 to-transparent
              ${checked ? 'animate-ping' : 'opacity-0'}
              transition-opacity duration-500
            `} />
          </div>
        </div>
      </div>
    )
  }

  const GothicSlider = ({ 
    value, 
    onChange, 
    color = 'red',
    disabled = false 
  }: {
    value: number,
    onChange: (value: number) => void,
    color?: 'red' | 'crimson' | 'purple',
    disabled?: boolean
  }) => {
    const colorClasses = {
      red: 'from-red-600 to-red-500',
      crimson: 'from-red-700 to-red-600',
      purple: 'from-purple-600 to-purple-500'
    }

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer
              bg-gray-800/50 backdrop-blur-sm border border-gray-700/50
              slider-gothic-${color}
              ${!disabled && 'hover:shadow-lg hover:shadow-red-500/20'}
              ${disabled && 'opacity-50 cursor-not-allowed'}
              transition-all duration-300
            `}
            style={{
              background: `linear-gradient(to right, 
                rgb(239 68 68) 0%, 
                rgb(239 68 68) ${value}%, 
                rgba(55, 65, 81, 0.5) ${value}%, 
                rgba(55, 65, 81, 0.5) 100%)`
            }}
          />
          
          {/* Progress glow effect */}
          <div 
            className="absolute top-0 left-0 h-full rounded-lg pointer-events-none transition-all duration-300"
            style={{
              width: `${value}%`,
              background: `linear-gradient(to right, 
                rgba(239, 68, 68, 0.3) 0%, 
                rgba(239, 68, 68, 0.1) 100%)`,
              filter: 'blur(2px)'
            }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">0</span>
          <span className={`
            text-sm font-mono font-bold
            ${value > 50 ? 'text-red-400' : 'text-gray-400'}
            transition-colors duration-300
          `}>
            {value}
          </span>
          <span className="text-xs text-gray-400">100</span>
        </div>
      </div>
    )
  }

  const ColorPicker = ({ 
    value, 
    onChange, 
    colors 
  }: { 
    value: string, 
    onChange: (color: string) => void,
    colors: string[]
  }) => (
    <div className="flex space-x-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`
            w-6 h-6 rounded-full border-2 transition-all duration-300
            ${value === color 
              ? 'border-white shadow-lg scale-110' 
              : 'border-gray-600 hover:scale-105'
            }
          `}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-black via-red-950/20 to-black text-red-100' 
        : 'bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50 text-gray-900'
    }`}>
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ opacity: particleConfig.enabled ? 0.6 : 0 }}
      />

      {/* Gothic Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-red-600/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-red-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Shutdown Modal */}
      {showShutdownModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className={`
            backdrop-blur-md rounded-xl p-8 border transition-all duration-500 max-w-md w-full mx-4
            ${darkMode 
              ? 'bg-red-950/40 border-red-900/50 shadow-2xl shadow-red-500/20' 
              : 'bg-red-50/40 border-red-200/50 shadow-2xl shadow-red-300/20'
            }
          `}>
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-red-600/20 border border-red-500/30">
                  <Power size={32} className="text-red-500" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-red-400 tracking-wider mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  SYSTEM SHUTDOWN
                </h2>
                <p className="text-red-300/70">
                  Are you sure you want to terminate PARADOX XERECA 69?
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowShutdownModal(false)}
                  className={`
                    flex-1 py-3 px-6 rounded-lg border transition-all duration-300
                    ${darkMode 
                      ? 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50' 
                      : 'bg-gray-100/50 border-gray-300/50 text-gray-700 hover:bg-gray-200/50'
                    }
                    hover:scale-105 font-medium tracking-wide
                  `}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleShutdown}
                  className="flex-1 py-3 px-6 rounded-lg bg-red-600 border border-red-500 text-white hover:bg-red-700 transition-all duration-300 hover:scale-105 font-medium tracking-wide shadow-lg shadow-red-500/30"
                >
                  SHUTDOWN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shutdown Animation Overlay */}
      {isShuttingDown && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black transition-all duration-[4000ms] ease-out">
          <div className="text-center space-y-8">
            <div 
              className="text-6xl font-bold tracking-[8px] transition-all duration-[3000ms] ease-out"
              style={{ 
                fontFamily: 'Orbitron, sans-serif',
                background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.8))',
                animation: 'fadeToBlack 3s ease-out forwards'
              }}
            >
              XERECA PARADOX
            </div>
            <div className="text-red-400/60 text-lg tracking-wider animate-pulse">
              System terminating...
            </div>
          </div>
        </div>
      )}

      {/* Loader Screen */}
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-[1200ms] cubic-bezier-[0.77,0,0.175,1] ${
          !isLoading ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a0005 50%, #000000 100%)'
        }}
      >
        {/* Progress Bar */}
        <div className="w-[300px] h-1 bg-red-950/30 rounded-sm overflow-hidden relative border border-red-900/50">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-100 ease-out shadow-lg shadow-red-500/50"
            style={{ width: `${progress}%` }}
          />
          {/* Glow effect */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500/50 to-red-400/50 blur-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* XERECA 69 Text */}
        <div 
          className={`mt-8 text-[48px] font-bold uppercase tracking-[12px] transition-opacity duration-1000 delay-1000 ${
            progress > 20 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
          }}
        >
          XERECA 69
        </div>

        {/* Loading subtitle */}
        <div className={`mt-4 text-red-400 text-sm tracking-wider uppercase opacity-70 ${
          progress > 50 ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-1000`}>
          Initializing Paradox Systems...
        </div>
      </div>

      {/* Main UI */}
      <div 
        className={`min-h-screen flex transition-opacity duration-[1500ms] delay-[3500ms] ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Sidebar */}
        <div 
          className={`
            backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col border-r relative z-20
            ${darkMode 
              ? 'bg-black/40 border-red-900/30 shadow-lg shadow-red-500/10' 
              : 'bg-white/40 border-red-200/30 shadow-lg shadow-red-200/10'
            }
            ${sidebarCollapsed ? 'w-16' : 'w-64'}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-red-900/30 flex items-center justify-between">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                p-2 rounded-lg transition-all duration-300 hover:scale-110
                ${darkMode 
                  ? 'hover:bg-red-900/20 hover:shadow-red-500/20' 
                  : 'hover:bg-red-100/20 hover:shadow-red-300/20'
                }
                hover:shadow-lg
              `}
            >
              {sidebarCollapsed ? 
                <Menu size={20} className="text-red-400" /> : 
                <X size={20} className="text-red-400" />
              }
            </button>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`
                    p-2 rounded-lg transition-all duration-300 hover:scale-110
                    ${darkMode 
                      ? 'hover:bg-red-900/20 text-red-400' 
                      : 'hover:bg-red-100/20 text-red-600'
                    }
                    hover:shadow-lg
                  `}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <span className="text-sm text-red-400 font-medium tracking-wider">PARADOX</span>
              </div>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 mb-2
                    group hover:scale-105
                    ${activeSection === item.id
                      ? `${darkMode 
                          ? 'bg-red-900/30 text-red-300 border-r-2 border-red-500 shadow-lg shadow-red-500/20' 
                          : 'bg-red-100/30 text-red-700 border-r-2 border-red-500 shadow-lg shadow-red-300/20'
                        }`
                      : `${darkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-100/20'
                        } hover:shadow-md`
                    }
                  `}
                >
                  <div className="relative">
                    <IconComponent size={20} className="transition-all duration-300 group-hover:scale-110" />
                    {activeSection === item.id && (
                      <div className="absolute inset-0 animate-ping">
                        <IconComponent size={20} className="opacity-30" />
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="font-medium tracking-wide">{item.label}</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Shutdown Button */}
          <div className="p-4 border-t border-red-900/30">
            <button
              onClick={() => setShowShutdownModal(true)}
              className={`
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300
                group hover:scale-105 bg-red-900/40 border border-red-700/50
                hover:bg-red-800/50 hover:shadow-lg hover:shadow-red-500/30
              `}
            >
              <div className="relative">
                <Power size={20} className="text-red-400 transition-all duration-300 group-hover:scale-110" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-medium tracking-wide text-red-300">SHUTDOWN</span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-20">
          {/* Top Header */}
          <header className={`
            backdrop-blur-md border-b transition-all duration-300 px-6 py-4
            ${darkMode 
              ? 'bg-black/40 border-red-900/30 shadow-lg shadow-red-500/10' 
              : 'bg-white/40 border-red-200/30 shadow-lg shadow-red-200/10'
            }
          `}>
            <div className="flex items-center justify-between">
              <div>
                <h1 
                  className="text-3xl font-bold tracking-wider" 
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.3))'
                  }}
                >
                  PARADOX XERECA 69
                </h1>
                <p className="text-sm text-red-400/70 tracking-wide">01.06.2024 - 03.03.2025</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Crown size={16} className="text-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-300">Platinum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-red-400" />
                  <span className="text-sm text-red-300">Xereca</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-red-400" />
                  <span className="text-sm text-red-300">22:12:27</span>
                </div>
                <button className={`
                  p-2 rounded-lg transition-all duration-300 hover:scale-110
                  ${darkMode 
                    ? 'hover:bg-red-900/20' 
                    : 'hover:bg-red-100/20'
                  }
                  hover:shadow-lg
                `}>
                  <Settings size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {activeSection === 'config' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Particle System Configuration */}
                <div className={`
                  backdrop-blur-md rounded-xl p-6 border transition-all duration-500 hover:scale-[1.02]
                  ${darkMode 
                    ? 'bg-red-950/20 border-red-900/30 shadow-lg shadow-red-500/10' 
                    : 'bg-red-50/20 border-red-200/30 shadow-lg shadow-red-300/10'
                  }
                  hover:shadow-xl group lg:col-span-2
                `}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`
                      p-3 rounded-lg transition-all duration-300 group-hover:scale-110
                      ${darkMode ? 'bg-red-900/30' : 'bg-red-100/30'}
                    `}>
                      <Sparkles size={24} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-400 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      PARTICLE SYSTEM
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Master Toggle */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300 md:col-span-2
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                    `}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="text-lg font-semibold text-red-300 tracking-wide">Enable Particles</label>
                          <p className="text-xs text-red-400/60">Activate neural particle effects</p>
                        </div>
                        <GothicToggleSwitch
                          checked={particleConfig.enabled}
                          onChange={() => setParticleConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                          color="red"
                        />
                      </div>
                    </div>

                    {/* Particle Count */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled && 'opacity-50'}
                    `}>
                      <label className="text-sm font-medium text-red-300 tracking-wide block mb-3">Particle Count</label>
                      <p className="text-xs text-red-400/60 mb-4">Number of active particles</p>
                      <GothicSlider
                        value={particleConfig.count}
                        onChange={(value) => setParticleConfig(prev => ({ ...prev, count: value }))}
                        color="red"
                        disabled={!particleConfig.enabled}
                      />
                    </div>

                    {/* Particle Speed */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled && 'opacity-50'}
                    `}>
                      <label className="text-sm font-medium text-red-300 tracking-wide block mb-3">Particle Speed</label>
                      <p className="text-xs text-red-400/60 mb-4">Movement velocity intensity</p>
                      <GothicSlider
                        value={particleConfig.speed * 10}
                        onChange={(value) => setParticleConfig(prev => ({ ...prev, speed: value / 10 }))}
                        color="crimson"
                        disabled={!particleConfig.enabled}
                      />
                    </div>

                    {/* Particle Size */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled && 'opacity-50'}
                    `}>
                      <label className="text-sm font-medium text-red-300 tracking-wide block mb-3">Particle Size</label>
                      <p className="text-xs text-red-400/60 mb-4">Radius of particles</p>
                      <GothicSlider
                        value={particleConfig.particleSize}
                        onChange={(value) => setParticleConfig(prev => ({ ...prev, particleSize: value }))}
                        color="red"
                        disabled={!particleConfig.enabled}
                      />
                    </div>

                    {/* Particle Life */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled && 'opacity-50'}
                    `}>
                      <label className="text-sm font-medium text-red-300 tracking-wide block mb-3">Particle Life</label>
                      <p className="text-xs text-red-400/60 mb-4">Duration of particles</p>
                      <GothicSlider
                        value={particleConfig.particleLife}
                        onChange={(value) => setParticleConfig(prev => ({ ...prev, particleLife: value }))}
                        color="crimson"
                        disabled={!particleConfig.enabled}
                      />
                    </div>

                    {/* Gravity */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled && 'opacity-50'}
                    `}>
                      <label className="text-sm font-medium text-red-300 tracking-wide block mb-3">Gravity</label>
                      <p className="text-xs text-red-400/60 mb-4">Vertical force applied to particles</p>
                      <GothicSlider
                        value={particleConfig.gravity * 100 + 50}
                        onChange={(value) => setParticleConfig(prev => ({ ...prev, gravity: (value - 50) / 100 }))}
                        color="purple"
                        disabled={!particleConfig.enabled}
                      />
                    </div>

                    {/* Opacity */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled && 'opacity-50'}
                    `}>
                      <label className="text-sm font-medium text-red-300 tracking-wide block mb-3">Opacity</label>
                      <p className="text-xs text-red-400/60 mb-4">Particle transparency level</p>
                      <GothicSlider
                        value={particleConfig.opacity * 100}
                        onChange={(value) => setParticleConfig(prev => ({ ...prev, opacity: value / 100 }))}
                        color="red"
                        disabled={!particleConfig.enabled}
                      />
                    </div>

                    {/* Particle Type */}
                    <div className={`
                      p-4 rounded-lg border transition-all duration-300 md:col-span-2
                      ${darkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/10 border-red-200/20'}
                      ${!particleConfig.enabled