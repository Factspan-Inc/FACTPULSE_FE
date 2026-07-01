import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../store/data-store';

export default function ProjectFormPage() {
  const { accountId: paramAccountId, projectId } = useParams();
  const navigate = useNavigate();
  const { accounts, projects, addProject, updateProject } = useDataStore();

  const isEdit = Boolean(projectId);
  const project = isEdit ? projects.find((p) => p.id === projectId) : null;

  const [selectedAccountId, setSelectedAccountId] = useState(paramAccountId || '');
  const [name, setName] = useState('');
  const [managementType, setManagementType] = useState<'FS_MANAGED' | 'CLIENT_MANAGED'>('FS_MANAGED');
  
  // Factspan Managed Metrics
  const [sprintVelocity, setSprintVelocity] = useState<number | ''>('');
  const [throughputRate, setThroughputRate] = useState<number | ''>('');
  
  // Shared Metrics
  const [staffingCount, setStaffingCount] = useState<number | ''>('');
  const [staffingHealth, setStaffingHealth] = useState<number | ''>(100);
  
  // Compliance
  const [wbrCompliance, setWbrCompliance] = useState(false);
  const [mbrCompliance, setMbrCompliance] = useState(false);
  const [qbrCompliance, setQbrCompliance] = useState(false);

  // NPS
  const [npsScore, setNpsScore] = useState<number | ''>('');

  useEffect(() => {
    if (isEdit && project) {
      setSelectedAccountId(project.accountId);
      setName(project.name);
      setManagementType(project.managementType);
      setSprintVelocity(project.sprintVelocity ?? '');
      setThroughputRate(project.throughputRate ?? '');
      setStaffingCount(project.staffingCount ?? '');
      setStaffingHealth(project.staffingHealth ?? 100);
      setWbrCompliance(project.wbrCompliance ?? false);
      setMbrCompliance(project.mbrCompliance ?? false);
      setQbrCompliance(project.qbrCompliance ?? false);
      setNpsScore(project.npsScore ?? '');
    }
  }, [isEdit, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedAccountId) return;

    const payload = {
      name,
      managementType,
      sprintVelocity: managementType === 'FS_MANAGED' && sprintVelocity !== '' ? Number(sprintVelocity) : undefined,
      throughputRate: managementType === 'FS_MANAGED' && throughputRate !== '' ? Number(throughputRate) : undefined,
      staffingCount: staffingCount !== '' ? Number(staffingCount) : undefined,
      staffingHealth: staffingHealth !== '' ? Number(staffingHealth) : undefined,
      wbrCompliance,
      mbrCompliance,
      qbrCompliance,
      npsScore: npsScore !== '' ? Number(npsScore) : undefined,
    };

    if (isEdit && projectId) {
      await updateProject(projectId, payload);
      navigate(`/accounts/${selectedAccountId}/projects/${projectId}`);
    } else {
      const newId = await addProject({
        accountId: selectedAccountId,
        status: 'ACTIVE',
        health: 'GREEN',
        ...payload,
      });
      navigate(`/accounts/${selectedAccountId}/projects/${newId}`);
    }
  };

  const handleCancel = () => {
    if (paramAccountId) {
      navigate(`/accounts/${paramAccountId}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
      <button
        onClick={handleCancel}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: 0,
          marginBottom: '24px',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        ← Back
      </button>

      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px' }}>
        <h1 style={{ margin: '0 0 32px 0', fontSize: '24px', color: '#1e293b' }}>
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Section: Basic Details */}
          <div style={{ marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Basic Details</h3>
            
            {!paramAccountId && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  Account *
                </label>
                <select
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={isEdit}
                >
                  <option value="">Select an Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                Project Name *
              </label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile Checkout Redesign"
              />
            </div>

            <div style={{ marginBottom: '0' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                Management Type *
              </label>
              <select
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
                value={managementType}
                onChange={(e) => setManagementType(e.target.value as 'FS_MANAGED' | 'CLIENT_MANAGED')}
              >
                <option value="FS_MANAGED">Factspan Managed (FS_MANAGED)</option>
                <option value="CLIENT_MANAGED">Client Managed (CLIENT_MANAGED)</option>
              </select>
            </div>
          </div>

          {/* Section: Performance Metrics */}
          {managementType === 'FS_MANAGED' && (
            <div style={{ marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Delivery Metrics</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                    Sprint Velocity (pts)
                  </label>
                  <input
                    type="number"
                    min="0"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    value={sprintVelocity}
                    onChange={(e) => setSprintVelocity(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                    Throughput Rate (tasks/wk)
                  </label>
                  <input
                    type="number"
                    min="0"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    value={throughputRate}
                    onChange={(e) => setThroughputRate(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Staffing Metrics */}
          <div style={{ marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Staffing Metrics</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  Staffing Count (people)
                </label>
                <input
                  type="number"
                  min="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  value={staffingCount}
                  onChange={(e) => setStaffingCount(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                  Staffing Health (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  value={staffingHealth}
                  onChange={(e) => setStaffingHealth(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
            </div>
          </div>

          {/* Section: Compliance & Governance */}
          <div style={{ marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Compliance & Governance</h3>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={wbrCompliance} onChange={(e) => setWbrCompliance(e.target.checked)} />
                WBR Compliant
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={mbrCompliance} onChange={(e) => setMbrCompliance(e.target.checked)} />
                MBR Compliant
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={qbrCompliance} onChange={(e) => setQbrCompliance(e.target.checked)} />
                QBR Compliant
              </label>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>
                NPS Score
              </label>
              <input
                type="number"
                disabled
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: '#f1f5f9', color: '#94a3b8' }}
                value={npsScore}
                placeholder="NPS is to be populated later by the delivery lead."
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !selectedAccountId}
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                background: !name || !selectedAccountId ? '#94a3b8' : '#0D2A66',
                color: '#fff',
                fontWeight: 600,
                cursor: !name || !selectedAccountId ? 'not-allowed' : 'pointer',
              }}
            >
              {isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
