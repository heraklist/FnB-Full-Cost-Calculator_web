import { describe, test, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IngredientsTab from '../IngredientsTab';
import { renderWithProviders, setupMockResponses, resetMocks, createMockIngredient, mockInvoke } from '../../../test/testUtils';

describe('IngredientsTab Integration', () => {
  const mockIngredients = [
    createMockIngredient({ id: 1, name: 'Ντομάτες', category: 'Λαχανικά', price: 2.5 }),
    createMockIngredient({ id: 2, name: 'Κρεμμύδια', category: 'Λαχανικά', price: 1.5 }),
    createMockIngredient({ id: 3, name: 'Κιμάς', category: 'Κρέατα', price: 8.0 }),
  ];

  beforeEach(() => {
    resetMocks();
    setupMockResponses({
      'get_ingredients': mockIngredients,
      'get_settings': { mode: 'restaurant', vat_rate: 24 },
    });
  });

  test('renders ingredients list', async () => {
    renderWithProviders(<IngredientsTab />);

    await waitFor(() => {
      expect(screen.getByText('Ντομάτες')).toBeInTheDocument();
      expect(screen.getByText('Κρεμμύδια')).toBeInTheDocument();
      expect(screen.getByText('Κιμάς')).toBeInTheDocument();
    });
  });

  test('filters ingredients by search', async () => {
    const user = userEvent.setup();
    renderWithProviders(<IngredientsTab />);

    await waitFor(() => {
      expect(screen.getByText('Ντομάτες')).toBeInTheDocument();
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText(/αναζήτηση/i);
    await user.type(searchInput, 'Κιμάς');

    // Should only show matching item
    await waitFor(() => {
      expect(screen.getByText('Κιμάς')).toBeInTheDocument();
      expect(screen.queryByText('Ντομάτες')).not.toBeInTheDocument();
    });
  });

  test('filters ingredients by category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<IngredientsTab />);

    await waitFor(() => {
      expect(screen.getByText('Ντομάτες')).toBeInTheDocument();
    });

    // Select category filter
    // Το select δεν έχει πλέον accessible name, οπότε βρίσκουμε το πρώτο combobox
    const categorySelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(categorySelect, 'Κρέατα');

    // Should only show Κιμάς
    await waitFor(() => {
      expect(screen.getByText('Κιμάς')).toBeInTheDocument();
      expect(screen.queryByText('Ντομάτες')).not.toBeInTheDocument();
    });
  });

  test('opens form modal on add button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<IngredientsTab />);

    await waitFor(() => {
      expect(screen.getByText('Ντομάτες')).toBeInTheDocument();
    });

    // Click add button
    const addButton = screen.getByRole('button', { name: /\+ Νέο Υλικό/i });
    await user.click(addButton);

    // Form should be visible
    expect(screen.getByLabelText(/όνομα/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/τιμή/i)).toBeInTheDocument();
  });

  test('creates new ingredient via form', async () => {
    const user = userEvent.setup();
    
    setupMockResponses({
      'get_ingredients': mockIngredients,
      'create_ingredient': 4,
    });

    renderWithProviders(<IngredientsTab />);

    await waitFor(() => {
      expect(screen.getByText('Ντομάτες')).toBeInTheDocument();
    });

    // Open form
    await user.click(screen.getByRole('button', { name: /\+ Νέο Υλικό/i }));

    // Fill form
    await user.type(screen.getByLabelText(/όνομα/i), 'Πιπεριές');
    await user.clear(screen.getByLabelText(/τιμή/i));
    await user.type(screen.getByLabelText(/τιμή/i), '3.5');

    // Submit
    const submitButton = screen.getByRole('button', { name: /αποθήκευση/i });
    await user.click(submitButton);

    // Verify create was called
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('create_ingredient', expect.objectContaining({
        ingredient: expect.objectContaining({
          name: 'Πιπεριές',
          price: 3.5,
        }),
      }));
    });
  });

  test('shows delete confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<IngredientsTab />);

    await waitFor(() => {
      expect(screen.getByText('Ντομάτες')).toBeInTheDocument();
    });

    // Click delete button
    // Βρίσκουμε τα κουμπιά διαγραφής με aria-label
    const deleteButtons = screen.getAllByRole('button', { name: /διαγραφή/i });
    await user.click(deleteButtons[0]);

    // Confirmation should appear (ελέγχει το κουμπί διαγραφής στο modal με ακριβές όνομα)
    // Πάρε όλα τα κουμπιά "Διαγραφή" και βρες αυτό που είναι ορατό στο modal
    const confirmButtons = screen.getAllByRole('button', { name: /^διαγραφή$/i });
    // Το modal εμφανίζεται τελευταίο στο DOM, οπότε πάρε το τελευταίο κουμπί
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    expect(confirmButton).toBeInTheDocument();
  });
});
