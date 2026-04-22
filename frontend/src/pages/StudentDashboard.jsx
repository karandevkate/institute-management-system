import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusClasses = (status) => {
  if (status === 'COMPLETED') return 'bg-[#DCFCE7] text-[#166534]';
  if (status === 'WORKING') return 'bg-[#FEF3C7] text-[#92400E]';
  return 'bg-slate-100 text-slate-600';
};

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
    <p className="font-body uppercase tracking-widest text-[11px] text-slate-500 mb-2">{title}</p>
    <div className="flex items-center justify-between gap-4">
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

const StudentHome = ({ user, tasks, materials }) => {
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
  const workingTasks = tasks.filter((task) => task.status === 'WORKING').length;
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING').length;
  const uniqueBatchCount = new Set(tasks.map((task) => task.task?.batch?.id).filter(Boolean)).size;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const resourcesByBatch = new Set(materials.map((material) => material.batch?.id).filter(Boolean)).size;
  const upcomingTasks = [...tasks]
    .filter((task) => task.task?.deadline)
    .sort((a, b) => new Date(a.task.deadline) - new Date(b.task.deadline))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-8 text-white shadow-[0px_20px_48px_rgba(53,37,205,0.16)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center text-2xl font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="uppercase tracking-[0.24em] text-[11px] text-white/70 mb-2">Student Dashboard</p>
              <h2 className="text-3xl font-headline font-bold">{user?.username || 'Student'}</h2>
              <p className="text-white/80 mt-2">{user?.email || 'No email available'}</p>
              <p className="text-sm text-white/70 mt-1">View your profile, check progress, and move into tasks or resource links from the workspace menu.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[220px]">
            <div className="rounded-2xl bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-widest text-white/60">Progress</p>
              <p className="text-2xl font-bold mt-2">{progress}%</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-widest text-white/60">Batches</p>
              <p className="text-2xl font-bold mt-2">{uniqueBatchCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Assigned Tasks" value={tasks.length} subtitle={`${pendingTasks} pending tasks`} icon="assignment" />
        <StatCard title="Task Progress" value={workingTasks} subtitle="Currently in progress" icon="pending_actions" />
        <StatCard title="Completed Work" value={completedTasks} subtitle="Finished assignments" icon="task_alt" />
        <StatCard title="Resources" value={materials.length} subtitle={`Shared across ${resourcesByBatch} batches`} icon="folder_open" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-headline font-bold text-slate-900">Profile Snapshot</h3>
              <p className="text-slate-500 mt-1">Basic account and learning workspace details.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Username</p>
              <p className="text-lg font-bold text-slate-900 mt-2">{user?.username || 'N/A'}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Email</p>
              <p className="text-lg font-bold text-slate-900 mt-2 break-words">{user?.email || 'N/A'}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Role</p>
              <p className="text-lg font-bold text-slate-900 mt-2">Student</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Account Status</p>
              <p className="text-lg font-bold text-slate-900 mt-2">{user?.isVerified ? 'Verified' : 'Pending Approval'}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Link to="/student/tasks" className="px-5 py-3 rounded-xl bg-primary text-white font-semibold">
              Open Tasks
            </Link>
            <Link to="/student/resources" className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold">
              Open Resources
            </Link>
          </div>
        </div>

        <div className="xl:col-span-5 bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <h3 className="text-2xl font-headline font-bold text-slate-900 mb-5">Upcoming Task Progress</h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No deadlines scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-widest text-primary font-bold">{task.task?.batch?.name || 'Batch'}</p>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${getStatusClasses(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-3">{task.task?.title}</p>
                  <p className="text-xs text-slate-500 mt-2">Due {formatDate(task.task?.deadline)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StudentTasks = ({ tasks, onUpdateStatus }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-headline font-bold text-slate-900">My Tasks</h2>
      <p className="text-slate-500 mt-1">Review your assignments and update their status as you work.</p>
    </div>

    <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
      {tasks.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          No tasks assigned yet.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border border-slate-100 rounded-2xl p-5 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-widest text-primary font-bold">{task.task?.batch?.name || 'Batch'}</p>
                  <h4 className="text-lg font-bold text-slate-900">{task.task?.title}</h4>
                  <p className="text-sm text-slate-500 max-w-3xl">{task.task?.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 pt-2">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-primary">event</span>
                      Due {formatDate(task.task?.deadline)}
                    </span>
                    {task.submissionDate && (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">upload</span>
                        Submitted {formatDate(task.submissionDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-3 min-w-[220px]">
                  <span className={`px-3 py-2 rounded-full text-xs font-bold ${getStatusClasses(task.status)}`}>
                    {task.status}
                  </span>
                  <select
                    className="w-full lg:w-auto bg-surface-container-low border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="WORKING">Working</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const StudentResources = ({ materials }) => {
  const videoMaterials = materials.filter((material) => material.type === 'VIDEO');
  const documentMaterials = materials.filter((material) => material.type === 'DOCUMENT');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">Resources</h2>
        <p className="text-slate-500 mt-1">Open shared recordings and study materials for your batches. Teams meeting recordings can be opened directly from these links.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <h3 className="text-xl font-headline font-bold text-slate-900 mb-5">Recording Links</h3>
          {videoMaterials.length === 0 ? (
            <p className="text-sm text-slate-500">No recording links shared yet.</p>
          ) : (
            <div className="space-y-4">
              {videoMaterials.map((material) => (
                <div key={material.id} className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">{material.batch?.name || 'Batch'}</p>
                  <p className="text-sm font-bold text-slate-900 mt-2">{material.title}</p>
                  <a href={material.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-primary hover:underline">
                    <span className="material-symbols-outlined text-base">videocam</span>
                    Open Recording
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <h3 className="text-xl font-headline font-bold text-slate-900 mb-5">Study Materials</h3>
          {documentMaterials.length === 0 ? (
            <p className="text-sm text-slate-500">No materials yet.</p>
          ) : (
            <div className="space-y-4">
              {documentMaterials.map((material) => (
                <div key={material.id} className="rounded-2xl bg-surface-container-low p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">{material.batch?.name || 'Batch'}</p>
                    <p className="text-sm font-bold text-slate-900 mt-2 break-words">{material.title}</p>
                    <a href={material.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-primary hover:underline">
                      <span className="material-symbols-outlined text-base">download</span>
                      Open Material
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [taskRes, materialRes] = await Promise.all([
        api.get('/student/my-tasks'),
        api.get('/student/my-materials')
      ]);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setMaterials(Array.isArray(materialRes.data) ? materialRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.post(`/student/tasks/${taskId}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) {
    return (
      <Layout roleTitle="Candidate Workspace">
        <div className="text-center py-16 text-slate-500">Loading your CPV...</div>
      </Layout>
    );
  }

  return (
    <Layout roleTitle="Candidate Workspace">
      <Routes>
        <Route path="/" element={<StudentHome user={user} tasks={tasks} materials={materials} />} />
        <Route path="/tasks" element={<StudentTasks tasks={tasks} onUpdateStatus={updateStatus} />} />
        <Route path="/resources" element={<StudentResources materials={materials} />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;
