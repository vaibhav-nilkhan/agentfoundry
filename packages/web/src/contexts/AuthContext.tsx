'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getLocalUsers, getLocalTeams } from '../app/actions/profiles';

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  activeTeam: Team | null;
  availableUsers: User[];
  availableTeams: Team[];
  loading: boolean;
  switchUser: (userId: string | null) => void;
  switchTeam: (teamId: string | null) => void;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = typeof globalThis !== 'undefined' && 'localStorage' in globalThis
    ? globalThis.localStorage
    : null;

  const loadProfiles = async () => {
    setLoading(true);
    const users = await getLocalUsers();
    setAvailableUsers(users);

    const savedUserId = storage?.getItem('agentfoundry_user_id') ?? null;
    let currentUser = null;

    if (savedUserId) {
      currentUser = users.find(u => u.id === savedUserId) || null;
    }

    // If no saved user, but users exist, default to the first one (Optional behavior, we'll keep solo as default if null)
    setUser(currentUser);

    if (currentUser) {
      const teams = await getLocalTeams(currentUser.id);
      setAvailableTeams(teams);

      const savedTeamId = storage?.getItem('agentfoundry_team_id') ?? null;
      if (savedTeamId) {
        setActiveTeam(teams.find(t => t.id === savedTeamId) || null);
      } else if (teams.length > 0) {
        setActiveTeam(teams[0]);
      }
    } else {
      setAvailableTeams([]);
      setActiveTeam(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const switchUser = (userId: string | null) => {
    if (!userId) {
      storage?.removeItem('agentfoundry_user_id');
      storage?.removeItem('agentfoundry_team_id');
      setUser(null);
      setActiveTeam(null);
      setAvailableTeams([]);
      return;
    }

    const newUser = availableUsers.find(u => u.id === userId);
    if (newUser) {
      storage?.setItem('agentfoundry_user_id', newUser.id);
      setUser(newUser);
      loadProfiles(); // Reload to get their teams
    }
  };

  const switchTeam = (teamId: string | null) => {
    if (!teamId) {
      storage?.removeItem('agentfoundry_team_id');
      setActiveTeam(null);
      return;
    }
    const newTeam = availableTeams.find(t => t.id === teamId);
    if (newTeam) {
      storage?.setItem('agentfoundry_team_id', newTeam.id);
      setActiveTeam(newTeam);
    }
  };

  const value = {
    user,
    activeTeam,
    availableUsers,
    availableTeams,
    loading,
    switchUser,
    switchTeam,
    refreshProfiles: loadProfiles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
