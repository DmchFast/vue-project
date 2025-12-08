<template>
  <div class="palette-generator">
    <header class="header">
      <h1>🎨 Генератор цветовых палитр</h1>
    </header>

    <!-- Навигация по вкладкам -->
    <nav class="tabs-navigation">
      <button
        @click="activeTab = 'generator'"
        :class="{ active: activeTab === 'generator' }"
        class="tab-button"
      >
        🎲 Генератор
      </button>
      <button
        @click="activeTab = 'analysis'"
        :class="{ active: activeTab === 'analysis' }"
        class="tab-button"
      >
        📊 Анализ
      </button>
    </nav>

    <!-- Вкладка Генератор -->
    <div v-if="activeTab === 'generator'" class="tab-content">
      <!-- Основные контролы - ТЕПЕРЬ 6 ЭЛЕМЕНТОВ В ОДНОЙ ЛИНИИ -->
      <div class="controls">
        <div class="control-group name-group">
          <label for="palette-name">Название палитры:</label>
          <input
            id="palette-name"
            type="text"
            v-model="paletteName"
            placeholder="Введите название"
            class="name-input"
          >
        </div>

        <div class="control-group count-group">
          <label for="color-count">Количество цветов:</label>
          <select id="color-count" v-model="colorCount">
            <option value="3">3 цвета</option>
            <option value="5">5 цветов</option>
            <option value="7">7 цветов</option>
          </select>
        </div>

        <div class="control-group type-group">
          <label for="palette-type">Тип палитры:</label>
          <select id="palette-type" v-model="paletteType">
            <option value="random">Случайная</option>
            <option value="analogous">Аналогичная</option>
            <option value="monochromatic">Монохромная</option>
            <option value="triadic">Триада</option>
            <option value="complementary">Комплементарная</option>
          </select>
        </div>

        <!-- БАЗОВЫЙ ЦВЕТ БЕЗ HEX ЗНАЧЕНИЯ -->
        <div class="control-group base-color-group">
          <label for="base-color">Базовый цвет:</label>
          <input
            id="base-color"
            type="color"
            v-model="baseColor"
            class="color-picker-input"
            title="Выберите базовый цвет"
          >
        </div>

        <div class="control-group format-group">
          <label>Формат отображения:</label>
          <div class="format-buttons">
            <button 
              @click="colorFormat = 'hex'" 
              :class="{ active: colorFormat === 'hex' }"
            >
              HEX
            </button>
            <button 
              @click="colorFormat = 'rgb'" 
              :class="{ active: colorFormat === 'rgb' }"
            >
              RGB
            </button>
          </div>
        </div>

        <!-- Кнопки в одну линию с другими контролами -->
        <div class="control-group buttons-group">
          <button @click="generateRandomPalette" class="generate-btn">
            🎲 Сгенерировать
          </button>
          <button @click="savePalette" class="save-btn">
            💾 Сохранить
          </button>
        </div>
      </div>

      <!-- Основная палитра -->
      <div class="palette-container">
        <div v-if="colors.length === 0" class="empty-state">
          <p>Нажмите "Сгенерировать" чтобы создать первую палитру!</p>
        </div>

        <div v-else class="palette">
          <ColorCard
            v-for="(color, index) in colors"
            :key="index"
            :color="color"
            :format="colorFormat"
            :is-locked="isColorLocked(index)"
            @toggle-lock="() => toggleColorLock(index)"
            @copy-color="copyToClipboard"
          />
        </div>
      </div>

      <!-- Предпросмотр -->
      <div class="preview-section">
        <h3>Предпросмотр палитры:</h3>
        
        <div class="preview-controls">
          <button 
            @click="useDarkBg = !useDarkBg" 
            class="theme-toggle-btn"
            :title="useDarkBg ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
          >
            <span class="theme-icon">{{ useDarkBg ? '☀️' : '🌙' }}</span>
            <span class="theme-text">{{ useDarkBg ? 'Светлая тема' : 'Тёмная тема' }}</span>
          </button>
        </div>

        <div class="preview" :class="{ dark: useDarkBg }">
          <div class="ui-mockup">
            <div class="mockup-header" :style="{ backgroundColor: colors[0] || '#667eea' }">
              <h4>Заголовок</h4>
            </div>
            <div class="mockup-content">
              <button class="mockup-btn" :style="{ backgroundColor: colors[1] || '#764ba2' }">
                Кнопка
              </button>
              <div class="mockup-card" :style="{ backgroundColor: colors[2] || '#f6d365' }">
                <p>Карточка с контентом</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Вкладка Анализ -->
    <div v-else-if="activeTab === 'analysis'" class="tab-content">
      <ColorAnalysis />
    </div>

    <!-- Уведомление о сохранении (скрытое) -->
    <div v-if="showSaveNotification" class="save-notification">
      <span class="notification-text">Палитра сохранена в localStorage!</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import ColorCard from '../ColorCard/ColorCard.vue'
import ColorAnalysis from '../ColorAnalysis/ColorAnalysis.vue'

