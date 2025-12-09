<template>
  <div class="palette-library">
    <h2>📚 Библиотека палитр</h2>
    
    <div class="library-header">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию..."
          class="search-input"
        >
        <button class="clear-search" @click="searchQuery = ''" v-if="searchQuery">
          ×
        </button>
      </div>
      
      <select v-model="filterBy" class="filter-select">
        <option value="all">Все палитры</option>
        <option value="favorite">Избранные</option>
        <option value="recent">Недавние</option>
      </select>
    </div>
    
    <div v-if="filteredPalettes.length === 0" class="empty-library">
      <p>Нет сохранённых палитр</p>
    </div>
    
    <div v-else class="palettes-grid">
      <div
        v-for="palette in filteredPalettes"
        :key="palette.id"
        class="saved-palette"
        :class="{ favorite: palette.isFavorite }"
      >
        <div class="palette-header">
          <h4>{{ palette.name }}</h4>
          <div class="palette-actions">
            <button
              @click="toggleFavorite(palette.id)"
              class="fav-btn"
              :title="palette.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
            >
              {{ palette.isFavorite ? '★' : '☆' }}
            </button>
            <button
              @click="loadPalette(palette)"
              class="load-btn"
              title="Загрузить"
            >
              ↻
            </button>
            <button
              @click="deletePalette(palette.id)"
              class="delete-btn"
              title="Удалить"
            >
              ×
            </button>
          </div>
        </div>
        
        <div class="palette-colors">
          <div
            v-for="color in palette.colors"
            :key="color"
            class="saved-color"
            :style="{ backgroundColor: color }"
            :title="color"
          ></div>
        </div>
        
        <div class="palette-footer">
          <span class="palette-date">{{ formatDate(palette.createdAt) }}</span>
          <span class="palette-count">{{ palette.colors.length }} цветов</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'PaletteLibrary',
  props: {
    currentColors: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const palettes = ref([])
    const searchQuery = ref('')
    const filterBy = ref('all')

    const loadPalettes = () => {
      try {
        const saved = localStorage.getItem('paletteLibrary')
        if (saved) {
          palettes.value = JSON.parse(saved)
        }
      } catch (error) {
        console.error('Ошибка загрузки библиотеки:', error)
        palettes.value = []
      }
    }

    const savePalettes = () => {
      try {
        localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
      } catch (error) {
        console.error('Ошибка сохранения библиотеки:', error)
      }
    }

    const filteredPalettes = computed(() => {
      let filtered = [...palettes.value]
      
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(palette => 
          palette.name.toLowerCase().includes(query)
        )
      }
      
      if (filterBy.value === 'favorite') {
        filtered = filtered.filter(palette => palette.isFavorite)
      } else if (filterBy.value === 'recent') {
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5)
      }
      
      return filtered
    })

    const loadPalette = (palette) => {
      emit('palette-loaded', palette.colors)
    }

    const toggleFavorite = (id) => {
      const palette = palettes.value.find(p => p.id === id)
      if (palette) {
        palette.isFavorite = !palette.isFavorite
        savePalettes()
      }
    }

    const deletePalette = (id) => {
      palettes.value = palettes.value.filter(p => p.id !== id)
      savePalettes()
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }

    onMounted(() => {
      loadPalettes()
    })

    return {
      palettes,
      searchQuery,
      filterBy,
      filteredPalettes,
      loadPalette,
      toggleFavorite,
      deletePalette,
      formatDate
    }
  },
  emits: ['palette-loaded']
}
</script>

<style src="./PaletteLibrary.css"></style>