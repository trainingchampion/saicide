
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import App from '../App';
import { THEMES } from '../themes';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock documentElement.style.setProperty to track CSS variable changes
const setPropertyMock = jest.fn();
Object.defineProperty(document.documentElement, 'style', {
  value: { setProperty: setPropertyMock },
  configurable: true,
});

// Minimal mock for child components to allow App to render without errors
jest.mock('../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../components/FileExplorer', () => () => <div>FileExplorer</div>);
jest.mock('../components/EditorPane', () => () => <div>EditorPane</div>);
jest.mock('../components/ChatPanel', () => ({ ChatPanel: () => <div>ChatPanel</div> }));

describe('Theme Management', () => {

  beforeEach(() => {
    localStorageMock.clear();
    setPropertyMock.mockClear();
    // Mock geolocation for ChatPanel which is a child of App
    Object.defineProperty(navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn(),
        },
        configurable: true
      });
  });

  it('loads the default theme on first visit and applies its styles', () => {
    render(<App />);
    
    // User is logged out, click sign in to render the main app
    fireEvent.click(screen.getByText('Sign In'));

    const defaultTheme = THEMES[0];
    
    // Check if CSS variables for the default theme were set
    expect(setPropertyMock).toHaveBeenCalledWith('--color-background', defaultTheme.colors['--color-background']);
    expect(setPropertyMock).toHaveBeenCalledWith('--color-accent', defaultTheme.colors['--color-accent']);

    // Check if localStorage was updated
    expect(localStorage.getItem('sai_theme')).toBe(defaultTheme.name);
  });
  
  it('loads a previously selected theme from localStorage', () => {
    const solarized = THEMES.find(t => t.name === 'Solarized Light');
    if (!solarized) throw new Error('Theme not found for test');

    localStorage.setItem('sai_theme', solarized.name);

    render(<App />);
    fireEvent.click(screen.getByText('Sign In'));

    // Check if CSS variables for the stored theme were set
    expect(setPropertyMock).toHaveBeenCalledWith('--color-background', solarized.colors['--color-background']);
    expect(setPropertyMock).toHaveBeenCalledWith('--color-accent', solarized.colors['--color-accent']);
  });

  it('changes theme when a new one is selected from the dropdown', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign In'));

    const themeSelect = screen.getByRole('combobox', { name: /Theme:/i });
    const monokaiTheme = THEMES.find(t => t.name === 'Monokai');
    if (!monokaiTheme) throw new Error('Theme not found for test');

    // Clear mock calls that happened on initial render
    setPropertyMock.mockClear();
    
    // Change the theme
    fireEvent.change(themeSelect, { target: { value: monokaiTheme.name } });

    // Check that CSS variables were updated for the new theme
    expect(setPropertyMock).toHaveBeenCalledWith('--color-background', monokaiTheme.colors['--color-background']);
    expect(setPropertyMock).toHaveBeenCalledWith('--color-accent', monokaiTheme.colors['--color-accent']);

    // Check that localStorage was updated
    expect(localStorage.getItem('sai_theme')).toBe(monokaiTheme.name);
  });

});
