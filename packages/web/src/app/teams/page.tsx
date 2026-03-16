'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createLocalUser, createLocalTeam } from '../actions/profiles';
import { Shield, Plus, User, Users, Check } from 'lucide-react';

export default function TeamsPage() {
    const { user, availableUsers, activeTeam, refreshProfiles } = useAuth();

    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [creatingUser, setCreatingUser] = useState(false);

    const [newTeamName, setNewTeamName] = useState('');
    const [creatingTeam, setCreatingTeam] = useState(false);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingUser(true);
        await createLocalUser(newUserEmail, newUserName);
        await refreshProfiles();
        setNewUserName('');
        setNewUserEmail('');
        setCreatingUser(false);
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setCreatingTeam(true);
        const slug = newTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await createLocalTeam(user.id, newTeamName, slug);
        await refreshProfiles();
        setNewTeamName('');
        setCreatingTeam(false);
    };

    return (
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Profile & Team Settings</h1>
                <p className="text-muted-foreground font-mono text-sm max-w-2xl">
                    Manage your local AgentFoundry profiles. Since this is a local-first application,
                    we use SQLite to store profiles instead of a cloud provider. "Solo Mode" is the default.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Users Section */}
                <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Local Users</h2>
                            <p className="text-xs text-muted-foreground font-mono uppercase">Local Database Only</p>
                        </div>
                    </div>

                    <ul className="space-y-2 max-h-48 overflow-auto">
                        <li className="flex items-center justify-between p-3 rounded-md bg-secondary border border-border">
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-4 w-4 text-emerald-500" />
                                <span className="font-medium text-slate-300">Solo Mode (Default)</span>
                            </div>
                            {!user && <Check className="h-4 w-4 text-emerald-500" />}
                        </li>
                        {availableUsers.map(u => (
                            <li key={u.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                                <span className="text-sm font-medium">{u.name || u.email}</span>
                                {user?.id === u.id && <span className="text-xs text-accent font-mono border border-accent/20 px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleCreateUser} className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold text-slate-300">Create New Local User</h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                required
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creatingUser}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {creatingUser ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
                </div>

                {/* Teams Section */}
                <div className={`space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm ${!user ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="p-2 bg-accent/10 text-accent rounded-lg">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Local Teams</h2>
                            <p className="text-xs text-muted-foreground font-mono uppercase">Assigned To Active User</p>
                        </div>
                    </div>

                    {!user ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Shield className="h-8 w-8 mb-4 opacity-50" />
                            <p className="text-sm">You must switch to a Local User before you can manage teams.</p>
                        </div>
                    ) : (
                        <>
                            <ul className="space-y-2 max-h-48 overflow-auto">
                                <li className="flex items-center justify-between p-3 rounded-md bg-secondary border border-border">
                                    <span className="text-sm font-medium text-slate-300">Personal (No Team)</span>
                                    {!activeTeam && <Check className="h-4 w-4 text-emerald-500" />}
                                </li>
                                {user && activeTeam && (
                                    <li className="flex items-center justify-between p-3 rounded-md border border-border border-accent/20">
                                        <span className="text-sm font-medium">{activeTeam.name}</span>
                                        <span className="text-xs text-accent font-mono border border-accent/20 px-2 py-0.5 rounded-full">ACTIVE</span>
                                    </li>
                                )}
                            </ul>

                            <form onSubmit={handleCreateTeam} className="space-y-4 pt-4 border-t border-border">
                                <h3 className="text-sm font-semibold text-slate-300">Create New Team</h3>
                                <input
                                    type="text"
                                    placeholder="Team Name"
                                    required
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={creatingTeam}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 w-full border border-border gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    {creatingTeam ? 'Creating...' : 'Create Team'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
