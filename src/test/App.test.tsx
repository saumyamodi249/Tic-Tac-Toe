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

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/TRIPLE LOOP/i);
    expect(screen.getByText(/Play Local/i)).toBeInTheDocument();
    expect(screen.getByText(/Find Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Private Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Never stop thinking/i)).toBeInTheDocument();
  });

  it('opens and closes How to Play modal', async () => {
    render(<App />);

    // Click How to Play button in navbar
    const howToPlayBtn = screen.getByLabelText(/How to play rules/i);
    fireEvent.click(howToPlayBtn);

    expect(screen.getByText(/How to Play Triple Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/The Triple Loop Mechanic/i)).toBeInTheDocument();

    // Click close / got it
    const gotItBtn = screen.getByRole('button', { name: /Got It, Let's Play!/i });
    fireEvent.click(gotItBtn);

    await waitFor(() => {
      expect(screen.queryByText(/How to Play Triple Loop/i)).not.toBeInTheDocument();
    });
  });

  it('opens Auth modal and allows updating guest nickname', async () => {
    render(<App />);

    // Click profile badge in header
    const profileBtn = screen.getByLabelText(/Profile:/i);
    fireEvent.click(profileBtn);

    expect(screen.getByText(/Player Identity/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Enter player nickname.../i);
    fireEvent.change(input, { target: { value: 'GrandMasterX' } });

    const saveBtn = screen.getByRole('button', { name: /Save Nickname/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Nickname updated successfully!/i)).toBeInTheDocument();
    });
  });

  it('starts a local game, places marks, and removes oldest mark on 4th placement', async () => {
    render(<App />);

    // Click Play Local
    const playLocalBtn = screen.getByRole('button', { name: /Play Local/i });
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

    // Navigate to Local Play
    fireEvent.click(screen.getByRole('button', { name: /Play Local/i }));

    // Click Offer Draw
    const offerDrawBtn = screen.getByRole('button', { name: /Offer Draw/i });
    fireEvent.click(offerDrawBtn);

    // Draw dialog appears
    expect(screen.getByText(/offered a Draw/i)).toBeInTheDocument();

    // Accept Draw
    const acceptBtn = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptBtn);

    // Victory modal with Tactical Draw appears
    expect(screen.getByText(/Tactical Draw/i)).toBeInTheDocument();
    expect(screen.getByText(/Both players agreed to a mutual draw/i)).toBeInTheDocument();
  });

  it('allows navigating back to main menu from local game', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Play Local/i }));
    expect(screen.getByRole('button', { name: /Menu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText(/Never stop thinking/i)).toBeInTheDocument();
  });
});
