<script setup lang="ts">
import type { ContractParty } from '../../shared/types/contract';

const props = defineProps<{
  parties: ContractParty[]
}>();

const emit = defineEmits<{
  (e: 'update:parties', parties: ContractParty[]): void;
  (e: 'add'): void;
  (e: 'remove', index: number): void;
}>();

const updateLabel = (index: number, value: string) => {
  const newParties = [...props.parties];
  newParties[index].label = value;
  emit('update:parties', newParties);
};

const updateName = (index: number, value: string) => {
  const newParties = [...props.parties];
  newParties[index].name = value;
  emit('update:parties', newParties);
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm font-semibold text-text">置換プロパティ</span>
      <button 
        @click="emit('add')"
        class="text-xs text-primary hover:text-primary-dark font-medium px-2 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        追加
      </button>
    </div>
    
    <div class="flex flex-col gap-3">
      <div 
        v-for="(party, index) in parties" 
        :key="index"
        class="flex flex-col gap-3 bg-gray-50/50 border border-border rounded-md px-4 py-4 relative group hover:bg-white hover:shadow-sm transition-all"
      >
        <button 
          v-if="index > 1"
          @click="emit('remove', index)"
          class="absolute -top-2.5 -right-2.5 bg-white border border-border text-gray-500 hover:text-red-500 hover:border-red-200 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
          title="削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <div class="flex flex-col">
          <label :for="`party_${index}_label`" class="text-[10px] uppercase font-bold text-text-muted mb-1.5 tracking-wider">
            置換対象 {{ index + 1 }}
          </label>
          <input 
            type="text" 
            :id="`party_${index}_label`"
            :value="party.label"
            @input="(e) => updateLabel(index, (e.target as HTMLInputElement).value)"
            class="w-full bg-white border border-border rounded px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors shadow-sm"
            placeholder="例: 甲"
          />
        </div>
        
        <div class="flex flex-col">
          <label :for="`party_${index}_name`" class="text-[10px] uppercase font-bold text-text-muted mb-1.5 tracking-wider">
            置換後の名称
          </label>
          <input 
            type="text" 
            :id="`party_${index}_name`"
            :value="party.name"
            @input="(e) => updateName(index, (e.target as HTMLInputElement).value)"
            class="w-full bg-white border border-border rounded px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors shadow-sm"
            placeholder="例: 株式会社〇〇"
          />
        </div>
      </div>
    </div>
  </div>
</template>
