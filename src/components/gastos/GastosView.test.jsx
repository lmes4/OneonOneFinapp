import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FinAppProvider } from '../../context/FinAppContext';
import GastosView from './GastosView';

function renderWithProvider(ui) {
  return render(
    <FinAppProvider>
      {ui}
    </FinAppProvider>
  );
}

describe('GastosView Component Integration', () => {
  it('renders the form with default personal scope and amount 0.00', () => {
    renderWithProvider(<GastosView isMobile={false} />);
    expect(screen.getByTestId('amount-display')).toBeInTheDocument();
    expect(screen.getByTestId('scope-personal-btn')).toBeInTheDocument();
    expect(screen.getByTestId('scope-shared-btn')).toBeInTheDocument();
    expect(screen.getByTestId('btn-save-expense')).toBeInTheDocument();
  });

  it('allows switching to shared scope and shows split method options', () => {
    renderWithProvider(<GastosView isMobile={false} />);
    const sharedBtn = screen.getByTestId('scope-shared-btn');
    fireEvent.click(sharedBtn);

    expect(screen.getByTestId('split-method-5050')).toBeInTheDocument();
    expect(screen.getByTestId('split-method-proportional')).toBeInTheDocument();
    expect(screen.getByTestId('split-method-custom')).toBeInTheDocument();
  });

  it('shows error if saving with 0 amount', () => {
    renderWithProvider(<GastosView isMobile={false} />);
    const saveBtn = screen.getByTestId('btn-save-expense');
    fireEvent.click(saveBtn);

    expect(screen.getByText(/importe mayor a cero/i)).toBeInTheDocument();
  });

  it('updates keypad amount and displays live calculation for 50/50 shared split', () => {
    renderWithProvider(<GastosView isMobile={false} />);
    
    // Switch to shared
    fireEvent.click(screen.getByTestId('scope-shared-btn'));

    // Press keypad: +50, +50 (amount = 100.00)
    fireEvent.click(screen.getByText('+50'));
    fireEvent.click(screen.getByText('+50'));

    expect(screen.getByTestId('amount-display')).toHaveTextContent('100.00');
    expect(screen.getByTestId('live-split-preview')).toBeInTheDocument();
  });
});
