<template>
  <div class="color-card" :style="{ backgroundColor: color }">
    <div class="color-info">
      <span class="color-value">{{ formattedColor }}</span>
      <div class="color-actions">
        <button 
          @click.stop="toggleLock"
          class="lock-btn"
          :class="{ locked: isLocked }"
          :title="isLocked ? 'Разблокировать' : 'Закрепить'"
          aria-label="Закрепить цвет"
        >
          {{ isLocked ? '🔒' : '🔓' }}
        </button>
        <button 
          @click.stop="copyColor"
          class="copy-btn"
          title="Копировать"
          aria-label="Копировать цвет"
        >
          📋
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorCard',
  props: {
    color: {
      type: String,
      required: true
    },
    format: {
      type: String,
      default: 'hex',
      validator: (value) => ['hex', 'rgb'].includes(value)
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    formattedColor() {
      if (this.format === 'rgb') {
        return this.hexToRgb(this.color)
      }
      return this.color.toUpperCase()
    },
    isDarkColor() {
      if (!this.color || this.color.length < 7) return false
      
      try {
        const r = parseInt(this.color.slice(1, 3), 16)
        const g = parseInt(this.color.slice(3, 5), 16)
        const b = parseInt(this.color.slice(5, 7), 16)
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        return brightness < 128
      } catch {
        return false
      }
    }
  },
  methods: {
    toggleLock() {
      this.$emit('toggle-lock')
    },
    copyColor() {
      this.$emit('copy-color', this.color, this.format)
    },
    hexToRgb(hex) {
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
  },
  emits: ['toggle-lock', 'copy-color']
}
</script>

<style src="./ColorCard.css"></style>