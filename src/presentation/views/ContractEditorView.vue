<script setup lang="ts">
import { ref, computed } from 'vue';
import PartyInputForm from '../components/PartyInputForm.vue';
import ContractInputArea from '../components/ContractInputArea.vue';
import ContractResultViewer from '../components/ContractResultViewer.vue';

import type { ContractParty, ContractConversionResult } from '../../shared/types/contract';
import type { ExportFormat } from '../../shared/types/export';
import { PdfExtractorDriverImpl } from '../../infrastructure/pdf/pdf-extractor-driver';
import { ExtractPdfTextUseCase } from '../../application/use-cases/extract-pdf-text';
import { ProcessContractUseCase } from '../../application/use-cases/process-contract';
import { ExportContractUseCase } from '../../application/use-cases/export-contract';

const parties = ref<ContractParty[]>([
  { name: '', label: '甲' },
  { name: '', label: '乙' }
]);

const contractText = ref('');
const conversionResult = ref<ContractConversionResult | null>(null);
const isExtractingPdf = ref(false);

const isSidebarOpen = ref(true);
const isMobileDrawerOpen = ref(true);

const pdfExtractor = new PdfExtractorDriverImpl();
const extractPdfUseCase = new ExtractPdfTextUseCase(pdfExtractor);
const processContractUseCase = new ProcessContractUseCase();
const exportContractUseCase = new ExportContractUseCase();

const handleAddParty = () => {
  const heavenlyStems = ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const newIndex = parties.value.length + 1;
  const newPartyLabel = newIndex <= heavenlyStems.length ? heavenlyStems[newIndex - 2] : `名前${newIndex}`;
  parties.value.push({ name: '', label: newPartyLabel });
};

const handleRemoveParty = (index: number) => {
  if (index > 1) {
    parties.value.splice(index, 1);
  }
};

const handlePdfUpload = async (file: File) => {
  isExtractingPdf.value = true;
  try {
    const result = await extractPdfUseCase.execute(file);
    contractText.value = result.text;
  } catch (error) {
    console.error('PDF抽出失敗:', error);
    alert('PDFファイルの読み込みに失敗しました。');
  } finally {
    isExtractingPdf.value = false;
  }
};

const handleConvert = () => {
  conversionResult.value = processContractUseCase.execute(contractText.value, parties.value);
  
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
  
  if (isMobileDrawerOpen.value) {
    isMobileDrawerOpen.value = false;
  }
};

const handleSaveDocument = async (format: ExportFormat) => {
  if (!conversionResult.value) return;

  try {
    const exportedFile = await exportContractUseCase.execute(format, {
      htmlContent: conversionResult.value.htmlContent,
      textContent: conversionResult.value.textContent,
    });

    const url = URL.createObjectURL(exportedFile.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `契約書_変換結果_${new Date().toISOString().slice(0, 10)}.${exportedFile.extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('保存に失敗しました:', error);
    alert('文書の保存に失敗しました。');
  }
};

const isConvertReady = computed(() => {
  const hasText = contractText.value.trim().length > 0;
  const hasValidParty = parties.value.some(party => party.label.trim().length > 0 && party.name.trim().length > 0);
  return hasText && hasValidParty;
});

const hasResult = computed(() => {
  return conversionResult.value?.htmlContent != null && conversionResult.value.htmlContent.length > 0;
});
</script>

<template>
  <div class="bg-background h-[100dvh] flex flex-col font-sans overflow-hidden">
    
    <header class="flex-none bg-white border-b border-border shadow-sm py-3 px-4 z-40 flex items-center justify-between">
      <div class="flex items-center gap-2 md:gap-4">
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="hidden lg:flex p-1.5 text-text-muted hover:text-text hover:bg-gray-100 rounded transition-colors"
          title="サイドバーの切り替え"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
        <button 
          @click="isMobileDrawerOpen = true" 
          class="lg:hidden p-1.5 text-text-muted hover:text-text hover:bg-gray-100 rounded transition-colors relative"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full"></span>
        </button>
        
        <div class="text-sm text-text-muted font-bold flex items-center gap-2 tracking-wide uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          約款甲乙変換エディタ
        </div>
      </div>
      
      <button 
        @click="handleConvert"
        :disabled="!isConvertReady"
        class="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-1.5 px-6 rounded shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span>変換を実行</span>
      </button>
    </header>

    <div class="flex-1 flex overflow-hidden relative">
      
      <aside 
        class="hidden lg:flex flex-col bg-surface border-r border-border transition-all duration-300 overflow-y-auto z-30 shadow-sm"
        :class="isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-none opacity-0'"
      >
        <div class="p-6 w-80">
          <PartyInputForm 
            v-model:parties="parties"
            @add="handleAddParty"
            @remove="handleRemoveParty"
          />
        </div>
      </aside>

      <Transition name="fade">
        <div v-if="isMobileDrawerOpen" class="lg:hidden fixed inset-0 z-50 flex">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="isMobileDrawerOpen = false"></div>
          
          <aside class="relative w-4/5 max-w-[320px] bg-surface h-full shadow-2xl overflow-y-auto flex flex-col transform transition-transform">
            <div class="p-4 flex items-center justify-between border-b border-border bg-gray-50/80 sticky top-0 z-10 backdrop-blur">
              <span class="font-bold text-sm text-text tracking-wide">置換設定</span>
              <button @click="isMobileDrawerOpen = false" class="p-1.5 text-text-muted hover:bg-gray-200 hover:text-text rounded transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <PartyInputForm 
                v-model:parties="parties"
                @add="handleAddParty"
                @remove="handleRemoveParty"
              />
            </div>
          </aside>
        </div>
      </Transition>

      <main class="flex-1 p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-start lg:items-stretch lg:justify-center overflow-y-auto lg:overflow-y-hidden gap-6 lg:gap-8 transition-all duration-700 ease-in-out relative bg-background">
        
        <section 
          class="w-full flex-shrink-0 transition-all duration-700 ease-in-out flex flex-col min-h-0"
          :class="hasResult ? 'max-w-[800px] lg:w-[calc(50%-1rem)] lg:max-w-none h-[800px] lg:h-full' : 'max-w-[800px] h-[800px] lg:h-full'"
        >
          <ContractInputArea 
            v-model:text="contractText"
            :isExtracting="isExtractingPdf"
            @uploadPdf="handlePdfUpload"
            class="h-full"
          />
        </section>

        <Transition name="pane-slide">
          <section 
            id="result-section" 
            v-if="hasResult"
            class="w-full max-w-[800px] lg:max-w-none lg:w-[calc(50%-1rem)] flex-shrink-0 flex flex-col transition-all duration-700 ease-in-out h-[800px] lg:h-full min-h-0"
          >
            <div class="flex items-center gap-4 w-full mb-4 lg:hidden">
              <hr class="flex-1 border-t border-gray-300" />
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest">出力結果</span>
              <hr class="flex-1 border-t border-gray-300" />
            </div>
            
            <ContractResultViewer 
              :result="conversionResult"
              @save="handleSaveDocument"
              class="h-full"
            />
          </section>
        </Transition>
        
      </main>
    </div>
  </div>
</template>

<style scoped>
.pane-slide-enter-active,
.pane-slide-leave-active {
  transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}
.pane-slide-enter-from,
.pane-slide-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
  @media (max-width: 1023px) {
    transform: translateY(30px) scale(0.98);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
