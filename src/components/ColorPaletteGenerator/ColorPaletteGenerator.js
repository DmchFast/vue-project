import { ref, onMounted, watch } from 'vue'
import ColorCard from '../ColorCard/ColorCard.vue'

export default {
  name: 'ColorPaletteGenerator',
  components: {
    ColorCard
  },
  setup() {
    // Реактивные переменные
    const colors = ref([])
    const colorCount = ref(5)
    const colorFormat = ref('hex')
    const lockedIndices = ref(new Set())
    const useDarkBg = ref(false)

    // Генерация случайного цвета
    const generateRandomColor = () => {
      const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      return '#' + hex
    }

    // HSL в HEX
    const hslToHex = (h, s, l) => {
      s /= 100
      l /= 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs((h / 60) % 2 - 1))
      const m = l - c / 2
      
      let r, g, b
      
      if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0]
      } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0]
      } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x]
      } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c]
      } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c]
      } else {
        [r, g, b] = [c, 0, x]
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    // Конвертация HEX в RGB
    const hexToRgb = (hex) => {
      if (!hex || hex.length < 7) return 'rgb(0, 0, 0)'
      
      try {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgb(${r}, ${g}, ${b})`
      } catch {
        return 'rgb(0, 0, 0)'
      }
    }

    // Генерация гармоничной палитры
    const generateRandomPalette = () => {
      const newColors = []
      
      for (let i = 0; i < colorCount.value; i++) {
        if (lockedIndices.value.has(i) && colors.value[i]) {
          // Сохраняем закрепленные цвета
          newColors.push(colors.value[i])
        } else {
          // Генерация гармоничных цветов
          const hue = Math.floor(Math.random() * 360)
          const saturation = 70 + Math.floor(Math.random() * 20)
          const lightness = 50 + Math.floor(Math.random() * 20)
          
          // Преобразование HSL в HEX
          const color = hslToHex(hue, saturation, lightness)
          newColors.push(color)
        }
      }
      
      colors.value = newColors
      saveToLocalStorage()
    }

    // Сохранение в localStorage
    const saveToLocalStorage = () => {
      try {
        const data = {
          colors: colors.value,
          lockedIndices: Array.from(lockedIndices.value),
          colorCount: colorCount.value,
          colorFormat: colorFormat.value,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('colorPalette', JSON.stringify(data))
      } catch (error) {
        console.error('Ошибка сохранения:', error)
      }
    }

    // Загрузка из localStorage
    const loadFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem('colorPalette')
        if (!saved) {
          generateRandomPalette()
          return
        }
        
        const data = JSON.parse(saved)
        colors.value = data.colors || []
        lockedIndices.value = new Set(data.lockedIndices || [])
        colorCount.value = data.colorCount || 5
        colorFormat.value = data.colorFormat || 'hex'
        
        // Если цвета не загрузились, генерируем новые
        if (colors.value.length === 0) {
          generateRandomPalette()
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        generateRandomPalette()
      }
    }

    // Сохранение палитры (публичный метод)
    const savePalette = () => {
      saveToLocalStorage()
      // Простое оповещение
      alert('Палитра сохранена!')
    }

    // Копирование в буфер обмена
    const copyToClipboard = (color, format) => {
      try {
        let textToCopy = color
        if (format === 'rgb') {
          textToCopy = hexToRgb(color)
        }
        
        navigator.clipboard.writeText(textToCopy)
        alert(`Скопировано: ${textToCopy}`)
      } catch (error) {
        alert('Ошибка копирования')
      }
    }

    // Переключение блокировки
    const toggleColorLock = (index) => {
      if (lockedIndices.value.has(index)) {
        lockedIndices.value.delete(index)
      } else {
        lockedIndices.value.add(index)
      }
      saveToLocalStorage()
    }

    // Проверка блокировки
    const isColorLocked = (index) => {
      return lockedIndices.value.has(index)
    }

    // Наблюдатель за изменением количества цветов
    watch(colorCount, (newVal, oldVal) => {
      if (newVal > oldVal) {
        // Добавить новые случайные цвета
        for (let i = oldVal; i < newVal; i++) {
          colors.value.push(generateRandomColor())
        }
      } else {
        // Удалить лишние цвета
        colors.value = colors.value.slice(0, newVal)
        // Удалить блокировки для удаленных индексов
        const newLocked = new Set()
        lockedIndices.value.forEach(idx => {
          if (idx < newVal) newLocked.add(idx)
        })
        lockedIndices.value = newLocked
      }
      saveToLocalStorage()
    })

    // Наблюдатель за форматом
    watch(colorFormat, () => {
      saveToLocalStorage()
    })

    // При монтировании
    onMounted(() => {
      loadFromLocalStorage()
    })

    return {
      colors,
      colorCount,
      colorFormat,
      useDarkBg,
      generateRandomPalette,
      savePalette,
      copyToClipboard,
      toggleColorLock,
      isColorLocked
    }
  }
}