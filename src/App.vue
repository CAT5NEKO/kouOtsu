<template>
  <div id="app">
    <div class="top-header" :class="{'hidden': isHidden}">
      <h1>契約書文字変換ツール</h1>
      <p>契約書の文章中の甲や乙などの特定の文字列を自分の名前や相手の企業に合わせた文字に変換します。</p>
      <p>pdfファイルをアップロードして文章を変換することもできます。</p>
    </div>
    <div class="container">
      <!-- 入力フォーム -->
      <div class="form-container flex-container column-container">
        <div class="flex-container column-container" v-for="(party, index) in parties" :key="index">
          <div class="flex-container">
            <div>
              <label :for="'party' + (index + 1) + '_label'">{{ `${index + 1}の変換対象：` }}</label>
              <input type="text" v-model="parties[index].label" :id="'party' + (index + 1) + '_label'" class="input-field" />
            </div>

            <div>
              <label :for="'party' + (index + 1) + '_name'">{{ '変換したい名前：' }}</label>
              <input type="text" v-model="parties[index].name" :id="'party' + (index + 1) + '_name'" class="input-field" />
            </div>
          </div>

          <button @click="removeParty(index)" v-if="index > 1" class="remove-party-button">削除</button>
        </div>

        <button @click="addParty" class="add-party-button">名前追加</button>

        <label for="contractText">契約書の文章：</label>
        <textarea v-model="contractText" id="contractText" rows="5" class="textarea-field"></textarea>
        <div>
          <label for="pdfFileInput">契約書 (PDF) から文章入力：</label>
          <input id="pdfFileInput" type="file" accept="application/pdf" class="input-field" @change="uploadPDFFile" />
        </div>

        <button @click="generateContract" class="generate-button">変換</button>
      </div>

      <!-- 変換後のコンテンツ -->
      <div class="result-container" v-if="generatedContract">
        <h2>変換された文章</h2>
        <div v-html="generatedContract" class="generated-contract"></div>
        <button @click="copyContract" class="generate-button">コピー</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import PDFJsWorker from "pdfjs-dist/legacy/build/pdf.worker.min?worker";

export default {
  data() {
    return {
      isHidden: false,
      parties: [{ name: "", label: "甲" }, { name: "", label: "乙" }],
      contractText: "",
      generatedContract: "",
      generatedContractText: "",
    };
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isHidden = window.scrollY > 0;
    },
    generateContract() {
      let replacedContract = this.contractText;
      let replacedContractText = this.contractText;
      const labelSet = new Set();

      for (const { name, label } of this.parties) {
        if (label === "" || labelSet.has(label)) {
          this.generatedContract = "";
          this.generatedContractText = "";
          return;
        }

        labelSet.add(label);
        const className = `party${label.slice(-1)}`;
        const color = '#4caf50';
        const pattern = new RegExp(label, 'g');
        replacedContract = replacedContract.replace(pattern, `<span class="${className}" style="color: ${color};">${name}</span>`);
        replacedContractText = replacedContractText.replace(pattern, name);
      }

      if (replacedContractText === "") {
        this.generatedContract = "";
        this.generatedContractText = "";
      } else {
        this.generatedContract = replacedContract;
        this.generatedContractText = replacedContractText;
      }
    },
    addParty() {
      const heavenlyStems = ["丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
      const newIndex = this.parties.length + 1;
      const newPartyLabel = newIndex <= heavenlyStems.length ? heavenlyStems[newIndex - 2] : `名前${newIndex}`;
      this.parties.push({ name: "", label: newPartyLabel });
    },
    removeParty(index) {
      if (index > 1) {
        this.parties.splice(index, 1);
      }
    },
    async uploadPDFFile(e) {
      pdfjs.GlobalWorkerOptions.workerPort = new PDFJsWorker();
      const pdfFile = e.target.files.item(0);

      if (pdfFile === null) {
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        const pdf = await pdfjs.getDocument({ data: reader.result, cMapUrl: "./public/cmaps/" }).promise;
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
    async copyContract() {
      await navigator.clipboard.writeText(this.generatedContractText);
      alert("クリップボードにコピーしました！");
    }
  },
};
</script>

<style>
#app {
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0a1f31;
  color: #d6f1eb;
}

.top-header {
  position: fixed;
  font-family: "Arial", sans-serif;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #0a1f31;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: top 0.3s;
}

.top-header.hidden {
  top: -100px;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-family: "Arial", sans-serif;
}

.remove-party-button,
.add-party-button,
.generate-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: "Arial", sans-serif;
}

.remove-party-button {
  background-color: #d9534f;
}

.add-party-button {
  background-color: #008cba;
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
  font-family: "Arial", sans-serif;
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
  font-family: "Arial", sans-serif;
}

.result-container {
  text-align: left;
  font-family: "Arial", sans-serif;
  overflow-y: auto;
  max-height: 500px;
}

.generated-contract {
  font-size: 18px;
  color: #333;
  white-space: pre-line;
  padding: 10px;
  border-radius: 5px;
  font-family: "Arial", sans-serif;
}

@media (max-width: 768px) {
  .top-header {
    padding: 7px;
    font-size: small;
  }

  .container {
    padding-top: 120px;
    width: 100%;
  }

  .form-container {
    width: 90%;
    margin-right: 0;
  }

  .input-field,
  .textarea-field {
    font-size: 14px;
  }

  .generate-button {
    font-size: 16px;
  }

  .generated-contract {
    font-size: 16px;
    margin-top: 20px;
  }
}
</style>

