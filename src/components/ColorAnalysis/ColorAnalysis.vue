<template>
  <div class="color-analysis">
    <h2>📊 Анализ доступности</h2>
    
    <div class="analysis-info">
      <p>Проверяйте контрастность цветов по стандарту WCAG для обеспечения доступности.</p>
    </div>
    
    <div class="contrast-checker">
      <div class="contrast-inputs">
        <div class="color-input-group">
          <label>Цвет текста:</label>
          <input type="color" v-model="textColor" class="color-picker">
          <span class="color-value">{{ textColor }}</span>
        </div>
        <div class="color-input-group">
          <label>Цвет фона:</label>
          <input type="color" v-model="backgroundColor" class="color-picker">
          <span class="color-value">{{ backgroundColor }}</span>
        </div>
      </div>
      
      <div class="contrast-result" :class="contrastResult.level">
        <div class="contrast-info">
          <span class="contrast-ratio">Контраст: {{ contrastRatio.toFixed(2) }}:1</span>
          <span class="contrast-level">{{ contrastResult.text }}</span>
        </div>
        <div class="wcag-compliance">
          <div class="wcag-item" :class="{ passed: contrastResult.passesAA }">
            <span>WCAG AA:</span>
            <span>{{ contrastResult.passesAA ? '✅' : '❌' }}</span>
          </div>
          <div class="wcag-item" :class="{ passed: contrastResult.passesAAA }">
            <span>WCAG AAA:</span>
            <span>{{ contrastResult.passesAAA ? '✅' : '❌' }}</span>
          </div>
        </div>
      </div>
      
      <div class="contrast-preview">
        <h3>Предпросмотр:</h3>
        <div
          class="preview-box"
          :style="{
            backgroundColor: backgroundColor,
            color: textColor
          }"
        >
          <h4>Заголовок</h4>
          <p>Это пример текста с выбранными цветами.</p>
          <small>Мелкий текст для тестирования доступности</small>
          <div class="preview-button" :style="{ backgroundColor: textColor, color: backgroundColor }">
            Кнопка
          </div>
        </div>
      </div>
    </div>
    
    <div class="accessibility-info">
      <h3>О стандартам WCAG:</h3>
      <ul>
        <li><strong>WCAG AA</strong> (минимальный уровень) - требует контрастности 4.5:1 для обычного текста</li>
        <li><strong>WCAG AAA</strong> (расширенный уровень) - требует контрастности 7:1 для обычного текста</li>
        <li><strong>Крупный текст</strong> (24px или 19px жирный) - требует 3:1 для AA и 4.5:1 для AAA</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ColorAnalysis',
  setup() {
    const textColor = ref('#000000')
    const backgroundColor = ref('#ffffff')

    const hexToRgb = (hex) => {
      if (!hex || hex.length < 7) return { r: 0, g: 0, b: 0 }
      
      try {
        return {
          r: parseInt(hex.slice(1, 3), 16),
          g: parseInt(hex.slice(3, 5), 16),
          b: parseInt(hex.slice(5, 7), 16)
        }
      } catch {
        return { r: 0, g: 0, b: 0 }
      }
    }

    const getLuminance = (color) => {
      const rgb = hexToRgb(color)
      const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255]
      
      const adjust = (c) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      }
      
      return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)
    }

    const contrastRatio = computed(() => {
      const l1 = getLuminance(textColor.value)
      const l2 = getLuminance(backgroundColor.value)
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      
      return (lighter + 0.05) / (darker + 0.05)
    })

    const contrastResult = computed(() => {
      const ratio = contrastRatio.value
      
      if (ratio >= 7) {
        return {
          level: 'excellent',
          text: 'Отлично (AAA)',
          passesAA: true,
          passesAAA: true
        }
      } else if (ratio >= 4.5) {
        return {
          level: 'good',
          text: 'Хорошо (AA)',
          passesAA: true,
          passesAAA: false
        }
      } else if (ratio >= 3) {
        return {
          level: 'poor',
          text: 'Слабо',
          passesAA: false,
          passesAAA: false
        }
      } else {
        return {
          level: 'fail',
          text: 'Недостаточно',
          passesAA: false,
          passesAAA: false
        }
      }
    })

    return {
      textColor,
      backgroundColor,
      contrastRatio,
      contrastResult
    }
  }
}
</script>

<style src="./ColorAnalysis.css"></style>