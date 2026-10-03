import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreGauge } from '../components/ScoreGauge';
import { StatusBadge } from '../components/StatusBadge';
import { ItemListEditor } from '../features/releases/ItemListEditor';
import { QAEvidenceEditor } from '../features/releases/QAEvidenceEditor';
import { ReviewPanel } from '../features/review/ReviewPanel';

describe('Frontend Component Tests', () => {
  it('renders ScoreGauge with ready status when score >= 80 and isReady is true', () => {
    render(<ScoreGauge score={90} isReady={true} size="md" />);
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText(/Ready for Release/i)).toBeInTheDocument();
  });

  it('renders ScoreGauge with not ready status when score < 80', () => {
    render(<ScoreGauge score={40} isReady={false} size="md" />);
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText(/Not Ready/i)).toBeInTheDocument();
  });

  it('renders StatusBadge with correct impact styling', () => {
    render(<StatusBadge type="impact" value="High" />);
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });

  it('ItemListEditor adds and removes items correctly', () => {
    const handleChange = vi.fn();
    const initialItems = [
      { id: '1', code: 'REL-001', category: 'feature', title: 'Feature 1', description: '' }
    ];

    render(
      <ItemListEditor
        items={initialItems}
        onChange={handleChange}
        categoryFilter="feature"
        title="Features"
      />
    );

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Feature 1')).toBeInTheDocument();

    const addButton = screen.getByText('Add Item');
    fireEvent.click(addButton);
    expect(handleChange).toHaveBeenCalled();
  });

  it('QAEvidenceEditor displays records and triggers addition', () => {
    const handleChange = vi.fn();
    const initialEvidence = [
      { id: 'e1', code: 'QA-001', type: 'test_suite', title: 'E2E Regression', details: '40 tests passed', status: 'passed' }
    ];

    render(
      <QAEvidenceEditor
        evidence={initialEvidence}
        onChange={handleChange}
      />
    );

    expect(screen.getByDisplayValue('E2E Regression')).toBeInTheDocument();
    expect(screen.getByDisplayValue('40 tests passed')).toBeInTheDocument();

    const addBtn = screen.getByText('Add QA Evidence');
    fireEvent.click(addBtn);
    expect(handleChange).toHaveBeenCalled();
  });

  it('ReviewPanel displays generated statements and allows inspecting evidence citations', () => {
    const statements = [
      {
        id: 'STMT-001',
        statementType: 'technical_summary',
        originalContent: 'Payment module supports Apple Pay [REL-001].',
        currentContent: 'Payment module supports Apple Pay [REL-001].',
        sourceIdentifiers: ['REL-001'],
        reviewState: 'generated',
        isStale: false
      }
    ];

    const releaseItems = [
      { code: 'REL-001', title: 'Apple Pay Checkout', description: 'One-click iOS checkout', category: 'feature' }
    ];

    render(
      <ReviewPanel
        statements={statements}
        releaseItems={releaseItems}
        qaEvidence={[]}
      />
    );

    expect(screen.getByText(/Payment module supports Apple Pay/i)).toBeInTheDocument();
    expect(screen.getByText('REL-001')).toBeInTheDocument();
    expect(screen.getByText('Accept Statement')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('renders LoginPage with Auto-Fill demo buttons and populates credentials', async () => {
    const { LoginPage } = await import('../pages/LoginPage');
    const { AuthProvider } = await import('../context/AuthContext');
    const { MemoryRouter } = await import('react-router-dom');

    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    const autoFillBtn = screen.getByText(/Auto-fill Lead Engineer/i);
    expect(autoFillBtn).toBeInTheDocument();
    
    fireEvent.click(autoFillBtn);
    expect(screen.getByDisplayValue('demo@releaseready.ai')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Password123!')).toBeInTheDocument();
  });
});
