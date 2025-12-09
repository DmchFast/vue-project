<template>
  <div class="export-panel">
    <h2>📤 Экспорт палитры</h2>
    
    <div class="export-info">
      <p>Экспортируйте текущую палитру в различные форматы для использования в ваших проектах.</p>
    </div>
    
    <div class="export-controls">
      <div class="format-selection">
        <label>Формат экспорта:</label>
        <select v-model="exportFormat" class="format-select">
          <option value="css">CSS Variables</option>
          <option value="scss">SCSS Variables</option>
          <option value="tailwind">Tailwind Config</option>
          <option value="json">JSON</option>
        </select>
      </div>
      
      <div class="export-actions">
        <button @click="copyToClipboard" class="copy-export-btn">
          Копировать код
        </button>
        <button @click="downloadFile" class="download-btn">
          Скачать файл
        </button>
      </div>
    </div>
    
    <div class="export-preview">
      <h3>Предпросмотр:</h3>
      <pre class="code-block">{{ exportedCode }}</pre>
    </div>
    
    <!-- Уведомление о копировании -->
    <div v-if="showCopyNotification" class="copy-notification">
      <span class="notification-text">Код скопирован!</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ExportPanel',
  props: {
    colors: {
      type: Array,
      default: () => []
    },
    paletteName: {
      type: String,
      default: 'Моя палитра'
    }
  },
  setup(props) {
    const exportFormat = ref('css')
    const showCopyNotification = ref(false)

    const exportedCode = computed(() => {
      if (props.colors.length === 0) {
        return '// Добавьте цвета для экспорта'
      }
      
      const name = props.paletteName.replace(/\s+/g, '-').toLowerCase()
      const timestamp = new Date().toLocaleDateString('ru-RU')
      
      switch (exportFormat.value) {
        case 'css':
          return generateCSSVariables(name, timestamp)
        case 'scss':
          return generateSCSSVariables(name, timestamp)
        case 'tailwind':
          return generateTailwindConfig(name, timestamp)
        case 'json':
          return generateJSON(name, timestamp)
        default:
          return ''
      }
    })

    const generateCSSVariables = (name, date) => {
      return `/* ${props.paletteName} - ${date} */
:root {
${props.colors.map((color, i) => `  --color-${name}-${i + 1}: ${color};`).join('\n')}
}

/* Использование */
.example {
  background-color: var(--color-${name}-1);
  color: var(--color-${name}-2);
  border-color: var(--color-${name}-3);
}`
    }

    const generateSCSSVariables = (name, date) => {
      return `// ${props.paletteName} - ${date}
${props.colors.map((color, i) => `$${name}-${i + 1}: ${color};`).join('\n')}

// Использование
.example {
  background-color: $${name}-1;
  color: $${name}-2;
  border-color: $${name}-3;
}`
    }

    const generateTailwindConfig = (name, date) => {
      return `// ${props.paletteName} - ${date}
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${name}': {
${props.colors.map((color, i) => `          '${i + 1}': '${color}',`).join('\n')}
        }
      }
    }
  }
}

// Использование в классах
// bg-${name}-1
// text-${name}-2
// border-${name}-3`
    }

    const generateJSON = (name, date) => {
      const data = {
        name: props.paletteName,
        created: date,
        colors: props.colors,
        variables: props.colors.reduce((acc, color, i) => {
          acc[`color${i + 1}`] = color
          return acc
        }, {})
      }
      
      return JSON.stringify(data, null, 2)
    }

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(exportedCode.value)
        
        // Показываем уведомление вместо alert
        showCopyNotification.value = true
        setTimeout(() => {
          showCopyNotification.value = false
        }, 2000)
      } catch (error) {
        console.error('Ошибка копирования:', error)
      }
    }

    const downloadFile = () => {
      const filename = `${props.paletteName.replace(/\s+/g, '_')}_${exportFormat.value}`
      const extension = exportFormat.value === 'json' ? '.json' : '.txt'
      const blob = new Blob([exportedCode.value], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      a.href = url
      a.download = filename + extension
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return {
      exportFormat,
      exportedCode,
      showCopyNotification,
      copyToClipboard,
      downloadFile
    }
  }
}
</script>

<style src="./ExportPanel.css"></style>