import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Additional test utilities
export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return customRender(ui, options);
}

export function setupMockResponses() {
  // Mock setup placeholder
}

export function resetMocks() {
  // Reset mocks placeholder
}

export function createMockIngredient(overrides?: any) {
  return {
    id: 1,
    name: 'Test Ingredient',
    category: 'Test Category',
    unit: 'kg',
    price: 10,
    ...overrides
  };
}

export const mockInvoke = jest.fn();
