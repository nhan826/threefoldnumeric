/**
 * SEN-SFP Main Export
 * Re-exports all core, export, and test functionality
 */

// Core types
const coreTypes = require('./core/types');

// Core operations
const coreHelpers = require('./core/helpers');
const coreSpecials = require('./core/specials');
const coreOps = require('./core/ops');
const coreRounding = require('./core/rounding');
const coreNormalize = require('./core/normalize');

// Exports
const exportsModule = require('./exports/index');

// Tests
const testsModule = require('./tests/index');

// Re-export everything
module.exports = {
  // Types
  ...coreTypes,
  
  // Helpers
  ...coreHelpers,
  
  // Specials
  ...coreSpecials,
  
  // Operations
  ...coreOps,
  
  // Rounding
  ...coreRounding,
  
  // Normalize
  ...coreNormalize,
  
  // Exports
  ...exportsModule,
  
  // Tests
  ...testsModule
};
