import { useMemo, useRef, useState } from 'react'
import './roulette.css'

const CURRENCY = '₽'

export default function Roulette() {
  const amounts = useMemo(() => [5, 10, 20, 50, 100, 200, 500, 1000, 1000000], [])
  const maxValue = 1000000 // Всегда миллион
  const maxIndex = useMemo(() => amounts.indexOf(maxValue), [amounts, maxValue])

  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [showPushNotification, setShowPushNotification] = useState(false)
  const wheelRef = useRef(null)

  const sectorAngle = 360 / amounts.length

  function playWinSound() {
    // Создаем звуковой эффект выигрыша
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  function handleWithdraw() {
    setShowPushNotification(true)
    // Автоматически скрываем через 5 секунд
    setTimeout(() => setShowPushNotification(false), 5000)
  }

  function getTargetRotation() {
    const baseRotation = rotation % 360
    const loops = 5 + Math.floor(Math.random() * 3) // 5-7 полных оборотов
    const targetSectorAngle = maxIndex * sectorAngle
    const totalRotation = baseRotation + loops * 360 + (360 - targetSectorAngle)
    return totalRotation
  }

  function handleSpin() {
    if (isSpinning) return
    setIsSpinning(true)
    setResult(null)

    const target = getTargetRotation()
    const current = rotation % 360
    
    // Сброс если уже много оборотов
    if (rotation > 3600) {
      setRotation(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateTo(target)
        })
      })
    } else {
      animateTo(target)
    }
  }

  function animateTo(targetRotation) {
    const distance = Math.abs(targetRotation - rotation)
    const seconds = Math.min(5, Math.max(3, distance / 720))
    
    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${seconds}s cubic-bezier(0.15, 0.85, 0.15, 1)`
    }
    setRotation(targetRotation)

    window.clearTimeout((animateTo)._t)
    ;(animateTo)._t = window.setTimeout(() => {
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none'
      }
      setIsSpinning(false)
      setResult(maxValue)
      
      // Всегда показываем уведомление (так как всегда миллион)
      setShowNotification(true)
      // Звуковой эффект
      playWinSound()
      // Автоматически скрываем через 4 секунды
      setTimeout(() => setShowNotification(false), 4000)
    }, seconds * 1000 + 50)
  }

  return (
    <div className="roulette-root">
      <div className="header">
        <h1>Ультра рулетка</h1>
        <p className="sub">Выпадает гарантированный миллион: {maxValue.toLocaleString('ru-RU')} {CURRENCY}</p>
      </div>

      <div className="roulette">
        <div className="wheel-container">
          <div className="wheel" ref={wheelRef} style={{ transform: `rotate(${rotation}deg)` }}>
            {amounts.map((value, index) => {
              const angle = index * sectorAngle
              const isMax = value === maxValue
              return (
                <div
                  key={value}
                  className={`sector ${isMax ? 'highlight' : ''}`}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    '--sector-angle': `${sectorAngle}deg`
                  }}
                >
                  <div className="sector-content">
                    <span className="value">{value.toLocaleString('ru-RU')}</span>
                    <span className="currency">{CURRENCY}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="pointer" />
        </div>

        <div className="controls">
          <button className="btn" onClick={handleSpin} disabled={isSpinning}>
            {isSpinning ? 'Крутится…' : 'Крутить'}
          </button>
          <button className="btn btn-withdraw" onClick={handleWithdraw}>
            Вывод
          </button>
          {result != null && (
            <div className="result" role="status">
              Выпало: <b>{result.toLocaleString('ru-RU')} {CURRENCY}</b>
            </div>
          )}
        </div>
      </div>

      {showNotification && (
        <div className="notification-overlay">
          <div className="notification">
            <div className="notification-icon">🎉</div>
            <div className="notification-title">Поздравляем!</div>
            <div className="notification-message">
              Вы выиграли <strong>1,000,000 ₽</strong>!
            </div>
            <div className="notification-subtitle">
              Это максимальный выигрыш!
            </div>
          </div>
        </div>
      )}

      {showPushNotification && (
        <div className="push-notification">
          <div className="push-content">
            <div className="push-header">
              <div className="push-app-icon">
                <div className="push-icon-bg">900</div>
              </div>
              <div className="push-app-info">
                <div className="push-app-name">MIR-4212</div>
                <div className="push-time">now</div>
              </div>
            </div>
            <div className="push-body">
              <div className="push-title">Зачислен перевод 1 000 000р</div>
              <div className="push-subtitle">Альфа-Банк</div>
              <div className="push-balance">Баланс: 1 000 134р.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


