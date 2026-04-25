import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getSettingsModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Settings', {
      default_language: { type: String, default: 'javascript' },
      strictness_level: { type: String, default: 'standard', enum: ['lenient', 'standard', 'strict'] },
      focus_areas: { type: [String], default: ['quality', 'security', 'performance'] }
    });
  }
  return _model;
}
