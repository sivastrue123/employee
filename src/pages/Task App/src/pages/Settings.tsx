import React, { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context/DataContext';
import { designTokens } from '../designTokens';
import { Team, SlaPolicy } from '../types';

const TEAMS_PER_PAGE = 2;

type TeamFormState = {
  name: string;
  department: string;
  keyskills: string;
  status: 'Active' | 'Inactive';
};

type PolicyFormState = {
  name: string;
  appliesTo: string;
  slaTime: string;
};

const TEAM_FORM_BLANK: TeamFormState = {
  name: '',
  department: '',
  keyskills: '',
  status: 'Active',
};

const POLICY_FORM_BLANK: PolicyFormState = {
  name: '',
  appliesTo: '',
  slaTime: '',
};

const Settings: React.FC = () => {
  const {
    teams,
    slaPolicies,
    notificationRules,
    toggleNotificationRule,
    addTeam,
    updateTeam,
    addSlaPolicy,
    updateSlaPolicy,
    departments,
  } = useAppData();
  const [teamFilter, setTeamFilter] = useState('');
  const [teamEntry, setTeamEntry] = useState<TeamFormState>({
    name: '',
    department: '',
    keyskills: '',
    status: 'Active',
  });
  const [slaTime, setSlaTime] = useState('');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyEntry, setPolicyEntry] = useState({ name: '', appliesTo: '' });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [newTeamEntries, setNewTeamEntries] = useState<TeamFormState[]>([{ ...TEAM_FORM_BLANK }]);
  const [newPolicyEntries, setNewPolicyEntries] = useState<PolicyFormState[]>([{ ...POLICY_FORM_BLANK }]);
  const filteredTeams = useMemo(() => {
    const term = teamFilter.trim().toLowerCase();
    if (!term) return teams;
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(term) ||
        team.code.toLowerCase().includes(term) ||
        team.lead.toLowerCase().includes(term),
    );
  }, [teamFilter, teams]);

  const [teamPage, setTeamPage] = useState(1);
  const visibleTeams = filteredTeams.slice(0, teamPage * TEAMS_PER_PAGE);
  const hasMoreTeams = visibleTeams.length < filteredTeams.length;

  useEffect(() => {
    setTeamPage(1);
  }, [teamFilter]);

  const handleTeamField = (field: keyof typeof teamEntry, value: string) => {
    setTeamEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewTeamField = (index: number, field: keyof TeamFormState, value: string) => {
    setNewTeamEntries((prev) =>
      prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)),
    );
  };

  const handleAddTeamEntryRow = () => {
    setNewTeamEntries((prev) => [...prev, { ...TEAM_FORM_BLANK }]);
  };

  const handleRemoveTeamEntryRow = (index: number) => {
    setNewTeamEntries((prev) =>
      prev.length === 1 ? [{ ...TEAM_FORM_BLANK }] : prev.filter((_, idx) => idx !== index),
    );
  };

  const handlePolicyField = (field: keyof typeof policyEntry, value: string) => {
    setPolicyEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewPolicyField = (index: number, field: keyof PolicyFormState, value: string) => {
    setNewPolicyEntries((prev) =>
      prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)),
    );
  };

  const handleAddPolicyEntryRow = () => {
    setNewPolicyEntries((prev) => [...prev, { ...POLICY_FORM_BLANK }]);
  };

  const handleRemovePolicyEntryRow = (index: number) => {
    setNewPolicyEntries((prev) =>
      prev.length === 1 ? [{ ...POLICY_FORM_BLANK }] : prev.filter((_, idx) => idx !== index),
    );
  };

  const resetNewTeamEntries = () => setNewTeamEntries([{ ...TEAM_FORM_BLANK }]);

  const handleAddTeam = () => {
    setEditingTeamId(null);
    setTeamEntry({ name: '', department: '', keyskills: '', status: 'Active' });
    resetNewTeamEntries();
    setShowTeamForm((prev) => !prev);
  };

  const handleCancelTeam = () => {
    setShowTeamForm(false);
    setTeamEntry({ name: '', department: '', keyskills: '', status: 'Active' });
    setEditingTeamId(null);
    resetNewTeamEntries();
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamEntry({
      name: team.name,
      department: team.department ?? '',
      keyskills: team.keyskills ?? '',
      status: team.isActive ? 'Active' : 'Inactive',
    });
    setShowTeamForm(true);
  };

  const resetNewPolicyEntries = () => setNewPolicyEntries([{ ...POLICY_FORM_BLANK }]);

  const handleAddPolicy = () => {
    setEditingPolicyId(null);
    setPolicyEntry({ name: '', appliesTo: '' });
    setSlaTime('');
    resetNewPolicyEntries();
    setShowPolicyForm((prev) => !prev);
  };

  const handleCancelPolicy = () => {
    setShowPolicyForm(false);
    setPolicyEntry({ name: '', appliesTo: '' });
    setSlaTime('');
    setEditingPolicyId(null);
    resetNewPolicyEntries();
  };

  const handleEditPolicy = (policy: SlaPolicy) => {
    setEditingPolicyId(policy.id);
    setPolicyEntry({
      name: policy.name,
      appliesTo: policy.appliesTo.join(', '),
    });
    setSlaTime(String(policy.stageDurations.Triage ?? 8));
    setShowPolicyForm(true);
  };

  const handleSaveTeamEntry = () => {
    const teamName = teamEntry.name.trim();
    if (!teamName) return;
    const payload = {
      name: teamName,
      department: teamEntry.department.trim(),
      keyskills: teamEntry.keyskills.trim(),
      isActive: teamEntry.status === 'Active',
    };
    if (editingTeamId) {
      updateTeam(editingTeamId, {
        ...payload,
        lead: payload.name,
      });
    } else {
      addTeam(payload);
    }
    handleCancelTeam();
  };

  const handleSaveTeamEntries = () => {
    const entries = newTeamEntries
      .map((entry) => ({
        name: entry.name.trim(),
        department: entry.department.trim(),
        keyskills: entry.keyskills.trim(),
        isActive: entry.status === 'Active',
      }))
      .filter((entry) => entry.name);
    if (!entries.length) return;
    entries.forEach((entry) => addTeam(entry));
    handleCancelTeam();
  };

  const handleSavePolicyEntry = () => {
    if (!policyEntry.name.trim()) return;
    const payload = {
      name: policyEntry.name.trim(),
      appliesTo: policyEntry.appliesTo,
      slaTime,
    };
    if (editingPolicyId) {
      updateSlaPolicy(editingPolicyId, payload);
    } else {
      addSlaPolicy(payload);
    }
    handleCancelPolicy();
  };

  const handleSavePolicyEntries = () => {
    const entries = newPolicyEntries
      .map((entry) => ({
        name: entry.name.trim(),
        appliesTo: entry.appliesTo.trim(),
        slaTime: entry.slaTime.trim(),
      }))
      .filter((entry) => entry.name);
    if (!entries.length) return;
    entries.forEach((entry) => addSlaPolicy(entry));
    handleCancelPolicy();
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Settings</p>
        <h1 className="text-3xl font-semibold text-slate-900">Admin settings</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Manage teams, SLA policies, alerts, and integrations from a single configuration surface.
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-slate-100 shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Teams</h2>
          <button
            type="button"
            className="px-4 py-2 rounded-full text-xs font-semibold shadow transition"
            style={{
              backgroundColor: designTokens.colors.accent,
              borderColor: designTokens.colors.accent,
              color: 'white',
            }}
            onClick={handleAddTeam}
          >
            {showTeamForm ? 'Hide entry' : '+ Add team'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-center text-sm">
          <input
            className="border rounded-full px-3 py-2 text-sm w-full max-w-md"
            placeholder="Filter teams (name/code/lead)"
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          />
          <span className="text-xs text-slate-400">Use the filter to narrow the list, or leave empty to show all teams.</span>
        </div>
        {showTeamForm && (
          <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {editingTeamId ? 'Edit team member' : 'Add team member'}
            </p>
            {editingTeamId ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  className="border rounded-2xl px-3 py-2 text-sm"
                  placeholder="Team member name"
                  value={teamEntry.name}
                  onChange={(event) => handleTeamField('name', event.target.value)}
                />
                <input
                  className="border rounded-2xl px-3 py-2 text-sm"
                  placeholder="Team member department"
                  value={teamEntry.department}
                  onChange={(event) => handleTeamField('department', event.target.value)}
                />
                <input
                  className="border rounded-2xl px-3 py-2 text-sm"
                  placeholder="Key skills"
                  value={teamEntry.keyskills}
                  onChange={(event) => handleTeamField('keyskills', event.target.value)}
                />
                <select
                  className="border rounded-2xl px-3 py-2 text-sm"
                  value={teamEntry.status}
                  onChange={(event) => handleTeamField('status', event.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <>
                {newTeamEntries.map((entry, index) => (
                  <div key={`team-entry-${index}`} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        className="border rounded-2xl px-3 py-2 text-sm"
                        placeholder="Team member name"
                        value={entry.name}
                        onChange={(event) => handleNewTeamField(index, 'name', event.target.value)}
                      />
                      <input
                        className="border rounded-2xl px-3 py-2 text-sm"
                        placeholder="Team member department"
                        value={entry.department}
                        onChange={(event) => handleNewTeamField(index, 'department', event.target.value)}
                      />
                      <input
                        className="border rounded-2xl px-3 py-2 text-sm"
                        placeholder="Key skills"
                        value={entry.keyskills}
                        onChange={(event) => handleNewTeamField(index, 'keyskills', event.target.value)}
                      />
                      <select
                        className="border rounded-2xl px-3 py-2 text-sm"
                        value={entry.status}
                        onChange={(event) => handleNewTeamField(index, 'status', event.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    {newTeamEntries.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                          onClick={() => handleRemoveTeamEntryRow(index)}
                        >
                          Remove row
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600"
                    onClick={handleAddTeamEntryRow}
                  >
                    Add another team member
                  </button>
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-full text-sm font-semibold shadow transition"
                style={{
                  backgroundColor: designTokens.colors.accent,
                  borderColor: designTokens.colors.accent,
                  color: 'white',
                }}
                onClick={editingTeamId ? handleSaveTeamEntry : handleSaveTeamEntries}
              >
                Save team
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600"
                onClick={handleCancelTeam}
              >
                Cancel
              </button>
            </div>
          </section>
        )}
        {filteredTeams.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
              {visibleTeams.map((team) => (
                <div key={team.id} className="rounded-2xl border border-slate-100 p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{team.name}</p>
                      <p className="text-xs uppercase tracking-wider text-slate-400">{team.code}</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600"
                      onClick={() => handleEditTeam(team)}
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Lead: {team.lead}</p>
                  {team.department && <p className="text-xs text-slate-500">Department: {team.department}</p>}
                  {team.keyskills && <p className="text-xs text-slate-500">Key skills: {team.keyskills}</p>}
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Status: {team.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              ))}
            </div>
            {hasMoreTeams && (
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => setTeamPage((prev) => prev + 1)}
                >
                  Load more teams
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            {teamFilter.trim() ? 'No teams match that filter.' : 'Add a team member to populate this list.'}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">SLA policies</h2>
          <button
            type="button"
            className="px-4 py-2 rounded-full text-xs font-semibold shadow transition"
            style={{
              backgroundColor: designTokens.colors.accent,
              borderColor: designTokens.colors.accent,
              color: 'white',
            }}
            onClick={handleAddPolicy}
          >
            {showPolicyForm ? 'Hide entry' : '+ New policy'}
          </button>
        </div>
        {showPolicyForm && (
          <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {editingPolicyId ? 'Edit SLA policy' : 'Add SLA policy'}
            </p>
            {editingPolicyId ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="border rounded-2xl px-3 py-2 text-sm"
                    placeholder="Policy name"
                    value={policyEntry.name}
                    onChange={(event) => handlePolicyField('name', event.target.value)}
                  />
                  <input
                    className="border rounded-2xl px-3 py-2 text-sm"
                    placeholder="Applies to (comma separated)"
                    value={policyEntry.appliesTo}
                    onChange={(event) => handlePolicyField('appliesTo', event.target.value)}
                  />
                </div>
                <label className="text-xs text-slate-500">
                  SLA Time
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.25"
                    step="0.25"
                    pattern="^\d+(\.\d+)?$"
                    className="border rounded-2xl px-3 py-2 w-full"
                    value={slaTime}
                    onChange={(event) => setSlaTime(event.target.value)}
                    placeholder="hrs"
                  />
                </label>
              </>
            ) : (
              <>
                {newPolicyEntries.map((entry, index) => (
                  <div key={`policy-entry-${index}`} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        className="border rounded-2xl px-3 py-2 text-sm"
                        placeholder="Policy name"
                        value={entry.name}
                        onChange={(event) => handleNewPolicyField(index, 'name', event.target.value)}
                      />
                      <input
                        className="border rounded-2xl px-3 py-2 text-sm"
                        placeholder="Applies to (comma separated)"
                        value={entry.appliesTo}
                        onChange={(event) => handleNewPolicyField(index, 'appliesTo', event.target.value)}
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0.25"
                        step="0.25"
                        pattern="^\d+(\.\d+)?$"
                        className="border rounded-2xl px-3 py-2 text-sm"
                        placeholder="SLA time (hrs)"
                        value={entry.slaTime}
                        onChange={(event) => handleNewPolicyField(index, 'slaTime', event.target.value)}
                      />
                    </div>
                    {newPolicyEntries.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                          onClick={() => handleRemovePolicyEntryRow(index)}
                        >
                          Remove row
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600"
                    onClick={handleAddPolicyEntryRow}
                  >
                    Add another policy
                  </button>
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-full text-sm font-semibold shadow transition"
                style={{
                  backgroundColor: designTokens.colors.accent,
                  borderColor: designTokens.colors.accent,
                  color: 'white',
                }}
                onClick={editingPolicyId ? handleSavePolicyEntry : handleSavePolicyEntries}
              >
                Save policy
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600"
                onClick={handleCancelPolicy}
              >
                Cancel
              </button>
            </div>
          </section>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {slaPolicies.map((policy) => (
            <div key={policy.id} className="rounded-2xl border border-slate-100 p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900">{policy.name}</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600"
                  onClick={() => handleEditPolicy(policy)}
                >
                  Edit
                </button>
              </div>
              <p className="text-xs text-slate-500">{policy.appliesTo.join(', ')}</p>
              <p className="text-xs text-slate-400 mt-2">Breach threshold: {policy.breachThresholdPct * 100}%</p>
              <p className="text-xs text-slate-400">Reminder window: {policy.reminderWindowHours}h before due</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <div className="space-y-3 text-sm">
          {notificationRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">{rule.name}</p>
                <p className="text-xs text-slate-500">
                  Trigger: {rule.trigger} · Channel: {rule.channel}
                </p>
              </div>
              <button
                onClick={() => toggleNotificationRule(rule.id, !rule.active)}
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  rule.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {rule.active ? 'Active' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Settings;

