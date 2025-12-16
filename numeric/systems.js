import { createBackend, createSENBackend } from './simulate'

// Default numeric systems wired to the simple simulate backend.
export const DefaultNumericSystems = [
  {
    name: 'FP32', bitWidth: 32, exponentBits: 8, mantissaBits: 23,
    roundingMode: 'nearest', accumulation: 'same', implementation: createBackend('FP32', 8, 23, 'nearest', 'same')
  },
  {
    name: 'FP16', bitWidth: 16, exponentBits: 5, mantissaBits: 10,
    roundingMode: 'nearest', accumulation: 'widened', implementation: createBackend('FP16', 5, 10, 'nearest', 'widened')
  },
  {
    name: 'BF16', bitWidth: 16, exponentBits: 8, mantissaBits: 7,
    roundingMode: 'nearest', accumulation: 'widened', implementation: createBackend('BF16', 8, 7, 'nearest', 'widened')
  },
  {
    name: 'FP8_E4M3', bitWidth: 8, exponentBits: 4, mantissaBits: 3,
    roundingMode: 'nearest', accumulation: 'widened', implementation: createBackend('FP8_E4M3', 4, 3, 'nearest', 'widened')
  },
  {
    name: 'FP8_E5M2', bitWidth: 8, exponentBits: 5, mantissaBits: 2,
    roundingMode: 'nearest', accumulation: 'widened', implementation: createBackend('FP8_E5M2', 5, 2, 'nearest', 'widened')
  },
  // --- Threefold SEN (Proprietary) ---
  {
    name: 'SEN', bitWidth: 16, exponentBits: 6, mantissaBits: 9, // Example params, adjust as needed
    roundingMode: 'nearest', accumulation: 'same',
    // Swap this for your custom backend when ready
    implementation: createSENBackend('SEN', 6, 9, 'nearest', 'same')
  }
]

export default DefaultNumericSystems