export default {
  name: 'ColorPaletteGenerator',
  components: {
    ColorCard,
    ColorAnalysis
  },
  setup() {
    // Реактивные переменные
    const colors = ref([])
    const colorCount = ref(5)
    const colorFormat = ref('hex')
    const lockedIndices = ref(new Set())
    const useDarkBg = ref(false)
    const paletteName = ref('')
    const paletteType = ref('analogous')
    const baseColor = ref('#667eea') // Базовый цвет
    const activeTab = ref('generator')
    
    // Уведомление о сохранении
    const showSaveNotification = ref(false)

    const savePalette = () => {
      saveToLocalStorage()
      
      // Показываем уведомление
      showSaveNotification.value = true
      setTimeout(() => {
        showSaveNotification.value = false
      }, 2000)
    }

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

    const hexToHsl = (hex) => {
      if (!hex || hex.length < 7) return { h: 0, s: 0, l: 0 }
      
      try {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255
        
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h, s, l = (max + min) / 2
        
        if (max === min) {
          h = s = 0
        } else {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          
          switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
            case g: h = ((b - r) / d + 2) * 60; break
            case b: h = ((r - g) / d + 4) * 60; break
          }
        }
        
        return {
          h: Math.round(h),
          s: Math.round(s * 100),
          l: Math.round(l * 100)
        }
      } catch {
        return { h: 0, s: 0, l: 0 }
      }
    }

    const generatePaletteByType = () => {
      const baseHsl = hexToHsl(baseColor.value)
      const newColors = []
      
      for (let i = 0; i < colorCount.value; i++) {
        if (lockedIndices.value.has(i) && colors.value[i]) {
          newColors.push(colors.value[i])
        } else {
          let hue = baseHsl.h
          let saturation = baseHsl.s
          let lightness = baseHsl.l
          
          switch (paletteType.value) {
            case 'analogous':
              hue = (baseHsl.h + (i - Math.floor(colorCount.value / 2)) * 30) % 360
              if (hue < 0) hue += 360
              break
            case 'monochromatic':
              lightness = Math.max(20, Math.min(80, baseHsl.l - 20 + i * 10))
              break
            case 'triadic':
              hue = (baseHsl.h + i * 120) % 360
              break
            case 'complementary':
              hue = i === 0 ? baseHsl.h : (baseHsl.h + 180) % 360
              break
            default: // random
              hue = Math.floor(Math.random() * 360)
              saturation = 70 + Math.floor(Math.random() * 20)
              lightness = 50 + Math.floor(Math.random() * 20)
          }
          
          newColors.push(hslToHex(hue, saturation, lightness))
        }
      }
      
      colors.value = newColors
      saveToLocalStorage()
    }

    const saveToLocalStorage = () => {
      try {
        const data = {
          colors: colors.value,
          lockedIndices: Array.from(lockedIndices.value),
          colorCount: colorCount.value,
          colorFormat: colorFormat.value,
          paletteType: paletteType.value,
          baseColor: baseColor.value,
          paletteName: paletteName.value
        }
        localStorage.setItem('colorPalette', JSON.stringify(data))
      } catch (error) {
        console.error('Ошибка сохранения:', error)
      }
    }

    const loadFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem('colorPalette')
        if (!saved) {
          generatePaletteByType()
          return
        }
        
        const data = JSON.parse(saved)
        colors.value = data.colors || []
        lockedIndices.value = new Set(data.lockedIndices || [])
        colorCount.value = data.colorCount || 5
        colorFormat.value = data.colorFormat || 'hex'
        paletteType.value = data.paletteType || 'analogous'
        baseColor.value = data.baseColor || '#667eea'
        paletteName.value = data.paletteName || ''
        
        if (colors.value.length === 0) {
          generatePaletteByType()
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        generatePaletteByType()
      }
    }

    const copyToClipboard = (color, format) => {
      try {
        let textToCopy = color
        if (format === 'rgb') {
          const r = parseInt(color.slice(1, 3), 16)
          const g = parseInt(color.slice(3, 5), 16)
          const b = parseInt(color.slice(5, 7), 16)
          textToCopy = `rgb(${r}, ${g}, ${b})`
        }
        
        navigator.clipboard.writeText(textToCopy)
      } catch (error) {
        console.error('Ошибка копирования:', error)
      }
    }

    const toggleColorLock = (index) => {
      if (lockedIndices.value.has(index)) {
        lockedIndices.value.delete(index)
      } else {
        lockedIndices.value.add(index)
      }
      saveToLocalStorage()
    }

    const isColorLocked = (index) => {
      return lockedIndices.value.has(index)
    }

    watch(colorCount, (newVal, oldVal) => {
      if (newVal > oldVal) {
        for (let i = oldVal; i < newVal; i++) {
          if (!lockedIndices.value.has(i)) {
            const hsl = hexToHsl(baseColor.value)
            const hue = (hsl.h + i * 30) % 360
            colors.value.push(hslToHex(hue, hsl.s, hsl.l))
          } else if (colors.value[i]) {
            colors.value.push(colors.value[i])
          } else {
            colors.value.push(hslToHex(Math.random() * 360, 70, 50))
          }
        }
      } else {
        colors.value = colors.value.slice(0, newVal)
        const newLocked = new Set()
        lockedIndices.value.forEach(idx => {
          if (idx < newVal) newLocked.add(idx)
        })
        lockedIndices.value = newLocked
      }
      saveToLocalStorage()
    })

    watch([paletteType, baseColor], () => {
      generatePaletteByType()
    })

    watch(paletteName, () => {
      saveToLocalStorage()
    })

    onMounted(() => {
      loadFromLocalStorage()
    })

    return {
      colors,
      colorCount,
      colorFormat,
      paletteType,
      baseColor,
      paletteName,
      useDarkBg,
      activeTab,
      showSaveNotification,
      generateRandomPalette: generatePaletteByType,
      savePalette,
      copyToClipboard,
      toggleColorLock,
      isColorLocked
    }
  }
}
</script>

<style src="./ColorPaletteGenerator.css"></style>