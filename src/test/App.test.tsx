import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Triple Loop Tic-Tac-Toe App Full Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders landing page with title and mode selections', () => {
    render(<App />);

    expect(screen.getByText(/TRIPLE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/LOOP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pass & Play/i)).toBeInTheDocument();
    expect(screen.getByText(/Public Arena/i)).toBeInTheDocument();
    expect(screen.getByText(/Private Chamber/i)).toBeInTheDocument();
    expect(screen.getByText(/Never stop thinking/i)).toBeInTheDocument();
  });

  it('opens and closes How to Play modal', async () => {
    render(<App />);

    // Click How to Play button in navbar
    const howToPlayBtn = screen.getByLabelText(/How to play rules/i);
    fireEvent.click(howToPlayBtn);

    expect(screen.getByRole('heading', { level: 2, name: /The Strategic Codex/i })).toBeInTheDocument();

    // Click close / got it
    const gotItBtn = screen.getByRole('button', { name: /Understood, Open the Board/i });
    fireEvent.click(gotItBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: /The Strategic Codex/i })).not.toBeInTheDocument();
    });
  });

  it('opens Auth modal and allows updating guest nickname', async () => {
    render(<App />);

    // Click profile badge in header
    const profileBtn = screen.getByLabelText(/Profile:/i);
    fireEvent.click(profileBtn);

    expect(screen.getByText(/Scholar Identity/i)).toBeInTheDocument();

    // Switch to Pseudonym tab
    const pseudonymTab = screen.getByRole('button', { name: /^Pseudonym$/i });
    fireEvent.click(pseudonymTab);

    const input = screen.getByPlaceholderText(/Enter player pseudonym.../i);
    fireEvent.change(input, { target: { value: 'GrandMasterX' } });

    const saveBtn = screen.getByRole('button', { name: /Inscribe Pseudonym/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/updated successfully!/i)).toBeInTheDocument();
    });
  });

  it('starts a local game, places marks, and removes oldest mark on 4th placement', async () => {
    render(<App />);

    // Click Pass & Play
    const playLocalBtn = screen.getByRole('button', { name: /Pass & Play/i });
    fireEvent.click(playLocalBtn);

    // Board should be visible with 9 cells
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(9);

    // Sequence of moves:
    // Move 1: Cell 0
    fireEvent.click(cells[0]);
    // Move 2: Cell 3
    fireEvent.click(cells[3]);
    // Move 3: Cell 1
    fireEvent.click(cells[1]);
    // Move 4: Cell 4
    fireEvent.click(cells[4]);
    // Move 5: Cell 6
    fireEvent.click(cells[6]);
    // Move 6: Cell 8
    fireEvent.click(cells[8]);

    // Move 7: Starting player places 4th mark at cell 7
    fireEvent.click(cells[7]);

    // Cell 0 was the oldest mark of the starter and should now be empty or have vanished!
    expect(cells[0].textContent).not.toContain('1st');
  });

  it('allows offering and accepting a mutual draw in local game', async () => {
    render(<App />);

    // Navigate to Pass & Play
    fireEvent.click(screen.getByRole('button', { name: /Pass & Play/i }));

    // Click Propose Accord
    const offerDrawBtn = screen.getByRole('button', { name: /Propose Accord/i });
    fireEvent.click(offerDrawBtn);

    // Draw dialog appears
    expect(screen.getByText(/proposes mutual accord/i)).toBeInTheDocument();

    // Accept Draw
    const acceptBtn = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptBtn);

    // Victory modal with Tactical Accord appears
    expect(screen.getByText(/Tactical Accord/i)).toBeInTheDocument();
  });

  it('allows navigating back to main menu from local game', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Pass & Play/i }));
    expect(screen.getByRole('button', { name: /Menu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText(/Never stop thinking/i)).toBeInTheDocument();
  });

  it('validates account creation fields with regex in Auth modal', async () => {
    render(<App />);

    // Open Auth modal
    const profileBtn = screen.getByLabelText(/Profile:/i);
    fireEvent.click(profileBtn);

    // Click Register tab
    const registerTab = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerTab);

    expect(screen.getByText(/Scholar Username/i)).toBeInTheDocument();

    // Fill invalid username
    const usernameInput = screen.getByPlaceholderText(/Choose scholar title.../i);
    fireEvent.change(usernameInput, { target: { value: 'ria 42' } });

    // Fill valid email
    const emailInput = screen.getByPlaceholderText(/scholar@academy.edu/i);
    fireEvent.change(emailInput, { target: { value: 'ria@example.com' } });

    // Submit
    const registerBtn = screen.getByRole('button', { name: /Matriculate & Register/i });
    fireEvent.click(registerBtn);

    // Error message appears
    await waitFor(() => {
      expect(screen.getByText(/Scholar username must contain only letters and numbers/i)).toBeInTheDocument();
    });
  });
});
