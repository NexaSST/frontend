import { describe, expect, it } from 'vitest';
import { moduleStart } from './BranchModuleStart.js';

describe('Branch module onboarding', () => {
  it('offers first asset creation only for an unfiltered empty inventory', () => {
    expect(moduleStart('inspections', { registeredAssets: 0 }, false)?.action).toBe('new');
    expect(moduleStart('inspections', { registeredAssets: 0 }, true)).toBeNull();
    expect(moduleStart('inspections', { registeredAssets: 1 }, false)).toBeNull();
  });
  it('does not infer first APR from empty period activity when finalized documents exist', () => {
    expect(moduleStart('apr', { draftAprs: 0, finalizedAprs: 2, draftWorkPermits: 0, authorizedWorkPermits: 0 }, false)).toBeNull();
    expect(moduleStart('apr', { draftAprs: 0, finalizedAprs: 0, draftWorkPermits: 0, authorizedWorkPermits: 0 }, false)?.permission).toBe('apr.manage');
  });
  it('does not call zero obligations an empty course catalog', () => {
    expect(moduleStart('training', { applicable: 0 }, false)?.action).toBeUndefined();
    expect(moduleStart('training', { applicable: 3 }, false)).toBeNull();
  });
});
