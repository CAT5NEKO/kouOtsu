<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ContractConversionResult } from '../../shared/types/contract';
import type { ExportFormat } from '../../shared/types/export';

const props = defineProps<{
  result: ContractConversionResult | null;
}>();

const emit = defineEmits<{
  (event: 'save', format: ExportFormat): void;
}>();

const isCopied = ref(false);
const selectedFormat = ref<ExportFormat>('txt');
const isFormatMenuOpen = ref(false);
const formatMenuRef = ref<HTMLElement | null>(null);

const exportFormats: Array<{ value: ExportFormat; label: string }> = [
  { value: 'txt', label: 'TXT' },
  { value: 'docx', label: 'DOCX' },
  { value: 'odt', label: 'ODT' },
  { value: 'pdf', label: 'PDF' },
];

const selectedFormatLabel = computed(() => {
  const current = exportFormats.find((format) => format.value === selectedFormat.value);
  return current?.label ?? 'TXT';
});

const handleCopy = async () => {
  if (!props.result?.textContent) return;
  
  try {
    await navigator.clipboard.writeText(props.result.textContent);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy', error);
  }
};

const handleSave = () => {
  if (!props.result?.textContent) return;
  emit('save', selectedFormat.value);
};

const toggleFormatMenu = () => {
  isFormatMenuOpen.value = !isFormatMenuOpen.value;
};

const handleSelectFormat = (format: ExportFormat) => {
  selectedFormat.value = format;
  isFormatMenuOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (!isFormatMenuOpen.value) return;
  if (!formatMenuRef.value) return;

  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!formatMenuRef.value.contains(target)) {
    isFormatMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative w-full h-full flex flex-col">
    <div class="mb-2 flex-none w-full flex justify-between items-center">
      <h2 class="text-sm font-semibold text-text uppercase tracking-wider text-text-muted">出力文書</h2>
      
      <div class="flex gap-2">
        <button 
          v-if="result?.textContent"
          @click="handleCopy"
          class="flex items-center px-4 py-1.5 border border-border rounded shadow-sm bg-white hover:bg-gray-50 text-xs font-medium text-text-muted transition-colors"
        >
          <span v-if="!isCopied" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            コピー
          </span>
          <span v-else class="flex items-center gap-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            コピー完了
          </span>
        </button>

        <div v-if="result?.textContent" ref="formatMenuRef" class="relative">
          <div class="flex items-stretch rounded shadow-sm overflow-hidden">
            <button
              @click="handleSave"
              class="flex items-center px-3 py-1.5 bg-primary text-white hover:bg-primary-dark font-medium transition-colors gap-2 text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ selectedFormatLabel }}保存
            </button>

            <button
              @click.stop="toggleFormatMenu"
              class="px-2 py-1.5 bg-primary text-white hover:bg-primary-dark border-l border-primary-dark/50 transition-colors"
              aria-label="保存形式を選択"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div
            v-if="isFormatMenuOpen"
            class="absolute right-0 mt-1 min-w-30 bg-white border border-border rounded shadow-md z-20"
          >
            <button
              v-for="format in exportFormats"
              :key="format.value"
              @click="handleSelectFormat(format.value)"
              class="w-full text-left px-3 py-2 text-xs text-text hover:bg-gray-50"
              :class="selectedFormat === format.value ? 'bg-gray-100 font-semibold' : ''"
            >
              {{ format.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div 
      class="relative flex-1 bg-surface shadow-paper ring-1 ring-black/5 mx-auto w-full flex flex-col p-8 md:p-12 lg:p-16 selection:bg-primary/20 overflow-hidden rounded-sm"
    >
      <div 
        v-if="result?.htmlContent"
        class="w-full h-full text-text font-serif text-[15px] leading-8 whitespace-pre-wrap outline-none overflow-y-auto"
        v-html="result.htmlContent"
      ></div>
      
      <div 
        v-else
        class="flex-1 flex flex-col items-center justify-center text-text-muted opacity-40 space-y-4 font-sans h-full"
      >
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-base text-center">変換結果がここに表示されます<br><span class="text-xs">（変換を実行してください）</span></p>
      </div>
    </div>
  </div>
</template>

<style>
.text-primary {
  color: #3b82f6 !important;
}
.font-bold {
  font-weight: 700 !important;
}
</style>
