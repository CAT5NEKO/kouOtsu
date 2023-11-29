<template>
  <div id="app">
    <div class="container">
      <div class="form-container flex-container column-container">
        <div class="flex-container column-container" v-for="(party, index) in parties" :key="index">
          <div class="flex-container">
            <div>
              <label :for="'party' + (index + 1)">{{ `${index + 1}の変換対象：` }}</label>
              <input type="text" v-model="parties[index].label" :id="'party' + (index + 1) + '_label'" class="input-field" />
            </div>

            <div>
              <label :for="'party' + (index + 1) + '_name'">{{ '変換したい名前：' }}</label>
              <input type="text" v-model="parties[index].name" :id="'party' + (index + 1) + '_name'" class="input-field" />
            </div>
          </div>

          <button @click="removeParty(index)" v-if="1 < index" class="remove-party-button">削除</button>
        </div>

        <button @click="addParty" class="add-party-button">名前追加</button>

        <label for="contractText">契約書の文章：</label>
        <textarea v-model="contractText" id="contractText" rows="5" class="textarea-field"></textarea>
        <div>
          <label for="pdfFileInput">契約書 (PDF) の文章アップロード：</label>
          <input id="pdfFileInput" type="file" accept="application/pdf" class="input-field" @change="uploadPDFFile" />
        </div>

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
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";

export default {
  data() {
    return {
      parties: ["甲", "乙"].map((l) => ({ name: "", label: l })),
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
      let replacedContractText = this.contractText;

      this.parties.forEach(({ name, label }) => {
        const className = `party${label.slice(-1)}`;
        const color = '#4caf50';
        const pattern = new RegExp(label, 'g');
        replacedContract = replacedContract.replace(pattern, `<span class="${className}" style="color: ${color};">${name}</span>`);
        replacedContractText = replacedContractText.replace(pattern, name);
      });

      if (replacedContractText === "") {
        return "";
      }

      return replacedContract;
    },
  },
  methods: {
    generateContract() {
      // 生成された契約書を表示
      this.generatedContract = this.formattedContract;
    },
    addParty() {
      const heavenlyStems = ["丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
      let newPartyLabel = "";

      if (this.parties.length - 2 < heavenlyStems.length) {
        newPartyLabel = heavenlyStems[this.parties.length - 2];
      } else {
        newPartyLabel = `名前${this.parties.length + 1}`;
      }

      this.parties.push({ name: "", label: newPartyLabel });
    },
    removeParty(index) {
      this.parties.splice(index, 1);
    },
    async uploadPDFFile(e) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
      const pdfFile = e.target.files.item(0);

      if (pdfFile === null) {
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        const pdf = await pdfjs.getDocument({ data: reader.result }).promise;
        let pdfText = [];

        for (let p = 1; p <= pdf.numPages; p++) {
          const pdfPage = await pdf.getPage(p);
          const pdfContent = await pdfPage.getTextContent();
          pdfText = pdfText.concat(
            pdfContent.items.filter((i) => "str" in i).map((i) => i.str),
          );
        }

        this.contractText = pdfText.join("\n");
      });
      reader.readAsArrayBuffer(pdfFile);
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
}

.column-container {
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

</style>
