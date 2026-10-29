import { describe, expect, it } from 'vitest';
import { storeInstructions } from '../../src/mastra/instructions/store.instruction';

describe('store agent truth and working-memory instructions', () => {
  it('requires verified catalog facts and rejects fabricated data', () => {
    expect(storeInstructions).toContain('Never invent or assume Malawi Store data');
    expect(storeInstructions).toContain('Do not present imaginary categories');
    expect(storeInstructions).toContain('current catalog tools do not provide sales-volume data');
  });

  it('defines the category and get-product memory triggers', () => {
    expect(storeInstructions).toContain('Keep at most 6 unique verified slugs');
    expect(storeInstructions).toContain('only after a successful get-product');
    expect(storeInstructions).toContain('Do not update it after list-products');
    expect(storeInstructions).toContain('Never store prices');
    expect(storeInstructions).toContain('never use limit 0');
    expect(storeInstructions).toContain('returned field names such as in_stock');
  });
});
