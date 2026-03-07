<script setup lang="ts">
const props = defineProps<{
  text: string;
  isExtracting: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:text', value: string): void;
  (e: 'uploadPdf', file: File): void;
}>();

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('uploadPdf', target.files[0]);
  }
};
</script>

<template>
  <div class="relative w-full h-full flex flex-col">
    <div class="mb-2 flex-none w-full flex justify-between items-center">
      <h2 class="text-sm font-semibold text-text uppercase tracking-wider text-text-muted">原本文書</h2>
      
      <div class="relative">
        <input 
          type="file" 
          accept="application/pdf"
          id="pdf_upload"
          class="hidden"
          @change="handleFileUpload"
          :disabled="isExtracting"
        />
        <label 
          for="pdf_upload" 
          class="flex items-center justify-center px-4 py-1.5 border border-border rounded shadow-sm bg-white hover:bg-gray-50 cursor-pointer text-xs font-medium text-text-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!isExtracting" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <svg v-else class="animate-spin h-4 w-4 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isExtracting ? 'PDFから抽出中...' : 'PDF読込' }}
        </label>
      </div>
    </div>

    <div class="relative flex-1 bg-surface shadow-paper ring-1 ring-black/5 mx-auto w-full flex flex-col p-8 md:p-12 lg:p-16 selection:bg-primary/20 overflow-hidden rounded-sm">
      
      <div v-if="isExtracting" class="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
        <svg class="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-text font-medium text-sm tracking-wider">解析中...</p>
      </div>

      <textarea 
        id="contract_text"
        :value="text"
        @input="(e) => emit('update:text', (e.target as HTMLTextAreaElement).value)"
        class="w-full h-full flex-1 bg-transparent border-none text-text focus:outline-none focus:ring-0 resize-none font-serif text-[15px] leading-8 overflow-y-auto"
        placeholder="ここに契約書などの原本文書を入力、またはPDFから読み込んでください。"
      ></textarea>
    </div>
  </div>
</template>
