<template>
  <div 
    class="color-card" 
    :style="{ backgroundColor: color }"
    @click="handleClick"
  >
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

<script src="./ColorCard.js"></script>
<style src="./ColorCard.css"></style>