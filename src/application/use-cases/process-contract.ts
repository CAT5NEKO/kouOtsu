import type { ContractParty, ContractConversionResult } from '../../shared/types/contract';
import { ContractReplacementService } from '../../domain/services/contract-replacement-service';

export class ProcessContractUseCase {
  private readonly replacementService: ContractReplacementService;

  constructor() {
    this.replacementService = new ContractReplacementService();
  }

  public execute(sourceText: string, parties: ContractParty[]): ContractConversionResult {
    return this.replacementService.replace(sourceText, parties);
  }
}
