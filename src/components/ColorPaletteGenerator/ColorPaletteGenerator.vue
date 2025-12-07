<template>
  <div class="palette-generator">
    <header class="header">
      <h1>🎨 Генератор цветовых палитр</h1>
    </header>

    <div class="controls">
      <div class="control-group">
        <label for="color-count">Количество цветов:</label>
        <select 
          id="color-count" 
          v-model="colorCount"
        >
          <option value="3">3 цвета</option>
          <option value="5" selected>5 цветов</option>
          <option value="7">7 цветов</option>
        </select>
      </div>

      <div class="control-group">
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

      <div class="control-group buttons">
        <button @click="generateRandomPalette" class="generate-btn">
          🎲 Случайная палитра
        </button>
        <button @click="savePalette" class="save-btn">
          Сохранить
        </button>
      </div>
    </div>

    <div class="palette-container">
      <div v-if="colors.length === 0" class="empty-state">
        <p>Нажмите "Случайная палитра" чтобы сгенерировать первую палитру!</p>
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

    <div class="preview-section">
      <h3>Предпросмотр палитры:</h3>
      
      <div class="preview-controls">
        <button 
          @click="useDarkBg = !useDarkBg" 
          class="theme-toggle-btn"
          :title="useDarkBg ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
        >
          <span class="theme-icon">{{ useDarkBg ? '☀️' : '🌙' }}</span>
          <span class="theme-text">{{ useDarkBg ? 'Светлая тема' : 'Темная тема' }}</span>
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
</template>

<script src="./ColorPaletteGenerator.js"></script>
<style src="./ColorPaletteGenerator.css"></style>