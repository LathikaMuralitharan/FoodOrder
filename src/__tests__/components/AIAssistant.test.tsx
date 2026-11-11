import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIAssistant } from '../../components/ai/AIAssistant';
import { aiAssistantService } from '../../services/aiAssistantService';

vi.mock('../../services/aiAssistantService', () => ({
  aiAssistantService: {
    sendMessage: vi.fn(),
  },
}));

describe('AIAssistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating toggle button with accessible aria attributes', () => {
    render(<AIAssistant />);
    const toggleButton = screen.getByRole('button', { name: /open ai food assistant/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens chat drawer when clicking toggle button and displays welcome message', () => {
    render(<AIAssistant />);
    const toggleButton = screen.getByRole('button', { name: /open ai food assistant/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('dialog', { name: /ai food assistant/i })).toBeInTheDocument();
    expect(screen.getByText(/powered by amazon bedrock/i)).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes dialog on clicking close button or pressing Escape key', () => {
    render(<AIAssistant />);
    const toggleButton = screen.getByRole('button', { name: /open ai food assistant/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sends user message and displays live Bedrock response with model badge', async () => {
    const user = userEvent.setup();
    vi.mocked(aiAssistantService.sendMessage).mockResolvedValueOnce({
      reply: 'Here are the best pizza options: Margherita Pizza ($12.99).',
      isMock: false,
      provider: 'Amazon Bedrock (Converse API)',
      model: 'anthropic.claude-3-haiku-20240307-v1:0',
      timestamp: new Date().toISOString(),
    });

    render(<AIAssistant />);
    await user.click(screen.getByRole('button', { name: /open ai food assistant/i }));

    const input = screen.getByPlaceholderText(/ask about dishes/i);
    await user.type(input, 'What pizza do you recommend?');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // User message is shown
    expect(screen.getByText('What pizza do you recommend?')).toBeInTheDocument();

    // Live Bedrock reply is shown with live badge
    await waitFor(() => {
      expect(screen.getByText(/Margherita Pizza \(\$12\.99\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Amazon Bedrock \(anthropic\.claude-3-haiku/i)).toBeInTheDocument();
    });
  });

  it('displays demo fallback badge when response isMock is true', async () => {
    const user = userEvent.setup();
    vi.mocked(aiAssistantService.sendMessage).mockResolvedValueOnce({
      reply: 'Demo response: Pizza Palace is open for pickup.',
      isMock: true,
      provider: 'Mock / Demo Assistant (Grounded Catalog)',
      model: 'grounded-mock-fallback',
      timestamp: new Date().toISOString(),
    });

    render(<AIAssistant />);
    await user.click(screen.getByRole('button', { name: /open ai food assistant/i }));

    const input = screen.getByPlaceholderText(/ask about dishes/i);
    await user.type(input, 'Tell me about pizza');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Demo response: Pizza Palace/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Demo Mode \(Safe Fallback\)/i).length).toBeGreaterThan(0);
    });
  });

  it('displays error alert if message sending fails', async () => {
    const user = userEvent.setup();
    vi.mocked(aiAssistantService.sendMessage).mockRejectedValueOnce(
      new Error('Rate limit exceeded. Please wait 15 seconds.')
    );

    render(<AIAssistant />);
    await user.click(screen.getByRole('button', { name: /open ai food assistant/i }));

    const input = screen.getByPlaceholderText(/ask about dishes/i);
    await user.type(input, 'Give me suggestions');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Rate limit exceeded/i);
    });
  });
});
