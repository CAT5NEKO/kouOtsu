<script setup lang="ts">
import { ref } from 'vue';
import type { ContractConversionResult } from '../../shared/types/contract';

const props = defineProps<{
  result: ContractConversionResult | null;
}>();

const isCopied = ref(false);

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

const handleDownload = () => {
  if (!props.result?.textContent) return;
  
  const blob = new Blob([props.result.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `契約書_変換結果_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
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

        <button 
          v-if="result?.textContent"
          @click="handleDownload"
          class="flex items-center px-3 py-1.5 bg-primary text-white hover:bg-primary-dark rounded shadow-sm font-medium transition-colors gap-2 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          テキスト保存
        </button>
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
