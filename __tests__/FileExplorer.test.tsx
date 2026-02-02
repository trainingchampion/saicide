import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import FileExplorer from '../components/FileExplorer';
import { MOCK_FILE_STRUCTURE } from '../constants';

// Mock the icons to prevent SVG rendering issues in the test environment
jest.mock('../constants', () => {
    const original = jest.requireActual('../constants');
    return {
        ...original,
        ICONS: {
            ...original.ICONS,
            FOLDER: <span>📁</span>,
            TS_FILE: <span>📄</span>,
            DOCKERFILE: <span>🐳</span>,
        }
    }
});

describe('FileExplorer', () => {
    const onFileSelect = jest.fn();
    const onNewFile = jest.fn();
    const onNewFolder = jest.fn();
    const onRefresh = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('renders the initial file structure', () => {
        render(<FileExplorer 
            rootNode={MOCK_FILE_STRUCTURE}
            onFileSelect={onFileSelect}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onRefresh={onRefresh}
        />);

        expect(screen.getByText('src')).toBeInTheDocument();
        expect(screen.getByText('App.tsx')).toBeInTheDocument();
        expect(screen.getByText('Dockerfile')).toBeInTheDocument();
    });

    it('filters files based on search term', async () => {
        render(<FileExplorer 
            rootNode={MOCK_FILE_STRUCTURE}
            onFileSelect={onFileSelect}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onRefresh={onRefresh}
        />);

        const searchInput = screen.getByPlaceholderText('Search files...');
        fireEvent.change(searchInput, { target: { value: 'button' } });

        // Wait for debounce timeout
        await new Promise(r => setTimeout(r, 350));
        
        // Should show the matching file and its parent folders
        expect(screen.queryByText('Button.tsx')).toBeInTheDocument();
        expect(screen.queryByText('components')).toBeInTheDocument();
        expect(screen.queryByText('src')).toBeInTheDocument();

        // Should hide other non-matching files
        expect(screen.queryByText('Input.tsx')).not.toBeInTheDocument();
        expect(screen.queryByText('Dockerfile')).not.toBeInTheDocument();
    });

    it('handles file selection when a file is clicked', () => {
        render(<FileExplorer 
            rootNode={MOCK_FILE_STRUCTURE}
            onFileSelect={onFileSelect}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onRefresh={onRefresh}
        />);

        fireEvent.click(screen.getByText('README.md'));
        expect(onFileSelect).toHaveBeenCalledTimes(1);
        expect(onFileSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'README.md' }));
    });
});