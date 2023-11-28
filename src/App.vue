<template>
  <div id="app">
    <div class="container">
      <div class="form-container flex-container">
        <label for="partyA">甲の名前：</label>
        <input type="text" v-model="partyA" id="partyA" class="input-field" />

        <label for="partyB">乙の名前：</label>
        <input type="text" v-model="partyB" id="partyB" class="input-field" />

        <div class="flex-container" v-for="(party, index) in parties" :key="index">
          <label :for="'party' + (index + 3)">{{ `${index + 3}の変換対象：` }}</label>
          <input type="text" v-model="parties[index].label" :id="'party' + (index + 3) + '_label'" class="input-field" />

          <label :for="'party' + (index + 3) + '_name'">{{ '変換したい名前：' }}</label>
          <input type="text" v-model="parties[index].name" :id="'party' + (index + 3) + '_name'" class="input-field" />

          <button @click="removeParty(index)" class="remove-party-button">削除</button>
        </div>

        <button @click="addParty" class="add-party-button">名前追加</button>

        <label for="contractText">契約書の文章：</label>
        <textarea v-model="contractText" id="contractText" rows="5" class="textarea-field"></textarea>

        <button @click="generateContract" class="generate-button">変換</button>
      </div>

      <div v-if="generatedContract" class="result-container">
        <h2>変換されました！</h2>
        <div v-html="formattedContract" class="generated-text-box"></div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      partyA: "",
      partyB: "",
      parties: [],
      contractText: "",
      generatedContract: "",
    };
  },
  computed: {
    formattedContract() {
      let namesAndClasses = this.parties.map(({ name, label }, index) => {
        return {
          name,
          label,
          class: `party${index + 3}`
        };
      });

      let replacedContract = this.contractText;

      replacedContract = replacedContract.replace(/甲/g, `<span class="partyA">${this.partyA}</span>`)
          .replace(/乙/g, `<span class="partyB">${this.partyB}</span>`);

      this.parties.forEach(({ name, label }) => {
        const className = `party${label.slice(-1)}`;
        const color = '#4caf50';
        replacedContract = replacedContract.replace(new RegExp(label, 'g'), `<span class="${className}" style="color: ${color};">${name}</span>`);
      });


      return replacedContract;
    },
  },
  methods: {
    generateContract() {
      // 生成された契約書を表示
      this.generatedContract = this.formattedContract;
    },
    addParty() {
      const newPartyLabel = `名前${this.parties.length + 3}`;
      this.parties.push({ name: "", label: newPartyLabel });
    },
    removeParty(index) {
      this.parties.splice(index, 1);
    },
  },
};
</script>


<style>
#app {
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f8ff;
  color: #282828;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-party-button {
  background-color: #d9534f;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
}

.add-party-button {
  background-color: #008CBA;
  color: white;
  padding: 6px 12px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.form-container {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
  margin-right: 20px;
}

.flex-container {
  display: flex;
  flex-direction: column;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
}

.generate-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.result-container {
  text-align: center;
}

.generated-text-box {
  font-size: 18px;
  color: #333;
  white-space: pre-line;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
}

.partyA {
  color: #4caf50;
}

.partyB {
  color: #4caf50;
}

</style>
