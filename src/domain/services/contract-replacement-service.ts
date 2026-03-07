import type { ContractParty, ContractConversionResult } from '../../shared/types/contract';

export class ContractReplacementService {
  public replace(sourceText: string, parties: ContractParty[]): ContractConversionResult {
    let htmlContent = sourceText;
    let textContent = sourceText;
    const labelSet = new Set<string>();

    for (const { name, label } of parties) {
      if (label === "" || labelSet.has(label) || name === "") {
        continue;
      }
      if (label === "" || labelSet.has(label)) {
          return { htmlContent: "", textContent: "" };
      }

      labelSet.add(label);
      const className = 'text-primary font-bold';
      const pattern = new RegExp(label, 'g');
      
      htmlContent = htmlContent.replace(pattern, `<span class="${className}">${name}</span>`);
      textContent = textContent.replace(pattern, name);
    }

    if (textContent === "") {
      return { htmlContent: "", textContent: "" };
    }

    return { htmlContent, textContent };
  }
}
