import React, { useState, useEffect } from 'react'

const Toast = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getToastStyles = () => {
    const baseStyles = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm'
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`
      case 'error':
        return `${baseStyles} bg-red-500 text-white`
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`
      default:
        return `${baseStyles} bg-blue-500 text-white`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getIcon()}</span>
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  })

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({
      isVisible: true,
      message,
      type,
      duration
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
      duration={toast.duration}
    />
  )

  return {
    showToast,
    hideToast,
    ToastComponent
  }
}

export default Toast