import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getAnalysisModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Analysis', {
      project_name: { type: String, required: true },
      code_snippet_preview: { type: String, required: true },
      languages: { type: [String], default: [] },
      health_score: { type: Number, required: true },
      architecture: { type: String, default: '' },
      report_json: { type: Object, required: true },
      functions_count: { type: Number, default: 0 },
      classes_count: { type: Number, default: 0 },
      tech_debt_level: { type: String, default: 'low' },
      todos_count: { type: Number, default: 0 },
      dependencies_count: { type: Number, default: 0 }
    });
  }
  return _model;
}
