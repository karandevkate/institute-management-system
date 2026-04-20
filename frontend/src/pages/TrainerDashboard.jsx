import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatBatchSchedule = (startTime, endTime) => {
  const formatValue = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString([], { dateStyle: 'medium' });
  };

  const formattedStart = formatValue(startTime);
  const formattedEnd = formatValue(endTime);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  return formattedStart || formattedEnd || 'Schedule pending';
};

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
    <p className="font-body uppercase tracking-widest text-[11px] text-slate-500 mb-2">{title}</p>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-3xl font-headline font-bold text-slate-900">{value}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  </div>
);

const BatchSelector = ({ batches, selectedBatchId, onChange, label }) => (
  <div>
    <label className="block text-xs uppercase font-bold mb-2 text-slate-500">{label}</label>
    <select
      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
      value={selectedBatchId}
      onChange={e => onChange(e.target.value)}
      required
    >
      <option value="">Select Batch</option>
      {batches.map(batch => (
        <option key={batch.id} value={batch.id}>
          {batch.name}
        </option>
      ))}
    </select>
  </div>
);

const TrainerHome = ({ user, batches }) => {
  const totalStudents = batches.reduce((sum, batch) => sum + (batch.students?.length || 0), 0);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-8 text-white shadow-[0px_20px_48px_rgba(53,37,205,0.16)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center text-2xl font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div>
              <p className="uppercase tracking-[0.24em] text-[11px] text-white/70 mb-2">Trainer Dashboard</p>
              <h2 className="text-3xl font-headline font-bold">{user?.username || 'Trainer'}</h2>
              <p className="text-white/80 mt-2">{user?.email || 'No email available'}</p>
              <p className="text-sm text-white/70 mt-1">Manage your batches, assignments, and study materials from one workspace.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/trainer/assignments" className="px-5 py-3 rounded-xl bg-white text-primary font-semibold shadow-lg">
              Create Assignment
            </Link>
            <Link to="/trainer/resources" className="px-5 py-3 rounded-xl border border-white/20 bg-white/10 font-semibold text-white">
              Share Resource
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Assigned Batches" value={batches.length} subtitle="Active teaching groups" icon="layers" />
        <StatCard title="Total Students" value={totalStudents} subtitle="Across all assigned batches" icon="groups" />
        <StatCard title="Course Coverage" value={new Set(batches.map(batch => batch.course?.id).filter(Boolean)).size} subtitle="Unique courses in progress" icon="menu_book" />
      </section>

      <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-headline font-bold text-slate-900">My Batches</h3>
            <p className="text-slate-500 mt-1">Your currently assigned groups and their schedules.</p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
            No batches assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {batches.map(batch => (
              <div key={batch.id} className="border border-slate-100 rounded-3xl p-6 bg-white shadow-[0px_8px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{batch.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{batch.course?.name || 'Unassigned course'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {batch.students?.length || 0} Students
                  </span>
                </div>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">calendar_month</span>
                    {formatBatchSchedule(batch.startTime, batch.endTime)}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">school</span>
                    {batch.course?.duration || 'Duration unavailable'}
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link to="/trainer/assignments" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
                    Assign Work
                  </Link>
                  <Link to="/trainer/resources" className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">
                    Share Material
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const TrainerAssignments = ({ batches }) => {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchTasks, setBatchTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [studentProgress, setStudentProgress] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
  const selectedTask = batchTasks.find(task => String(task.id) === String(selectedTaskId));

  useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      setSelectedBatchId(String(batches[0].id));
    }
  }, [batches, selectedBatchId]);

  useEffect(() => {
    const fetchBatchTasks = async () => {
      if (!selectedBatchId) {
        setBatchTasks([]);
        setSelectedTaskId('');
        setStudentProgress([]);
        return;
      }

      try {
        const res = await api.get(`/trainer/batches/${selectedBatchId}/tasks`);
        const tasks = Array.isArray(res.data) ? res.data : [];
        setBatchTasks(tasks);
        setSelectedTaskId(tasks[0]?.id ? String(tasks[0].id) : '');
      } catch (err) {
        console.error(err);
        setBatchTasks([]);
        setSelectedTaskId('');
      }
    };

    fetchBatchTasks();
  }, [selectedBatchId]);

  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!selectedTaskId) {
        setStudentProgress([]);
        return;
      }

      try {
        const res = await api.get(`/trainer/tasks/${selectedTaskId}/progress`);
        setStudentProgress(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setStudentProgress([]);
      }
    };

    fetchStudentProgress();
  }, [selectedTaskId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    await api.post(`/trainer/batches/${selectedBatchId}/tasks`, newTask);
    alert('Task Created');
    setNewTask({ title: '', description: '', deadline: '' });

    const tasksRes = await api.get(`/trainer/batches/${selectedBatchId}/tasks`);
    const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
    setBatchTasks(tasks);
    setSelectedTaskId(tasks[0]?.id ? String(tasks[0].id) : '');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">Assignments</h2>
        <p className="text-slate-500 mt-1">Create and assign academic work for a selected batch.</p>
      </div>

      {batches.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-[0px_12px_32px_rgba(53,37,205,0.04)] text-center text-slate-500">
          No batches are assigned to this trainer yet.
        </div>
      ) : (
        <>

          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
            <BatchSelector
              batches={batches}
              selectedBatchId={selectedBatchId}
              onChange={setSelectedBatchId}
              label="Select Batch"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">Target Batch</p>
                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {batches.find(batch => String(batch.id) === String(selectedBatchId))?.name || 'Select a batch above'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={newTask.deadline}
                    onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Task Title</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Instructions</label>
                  <textarea
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    rows="5"
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={!selectedBatchId} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    Assign to Batch
                  </button>
                </div>
              </form>
            </div>

            <div className="xl:col-span-6 bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Student Progress</h3>
                  <p className="text-slate-500 mt-1">Select a task from the chosen batch to view each student's current status.</p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Task</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      value={selectedTaskId}
                      onChange={e => setSelectedTaskId(e.target.value)}
                      disabled={!selectedBatchId || batchTasks.length === 0}
                    >
                      <option value="">Select Task</option>
                      {batchTasks.map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedTask && (
                    <div className="rounded-2xl bg-surface-container-low p-5">
                      <p className="text-[11px] uppercase tracking-widest text-slate-500">Selected Task</p>
                      <h4 className="text-lg font-bold text-slate-900 mt-2">{selectedTask.title}</h4>
                      <p className="text-sm text-slate-500 mt-2">{selectedTask.description}</p>
                      <p className="text-sm text-slate-600 mt-3">
                        <span className="font-semibold text-slate-900">Deadline:</span> {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString() : 'Not set'}
                      </p>
                    </div>
                  )}

                  {!selectedBatchId ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                      Choose a batch to load assignments.
                    </div>
                  ) : batchTasks.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                      No tasks have been created for this batch yet.
                    </div>
                  ) : studentProgress.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                      No student progress available for the selected task yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studentProgress.map(progress => (
                        <div key={progress.id} className="border border-slate-100 rounded-2xl p-4 bg-white flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{progress.student?.username || 'Student'}</p>
                            <p className="text-xs text-slate-500 mt-1">{progress.student?.email || 'No email available'}</p>
                            {progress.submissionDate && (
                              <p className="text-xs text-slate-400 mt-2">Updated {new Date(progress.submissionDate).toLocaleString()}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-2 rounded-full text-xs font-bold ${progress.status === 'COMPLETED'
                                ? 'bg-[#DCFCE7] text-[#166534]'
                                : progress.status === 'WORKING'
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                              {progress.status}
                            </span>
                            {progress.submissionUrl && (
                              <a href={progress.submissionUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">
                                Open Submission
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TrainerResources = ({ batches }) => {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'DOCUMENT' });

  const handleShareMaterial = async (e) => {
    e.preventDefault();

    await api.post(`/trainer/batches/${selectedBatchId}/materials`, newMaterial);
    alert('Material Shared');
    setNewMaterial({ title: '', url: '', type: 'DOCUMENT' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">Resources</h2>
        <p className="text-slate-500 mt-1">Share documents and recordings with your selected batch.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
        <form onSubmit={handleShareMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BatchSelector
            batches={batches}
            selectedBatchId={selectedBatchId}
            onChange={setSelectedBatchId}
            label="Target Batch"
          />
          <div>
            <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Resource Type</label>
            <select
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={newMaterial.type}
              onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
            >
              <option value="DOCUMENT">Document (PDF/Doc)</option>
              <option value="VIDEO">Video Recording</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Resource Title</label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={newMaterial.title}
              onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold mb-2 text-slate-500">URL</label>
            <input
              type="url"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={newMaterial.url}
              onChange={e => setNewMaterial({ ...newMaterial, url: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={!selectedBatchId} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              Share with Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/trainer/my-batches');
        setBatches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBatches();
  }, []);

  return (
    <Layout roleTitle="Lead Instructor">
      <Routes>
        <Route path="/" element={<TrainerHome user={user} batches={batches} />} />
        <Route path="/assignments" element={<TrainerAssignments batches={batches} />} />
        <Route path="/resources" element={<TrainerResources batches={batches} />} />
      </Routes>
    </Layout>
  );
};

export default TrainerDashboard;
