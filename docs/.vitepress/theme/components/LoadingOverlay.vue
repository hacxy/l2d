<script lang="ts" setup>
defineProps<{
  progress: number
  currentFile: string
}>();
</script>

<template>
  <div class="loading-overlay">
    <div class="loading-panel">
      <span class="corner tl" />
      <span class="corner tr" />
      <span class="corner bl" />
      <span class="corner br" />
      <div class="title-area">
        <h2 class="title-main">
          L2D
        </h2>
        <p class="title-sub">
          LIVE2D LOADING SYSTEM
        </p>
      </div>
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">LOADING</span>
          <span class="progress-percent">{{ progress }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>
        <p class="progress-file">
          <span class="file-prefix">&gt;&nbsp;</span>{{ currentFile || 'INITIALIZING...' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$accent: #bd34fe;
$accent-dim: rgba(189, 52, 254, 0.3);

.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #07071a;
  background-image: radial-gradient(rgba(189, 52, 254, 0.06) 1px, transparent 1px);
  background-size: 28px 28px;
}

.loading-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 420px;
  padding: 48px 40px;
  background: rgba(7, 7, 26, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid $accent-dim;
  box-shadow:
    0 0 40px rgba(189, 52, 254, 0.12),
    inset 0 0 40px rgba(189, 52, 254, 0.03);
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;

  &.tl {
    top: -1px;
    left: -1px;
    border-top: 2px solid $accent;
    border-left: 2px solid $accent;
  }
  &.tr {
    top: -1px;
    right: -1px;
    border-top: 2px solid $accent;
    border-right: 2px solid $accent;
  }
  &.bl {
    bottom: -1px;
    left: -1px;
    border-bottom: 2px solid $accent;
    border-left: 2px solid $accent;
  }
  &.br {
    bottom: -1px;
    right: -1px;
    border-bottom: 2px solid $accent;
    border-right: 2px solid $accent;
  }
}

.title-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title-main {
  margin: 0;
  font-size: 64px;
  font-weight: 900;
  letter-spacing: 0.25em;
  line-height: 1;
  color: #fff;
  animation: title-glow 2s ease-in-out infinite alternate;
}

.title-sub {
  margin: 0;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.35em;
  color: rgba(255, 255, 255, 0.3);
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-label {
  font-size: 10px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.35);
}

.progress-percent {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #fff;
}

.progress-track {
  width: 100%;
  height: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $accent-dim;
  animation: track-pulse 2s ease-in-out infinite alternate;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7b16d4, $accent, #d66cff, $accent, #7b16d4);
  background-size: 250% 100%;
  box-shadow: 0 0 12px rgba(189, 52, 254, 0.8);
  transition: width 0.3s ease;
  animation: progress-wave 2.5s linear infinite;
}

.progress-file {
  margin: 0;
  overflow: hidden;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.4);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-prefix {
  color: $accent;
}

@keyframes title-glow {
  from {
    filter: drop-shadow(0 0 8px rgba(189, 52, 254, 0.5));
  }
  to {
    filter: drop-shadow(0 0 20px rgba(189, 52, 254, 0.9));
  }
}

@keyframes track-pulse {
  from {
    box-shadow: 0 0 4px rgba(189, 52, 254, 0.2);
  }
  to {
    box-shadow:
      0 0 12px rgba(189, 52, 254, 0.6),
      0 0 24px rgba(189, 52, 254, 0.2);
  }
}

@keyframes progress-wave {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
