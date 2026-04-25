import { initDB, createModel } from 'lyzr-architect';

let _model: any = null;

export default async function getPasswordResetTokenModel() {
  if (!_model) {
    await initDB();
    _model = createModel('PasswordResetToken', {
      email: { type: String, required: true, index: true },
      tokenHash: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      used: { type: Boolean, default: false }
    });
  }
  return _model;
}
