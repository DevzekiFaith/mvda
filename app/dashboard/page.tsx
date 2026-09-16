'use client'

import { useState, useEffect } from 'react'
import DashboardNav from '@/components/DashboardNav'
import { 
  Box, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Settings, 
  Calendar,
  Clock,
  Activity,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Home,
  Search,
  User,
  Menu
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState('Май 2025')
  const [isMobile, setIsMobile] = useState(false)
  const [gradientId, setGradientId] = useState('')

  useEffect(() => {
    // Generate unique gradient IDs to avoid conflicts
    setGradientId(`gradient-${Math.random().toString(36).substr(2, 9)}`)
    
    return () => {
      // Cleanup
      setGradientId('')
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background image overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 z-0"></div>
      
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <DashboardNav />
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button className="text-white">
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Dashboard</h1>
              <p className="text-xs text-slate-400">Управление и аналитика</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around p-4">
          <button className="flex flex-col items-center gap-1 text-emerald-400">
            <Home className="h-6 w-6" />
            <span className="text-xs">Главная</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Search className="h-6 w-6" />
            <span className="text-xs">Поиск</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Календарь</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User className="h-6 w-6" />
            <span className="text-xs">Профиль</span>
          </button>
        </div>
      </div>
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 relative z-10 pt-20 lg:pt-8 pb-24 lg:pb-8">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-slate-400 text-lg">Управление и аналитика</p>
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Геометрия хаоса */}
          <div className="bg-stone-900/80 backdrop-blur-2xl rounded-3xl border border-stone-700/50 shadow-2xl p-4 md:p-6 hover:bg-stone-900/90 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-stone-600 to-stone-800 rounded-2xl flex items-center justify-center">
                <Box className="h-6 w-6 md:h-8 md:w-8 text-stone-300" />
              </div>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">Геометрия хаоса</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Упорядоченный беспорядок</h3>
            <p className="text-stone-400 text-sm">Системный подход к творчеству</p>
          </div>

          {/* Неделя в работе */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-4 md:p-6 hover:bg-white/15 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-white/60 uppercase tracking-widest hidden md:block">Неделя в работе</span>
            </div>
            <h3 className="text-sm font-medium text-white/80 mb-3">Частота загруженности</h3>
            <div className="flex items-end justify-between gap-1 mb-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
                <div key={day} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-white/20 rounded-t-lg mb-1 relative h-12 md:h-16">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all"
                      style={{ height: i === 2 ? '80%' : i === 4 ? '60%' : '40%' }}
                    />
                  </div>
                  <span className="text-xs text-white/60">{day}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <span className="text-2xl md:text-3xl font-bold text-white">16ч</span>
              <span className="text-sm text-white/60 ml-2">за неделю</span>
            </div>
          </div>

          {/* Уровень заряда */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-4 md:p-6 hover:bg-white/15 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/30 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 md:h-8 md:w-8 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-white/60 uppercase tracking-widest hidden md:block">Уровень заряда</span>
            </div>
            <div className="flex gap-2 md:gap-4 mb-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="6" fill="none" 
                    strokeDasharray="176" strokeDashoffset="18" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base md:text-lg font-bold text-white">90%</span>
                </div>
              </div>
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="6" fill="none" 
                    strokeDasharray="176" strokeDashoffset="62" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base md:text-lg font-bold text-white">65%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">В режиме потока</span>
                <div className="w-16 md:w-24 bg-white/20 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Глубокая работа</span>
                <div className="w-16 md:w-24 bg-white/20 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Рабочая аналитика */}
          <div className="bg-stone-900/80 backdrop-blur-2xl rounded-3xl border border-stone-700/50 shadow-2xl p-4 md:p-6 hover:bg-stone-900/90 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">Рабочая аналитика</span>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">1065</div>
                <div className="text-xs text-stone-400 mt-1">Эскиза</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">00</div>
                <div className="text-xs text-stone-400 mt-1">Креатива</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">7</div>
                <div className="text-xs text-stone-400 mt-1">Дней дедлайна</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Настройки проектов */}
          <div className="bg-stone-900/80 backdrop-blur-2xl rounded-3xl border border-stone-700/50 shadow-2xl p-4 md:p-6 hover:bg-stone-900/90 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">Настройки проектов</span>
            </div>
            
            <div className="mb-4 md:mb-6">
              <h4 className="text-sm font-semibold text-white mb-3">Фишки процесса</h4>
              <div className="space-y-2">
                {['Гибкие проекты', 'Полное погружение', 'Скорость и качество'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Этапы в часах</h4>
              <div className="space-y-2 md:space-y-3">
                {[
                  { name: 'Исследование', progress: 20 },
                  { name: 'Идеи', progress: 50 },
                  { name: 'Визуализация', progress: 80 },
                  { name: 'Доработки', progress: 40 },
                  { name: 'Результат', progress: 10 }
                ].map((stage, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">{stage.name}</span>
                      <span className="text-white">{stage.progress}%</span>
                    </div>
                    <div className="w-full bg-stone-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Число заказов */}
          <div className="bg-stone-900/80 backdrop-blur-2xl rounded-3xl border border-stone-700/50 shadow-2xl p-4 md:p-6 hover:bg-stone-900/90 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-500/20 to-pink-600/30 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-pink-400" />
              </div>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">Число заказов</span>
            </div>
            
            <h4 className="text-sm font-semibold text-white mb-4">Частота в зависимости от месяца</h4>
            
            <div className="relative h-24 md:h-32 mb-4">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <path
                  d="M 20 80 Q 60 40 100 60 T 180 30"
                  stroke="#ec4899"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="80" r="4" fill="#ec4899" />
                <circle cx="60" cy="55" r="4" fill="#d946ef" />
                <circle cx="100" cy="60" r="4" fill="#c026d3" />
                <circle cx="140" cy="45" r="4" fill="#a855f7" />
                <circle cx="180" cy="30" r="4" fill="#8b5cf6" />
              </svg>
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="text-center">
                <div className="text-emerald-400 font-semibold">+90%</div>
                <div className="text-stone-400">Фев</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-400 font-semibold">+40%</div>
                <div className="text-stone-400">Мар</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-400 font-semibold">+10%</div>
                <div className="text-stone-400">Апр</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-semibold">-25%</div>
                <div className="text-stone-400">Май</div>
              </div>
            </div>
          </div>

          {/* Календарь */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-4 md:p-6 hover:bg-white/15 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{selectedMonth}</span>
                <button 
                  onClick={() => setSelectedMonth('Июнь 2025')}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-all"
                >
                  Июнь
                </button>
              </div>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {[
                { time: '12.00', task: 'Созвон с клиентом', color: 'emerald' },
                { time: '13.00', task: 'Анализ статистики', color: 'blue' },
                { time: '14.00', task: 'Анализ конкурентов', color: 'purple' },
                { time: '15.00', task: 'Изучение трендов', color: 'pink' }
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <div className={`w-2 h-2 rounded-full bg-${event.color}-400`} />
                  <div className="flex-1">
                    <div className="text-xs text-white/60">{event.time}</div>
                    <div className="text-sm text-white">{event.task}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Рабочее время VS Энергия */}
          <div className="bg-stone-900/80 backdrop-blur-2xl rounded-3xl border border-stone-700/50 shadow-2xl p-4 md:p-6 hover:bg-stone-900/90 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
              </div>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">Рабочее время VS Энергия</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">8.5ч</div>
                <div className="text-sm text-stone-400">Среднее время</div>
                <div className="mt-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-orange-400">Высокая активность</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">92%</div>
                <div className="text-sm text-stone-400">Уровень энергии</div>
                <div className="mt-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Цели достигнуты</span>
                </div>
              </div>
            </div>
          </div>

          {/* Проекты в работе */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-4 md:p-6 hover:bg-white/15 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-white/60 uppercase tracking-widest hidden md:block">Проекты в работе</span>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {[
                { name: 'Редизайн сайта', progress: 75, client: 'TechCorp' },
                { name: 'Брендинг', progress: 45, client: 'StartupXYZ' },
                { name: 'Мобильное приложение', progress: 90, client: 'AppDev' }
              ].map((project, i) => (
                <div key={i} className="p-3 md:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="text-xs text-white/60">{project.client}</div>
                    </div>
                    <span className="text-sm font-semibold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
