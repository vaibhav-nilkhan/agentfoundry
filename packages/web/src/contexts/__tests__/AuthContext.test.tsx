import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use hoisted to ensure the mock is applied before the module is imported
const { getLocalUsers, getLocalTeams } = vi.hoisted(() => ({
    getLocalUsers: vi.fn(),
    getLocalTeams: vi.fn()
}));

// Mock the server actions
vi.mock('../../app/actions/profiles', () => ({
    getLocalUsers,
    getLocalTeams
}));

const TestComponent = () => {
    const { user, loading, availableUsers } = useAuth();
    if (loading) return <div data-testid="loading">Loading...</div>;
    return (
        <div>
            <div data-testid="user-id">{user ? user.id : 'Solo Mode'}</div>
            <div data-testid="users-count">{availableUsers.length}</div>
        </div>
    );
};

describe('AuthContext - Solo Mode Default Defaults', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        globalThis.localStorage.clear();
    });

    it('defaults to Solo Mode (user=null) when no users exist', async () => {
        // Mock DB returning 0 users
        getLocalUsers.mockResolvedValue([]);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('loading')).toBeDefined();

        await waitFor(() => {
            expect(screen.queryByTestId('loading')).toBeNull();
        });

        expect(screen.getByTestId('user-id').textContent).toBe('Solo Mode');
        expect(screen.getByTestId('users-count').textContent).toBe('0');
    });

    it('loads a user if localStorage has an active user ID', async () => {
        const mockUsers = [{ id: 'u1', email: 'test@test.com', name: 'Test User' }];
        getLocalUsers.mockResolvedValue(mockUsers);
        getLocalTeams.mockResolvedValue([]);

        globalThis.localStorage.setItem('agentfoundry_user_id', 'u1');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading')).toBeNull();
        });

        expect(screen.getByTestId('user-id').textContent).toBe('u1');
        expect(screen.getByTestId('users-count').textContent).toBe('1');
    });
});
