// src/components/common/userProfile/ChangePasswordPopup.tsx
import React, { useState, useCallback } from 'react';
import { authService } from '../../../services/authService';
import { useTranslation } from '../../../hooks/useTranslation';
import { PasswordRequirements } from '../../ui';
import { ChangePasswordFormData } from '../../../models/Form';
import './change-password-popup.css';

interface ChangePasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const isNewPasswordValid = useCallback(() => {
    return formData.newPassword.length >= 8;
  }, [formData.newPassword]);

  const doPasswordsMatch = useCallback(() => {
    return formData.newPassword === formData.confirmPassword;
  }, [formData.newPassword, formData.confirmPassword]);

  const isFormValid = useCallback(() => {
    return (
      formData.currentPassword.trim() !== '' &&
      isNewPasswordValid() &&
      doPasswordsMatch() &&
      formData.newPassword !== formData.currentPassword
    );
  }, [formData.currentPassword, isNewPasswordValid, doPasswordsMatch, formData.newPassword]);

  // Form handlers
  const handleInputChange = (field: keyof ChangePasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.status === 'SUCCESS') {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Call success handler
        onSuccess();
        onClose();
      } else {
        setError(result.message || t('changePassword.errors.failed'));
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err?.message || t('changePassword.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block change-password-popup" tabIndex={-1}>
      <div className="modal-dialog modal-md">
        <div className={`modal-content ${loading ? 'loading' : ''}`}>
          <div className="modal-header">
            <h5 className="modal-title">
              {t('changePassword.title')}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">
                  {t('changePassword.currentPassword')} *
                </label>
                <div className="input-group">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="form-control"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={loading}
                  >
                    <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">
                  {t('changePassword.newPassword')} *
                </label>
                <div className="input-group">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className={`form-control ${
                      formData.newPassword && !isNewPasswordValid() ? 'is-invalid' : ''
                    }`}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  >
                    <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                <PasswordRequirements 
                  password={formData.newPassword}
                  className="mt-2"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">
                  {t('changePassword.confirmPassword')} *
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control ${
                      formData.confirmPassword && !doPasswordsMatch() ? 'is-invalid' : ''
                    }`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                {formData.confirmPassword && !doPasswordsMatch() && (
                  <div className="invalid-feedback d-block">
                    {t('changePassword.errors.passwordsDoNotMatch')}
                  </div>
                )}
              </div>

              {formData.newPassword && formData.currentPassword && 
               formData.newPassword === formData.currentPassword && (
                <div className="alert alert-warning" role="alert">
                  {t('changePassword.errors.samePassword')}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t('changePassword.changing')}
                  </>
                ) : (
                  t('changePassword.submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;