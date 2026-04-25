import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getReviewModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Review', {
      code_snippet_preview: { type: String, required: true },
      language: { type: String, required: true },
      report_json: { type: Object, required: true },
      quality_score: { type: Number, required: true },
      security_issues_count: { type: Number, required: true },
      performance_issues_count: { type: Number, required: true }
    });
  }
  return _model;
}
