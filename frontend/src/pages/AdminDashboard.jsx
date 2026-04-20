import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const toDateValue = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const toBackendDateTime = (value) => {
  return value ? `${value}T00:00:00` : '';
};

const parseCourseDurationWeeks = (duration) => {
  const match = String(duration || '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const buildBatchScheduleFromCourse = (course) => {
  return buildBatchScheduleFromCourseAndStartDate(course, toDateValue(new Date()));
};

const buildBatchScheduleFromCourseAndStartDate = (course, startDateValue) => {
  const weeks = parseCourseDurationWeeks(course?.duration);
  if (!weeks || !startDateValue) {
    return { startTime: '', endTime: '' };
  }

  const start = new Date(`${startDateValue}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    return { startTime: '', endTime: '' };
  }

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + (weeks * 7));

  return {
    startTime: startDateValue,
    endTime: toDateValue(end)
  };
};

const formatBatchSchedule = (startTime, endTime) => {
  if (!startTime && !endTime) {
    return 'Schedule pending';
  }

  const formatValue = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString([], {
      dateStyle: 'medium'
    });
  };

  const formattedStart = formatValue(startTime);
  const formattedEnd = formatValue(endTime);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  return formattedStart || formattedEnd || 'Schedule pending';
};

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, value, icon, trend, trendIcon, subtitle }) => (
  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)] relative overflow-hidden group">
    {trend && (
      <div className="absolute top-4 right-4 bg-tertiary/10 text-tertiary px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
        <span className="material-symbols-outlined text-[14px]">{trendIcon}</span>
        {trend}
      </div>
    )}
    <p className="font-body uppercase tracking-wider text-[11px] text-slate-500 mb-2">{title}</p>
    <h3 className="text-3xl font-headline font-bold text-slate-900">{value}</h3>
    <div className="mt-4 flex items-center text-xs text-slate-400 gap-1">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {subtitle || 'vs. last month'}
    </div>
  </div>
);

// --- QUICK ACTION COMPONENT ---
const QuickAction = ({ icon, title, subtitle, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all group backdrop-blur-md w-full text-left">
    <div className="w-10 h-10 rounded-lg bg-white text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="font-bold font-headline">{title}</p>
      <p className="text-[11px] text-white/70">{subtitle}</p>
    </div>
  </button>
);

// --- SUB-COMPONENT: DASHBOARD OVERVIEW ---
const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    trainers: 0,
    batches: 0,
    courses: 0
  });
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, t, b, c, p] = await Promise.all([
          api.get('/admin/students'),
          api.get('/admin/trainers'),
          api.get('/admin/batches'),
          api.get('/admin/courses'),
          api.get('/admin/pending-students')
        ]);
        setStats({
          students: s.data.length,
          trainers: t.data.length,
          batches: b.data.length,
          courses: c.data.length
        });
        setPending(p.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.post(`/admin/verify-student/${id}`);
      const p = await api.get('/admin/pending-students');
      setPending(p.data.slice(0, 4));
      const s = await api.get('/admin/students');
      setStats(prev => ({ ...prev, students: s.data.length }));
    } catch (err) {
      console.error("Verification failed", err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
        <p className="text-slate-500 font-body mt-1">Overview of the Academic Atelier performance and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Students" value={stats.students} icon="history" trend="+12.5%" trendIcon="trending_up" />
        <StatCard title="Total Trainers" value={stats.trainers} subtitle="98% Active rate" icon="check_circle" />
        <StatCard title="Total Batches" value={stats.batches} subtitle="Active academic groups" icon="schedule" />
        <StatCard title="Total Courses" value={stats.courses} subtitle="Curricula available" icon="star" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-transparent bg-surface-container-low flex justify-between items-center">
              <h4 className="font-headline font-bold text-slate-900">Recent Student Verifications</h4>
              <Link to="/admin/students" className="text-primary text-xs font-semibold hover:underline">View All</Link>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-separate border-spacing-y-1 px-4">
                <thead>
                  <tr className="text-slate-500 font-body uppercase tracking-wider text-[11px]">
                    <th className="px-4 py-4 font-semibold">Name</th>
                    <th className="px-4 py-4 font-semibold">Email</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm">
                  {pending.map(s => (
                    <tr key={s.id} className="group hover:bg-surface-container-low transition-colors rounded-lg">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          {s.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{s.username}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{s.email}</td>
                      <td className="px-4 py-4">
                        <span className="bg-error/10 text-error px-3 py-1 rounded-full text-[11px] font-bold">Pending</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleVerify(s.id)}
                          className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-container transition-all active:scale-95"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-500 italic">No pending verifications</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-primary bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl shadow-[0px_12px_32px_rgba(53,37,205,0.1)] text-white relative overflow-hidden mb-8">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <h4 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">bolt</span>
              Quick Actions
            </h4>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              <QuickAction icon="person_add" title="Add Student" subtitle="Register a new student" onClick={() => navigate('/admin/students')} />
              <QuickAction icon="hail" title="Add Trainer" subtitle="Onboard faculty members" onClick={() => navigate('/admin/trainers')} />
              <QuickAction icon="add_box" title="Create Course" subtitle="Launch new curriculum" onClick={() => navigate('/admin/courses')} />
              <QuickAction icon="calendar_add_on" title="Create Batch" subtitle="Schedule academic groups" onClick={() => navigate('/admin/batches')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: COURSE MANAGEMENT ---
const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', duration: '', description: '' });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/batches')
      ]);
      console.log("Courses fetched:", cRes.data);
      setCourses(cRes.data);
      setBatches(bRes.data);
    } catch (err) { console.error("Error fetching courses:", err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Backend expectations: name, duration, description
      await api.post('/admin/courses', {
        name: newCourse.name,
        duration: newCourse.duration,
        description: newCourse.description || `Comprehensive curriculum for ${newCourse.name}`
      });
      setNewCourse({ name: '', duration: '', description: '' });
      setShowForm(false);
      fetchCourses();
    } catch (err) { alert("Failed to create course"); }
  };

  const getBatchCount = (courseId) => {
    return (Array.isArray(batches) ? batches : []).filter(b => b.course?.id === courseId).length;
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight text-slate-900">Course Management</h2>
          <p className="text-slate-500 font-body mt-2">Curate and manage your institute's academic curriculum.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-semibold shadow-[0px_12px_32px_rgba(53,37,205,0.15)] transition-transform active:scale-95">
          <span className="material-symbols-outlined text-xl">{showForm ? 'close' : 'add'}</span>
          <span>{showForm ? 'Close Form' : 'Create New Course'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-primary p-8 rounded-2xl text-white mb-8 shadow-xl">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Course Name</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} placeholder="e.g. Full Stack Development" required />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Duration (Weeks)</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none" value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="e.g. 12 Weeks" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Description</label>
              <textarea className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none" rows="2" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Optional course summary..."></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="bg-white text-primary px-8 py-2 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95">Launch Course</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Courses" value={courses.length} subtitle="Institute Wide" icon="menu_book" trend="+12%" trendIcon="trending_up" />
        <StatCard title="Active Batches" value={batches.length} subtitle="Ongoing sessions" icon="layers" />
        <StatCard title="Avg. Duration" value="4.5 Mo." subtitle="Per course" icon="schedule" />
        <StatCard title="Enrolled Students" value="2,840" subtitle="Total across batches" icon="group" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(Array.isArray(courses) ? courses : []).map(course => (
          <CourseCard
            key={course.id}
            course={course}
            batchCount={getBatchCount(course.id)}
          />
        ))}
        {courses.length === 0 && !showForm && (
          <div onClick={() => setShowForm(true)} className="col-span-full border-2 border-dashed border-outline-variant/40 rounded-[2rem] flex flex-col items-center justify-center p-12 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <h4 className="font-headline font-bold text-lg text-slate-900">Add New Curriculum</h4>
            <p className="text-slate-500 text-sm font-body mt-2 max-w-md mx-auto">Design a new course path for the upcoming academic session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, batchCount }) => (
  <div className="group bg-surface-container-lowest rounded-[2rem] overflow-hidden flex flex-col shadow-[0px_12px_32px_rgba(53,37,205,0.03)] hover:shadow-[0px_20px_48px_rgba(53,37,205,0.08)] transition-all duration-300">
    <div className="relative h-48 bg-slate-200">
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      <div className="absolute bottom-4 left-6">
        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-label uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
          Academic
        </span>
      </div>
    </div>
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-xl font-bold font-headline leading-tight">{course.name}</h4>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
      </div>
      <p className="text-slate-500 text-sm font-body mb-6 line-clamp-2">{course.description || `Master the concepts of ${course.name} through our comprehensive curriculum.`}</p>
      <div className="flex items-center gap-6 mb-8 text-slate-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">schedule</span>
          <span className="text-xs font-semibold">{course.duration || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">group</span>
          <span className="text-xs font-semibold">{batchCount} Batches</span>
        </div>
      </div>
    </div>
  </div >
);

// --- SUB-COMPONENT: STUDENT MANAGEMENT ---
const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ username: '', email: '', password: '' });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/pending-students')
      ]);
      setStudents(allRes.data);
      setPending(pendingRes.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', {
        username: newStudent.username,
        email: newStudent.email,
        password: newStudent.password,
        role: 'ROLE_STUDENT'
      });
      setNewStudent({ username: '', email: '', password: '' });
      setShowForm(false);
      fetchStudents();
    } catch (err) { alert("Failed to register student"); }
  };

  const handleStatus = async (id, verify) => {
    const endpoint = verify ? `/admin/verify-student/${id}` : `/admin/revoke-student/${id}`;
    await api.post(endpoint);
    fetchStudents();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-6">
        <div>

          <h2 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Enroll, verify, and organize your academic cohort.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-xl font-headline font-bold text-sm shadow-[0px_12px_32px_rgba(53,37,205,0.15)] flex items-center gap-2 hover:scale-[1.02] transition-transform">
          <span className="material-symbols-outlined">{showForm ? 'close' : 'person_add'}</span>
          {showForm ? 'Close Form' : '+ Add New Student'}
        </button>
      </div>

      {showForm && (
        <div className="bg-primary p-8 rounded-2xl text-white mb-8 shadow-xl">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Username</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none transition-all" value={newStudent.username} onChange={e => setNewStudent({ ...newStudent, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Email</label>
              <input type="email" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none transition-all" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Initial Password</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none transition-all" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} required />
            </div>
            <div className="md:col-span-3 text-right">
              <button type="submit" className="bg-white text-primary px-8 py-2 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95">Register Student</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest p-5 rounded-2xl mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-lg">
            <span className="material-symbols-outlined text-slate-400 text-lg">filter_list</span>
            <span className="text-sm font-semibold text-slate-700">Filter by Batch:</span>
            <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 p-0 cursor-pointer">
              <option>All Active Batches</option>
            </select>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">All Students ({students.length})</span>
            <span className="px-3 py-1 bg-surface-container-high text-slate-500 text-[11px] font-bold rounded-full uppercase tracking-wider">Pending ({pending.length})</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-separate border-spacing-y-1 px-4">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="py-4 px-6 text-[11px] font-label font-bold uppercase tracking-widest text-slate-500 rounded-l-xl">Student Name</th>
              <th className="py-4 px-6 text-[11px] font-label font-bold uppercase tracking-widest text-slate-500">Email</th>
              <th className="py-4 px-6 text-[11px] font-label font-bold uppercase tracking-widest text-slate-500">Status</th>
              <th className="py-4 px-6 text-[11px] font-label font-bold uppercase tracking-widest text-slate-500 rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-2">
            {pending.map(s => (
              <tr key={s.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold text-xs">
                      {s.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.username}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Student ID: AT-{s.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6"><span className="text-sm text-slate-500">{s.email}</span></td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    Pending
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button onClick={() => handleStatus(s.id, true)} className="bg-white border border-outline-variant text-primary px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                    Verify
                  </button>
                </td>
              </tr>
            ))}
            {students.filter(s => s.verified).map(s => (
              <tr key={s.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {s.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.username}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Student ID: AT-{s.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6"><span className="text-sm text-slate-500">{s.email}</span></td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#006E4B] text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006E4B]"></span>
                    Verified
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStatus(s.id, false)} className="p-2 text-slate-400 hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: TRAINER MANAGEMENT ---
const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ username: '', email: '', password: '', role: 'ROLE_TRAINER' });

  useEffect(() => { fetchTrainers(); }, []);

  const fetchTrainers = async () => {
    const res = await api.get('/admin/trainers');
    setTrainers(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/trainers', newTrainer);
      setNewTrainer({ username: '', email: '', password: '', role: 'ROLE_TRAINER' });
      setShowForm(false);
      fetchTrainers();
    } catch (err) { alert("Failed to onboard trainer"); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-10">
        <div>

          <h2 className="text-4xl font-extrabold text-on-surface headline tracking-tight">Manage Trainers</h2>
          <p className="text-slate-500 text-sm mt-2">Onboard faculty, review trainer profiles, and monitor instructional capacity.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-[0px_12px_32px_rgba(53,37,205,0.15)] active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-lg">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Close Form' : 'Add New Trainer'}
        </button>
      </div>

      {showForm && (
        <div className="bg-primary p-8 rounded-2xl text-white mb-8 shadow-xl">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80 tracking-widest">Username</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none transition-all" value={newTrainer.username} onChange={e => setNewTrainer({ ...newTrainer, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80 tracking-widest">Email</label>
              <input type="email" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none transition-all" value={newTrainer.email} onChange={e => setNewTrainer({ ...newTrainer, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80 tracking-widest">Initial Password</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none transition-all" value={newTrainer.password} onChange={e => setNewTrainer({ ...newTrainer, password: e.target.value })} required />
            </div>
            <div className="md:col-span-3 text-right">
              <button type="submit" className="bg-white text-primary px-8 py-2 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95">Register & Onboard</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0px_12px_48px_rgba(0,0,0,0.03)] border border-outline-variant/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-8 py-5 text-[11px] font-bold font-label uppercase tracking-widest text-slate-500">Trainer Details</th>
              <th className="px-8 py-5 text-[11px] font-bold font-label uppercase tracking-widest text-slate-500">Contact Email</th>
              <th className="px-8 py-5 text-[11px] font-bold font-label uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-8 py-5 text-[11px] font-bold font-label uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {trainers.map(t => (
              <tr key={t.id} className="group hover:bg-surface-container-low/30 dark:hover:bg-transparent transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary font-bold">
                      {t.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{t.username}</p>
                      <p className="text-sm text-slate-500 font-body">ID: TR-{t.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6"><span className="text-sm font-semibold text-slate-700">{t.email}</span></td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#006E4B] text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006E4B]"></span>
                    Active
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-surface-container-lowest p-8 rounded-3xl shadow-[0px_12px_48px_rgba(0,0,0,0.02)] border border-outline-variant/5">
          <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">insights</span>
            Faculty Performance Overview
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <PerformanceCard title="Total Active" value={trainers.length} trend="+4 this month" trendColor="text-[#005338]" icon="trending_up" />
            <PerformanceCard title="Session Hours" value="1,240" trend="Avg. 45h/trainer" trendColor="text-[#005338]" icon="schedule" />
            <PerformanceCard title="Student Rating" value="4.9" trend="Top in Class" trendColor="text-[#005338]" icon="star" />
          </div>
        </div>
        <div className="col-span-4 bg-primary-container p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-headline text-xl font-bold mb-6">Course Allocation</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <span className="material-symbols-outlined mt-1">auto_awesome</span>
                <div>
                  <p className="text-sm font-bold">New Trainer Onboarded</p>
                  <p className="text-xs text-on-primary-container/80 mt-1">Recently added {trainers.length > 0 ? trainers[trainers.length - 1].username : 'new faculty'}.</p>
                </div>
              </div>
            </div>
            <button className="mt-8 w-full py-3 bg-white text-primary font-bold rounded-xl active:scale-95 transition-transform">
              Manage Vacancies
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

const PerformanceCard = ({ title, value, trend, icon, trendColor }) => (
  <div className="p-6 rounded-2xl bg-surface-container-low">
    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">{title}</p>
    <h4 className="text-3xl font-extrabold text-slate-900">{value}</h4>
    <div className={`mt-3 flex items-center text-xs font-bold ${trendColor}`}>
      <span className="material-symbols-outlined text-sm mr-1">{icon}</span>
      {trend}
    </div>
  </div>
);

// --- SUB-COMPONENT: BATCH & ENROLLMENT ---
const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeForm, setActiveForm] = useState(null); // 'create' or 'enroll'
  const initialBatchForm = {
    name: '',
    courseId: '',
    trainerId: '',
    startTime: '',
    endTime: ''
  };
  const [newBatch, setNewBatch] = useState(initialBatchForm);
  const [enroll, setEnroll] = useState({ batchId: '', studentId: '' });

  const selectedCourse = (Array.isArray(courses) ? courses : []).find(c => String(c.id) === newBatch.courseId);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [b, c, t, s] = await Promise.all([
        api.get('/admin/batches'),
        api.get('/admin/courses'),
        api.get('/admin/trainers'),
        api.get('/admin/students')
      ]);
      setBatches(b.data);
      setCourses(c.data);
      setTrainers(t.data);
      setStudents(s.data.filter(st => st.verified));

      if (selectedBatch) {
        const updated = b.data.find(batch => batch.id === selectedBatch.id);
        if (updated) setSelectedBatch(updated);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const payload = {
      ...newBatch,
      courseId: Number(newBatch.courseId),
      trainerId: Number(newBatch.trainerId),
      startTime: toBackendDateTime(newBatch.startTime),
      endTime: toBackendDateTime(newBatch.endTime)
    };

    try {
      await api.post('/admin/batches', payload);
      setNewBatch(initialBatchForm);
      setActiveForm(null);
      fetchData();
      alert('Batch Scheduled');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule batch');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/batches/${enroll.batchId}/students/${enroll.studentId}`);
      setEnroll({ ...enroll, studentId: '' });
      setActiveForm(null);
      fetchData();
      alert('Student Enrolled');
    } catch (err) { alert("Failed to enroll student"); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">Batch Management</h2>
          <p className="text-slate-500 text-sm mt-1">Schedule academic batches, assign trainers, and manage student enrollment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-body uppercase tracking-widest text-[11px] text-slate-500 mb-1">Total Batches</p>
            <h3 className="text-3xl font-bold text-slate-900">{Array.isArray(batches) ? batches.length : 0}</h3>
            <div className="mt-4 flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-xs font-semibold">+3 this month</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-slate-50 opacity-50 group-hover:scale-110 transition-transform">layers</span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <p className="font-body uppercase tracking-widest text-[11px] text-slate-500 mb-1">Active Students</p>
          <h3 className="text-3xl font-bold text-slate-900">{Array.isArray(students) ? students.length : 0}</h3>
          <div className="mt-4 flex items-center gap-1 text-tertiary">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-semibold">+12% vs last term</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
          <p className="font-body uppercase tracking-widest text-[11px] text-slate-500 mb-1">Ongoing Sessions</p>
          <h3 className="text-3xl font-bold text-slate-900">12</h3>
          <div className="mt-4 flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-sm">radio_button_checked</span>
            <span className="text-xs font-semibold">Currently Live</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => setActiveForm(activeForm === 'create' ? null : 'create')} className="flex-1 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">
            <span className="material-symbols-outlined">{activeForm === 'create' ? 'close' : 'add_circle'}</span>
            {activeForm === 'create' ? 'Cancel' : 'Schedule Batch'}
          </button>
          <button onClick={() => setActiveForm(activeForm === 'enroll' ? null : 'enroll')} className="flex-1 bg-white text-primary border border-primary/10 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined">{activeForm === 'enroll' ? 'close' : 'person_add'}</span>
            {activeForm === 'enroll' ? 'Cancel' : 'Add Students'}
          </button>
        </div>
      </div>

      {activeForm === 'create' && (
        <div className="bg-primary p-8 rounded-2xl text-white mb-8 shadow-xl">
          <h3 className="text-xl font-bold mb-6">Schedule New Batch</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Batch Name</label>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none" value={newBatch.name} onChange={e => setNewBatch({ ...newBatch, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Select Course</label>
              <select
                className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none"
                value={newBatch.courseId}
                onChange={e => {
                  const courseId = e.target.value;
                  const selectedCourse = (Array.isArray(courses) ? courses : []).find(c => String(c.id) === courseId);
                  const nextStartDate = newBatch.startTime || '';
                  const schedule = buildBatchScheduleFromCourseAndStartDate(selectedCourse, nextStartDate);
                  setNewBatch({
                    ...newBatch,
                    courseId,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime
                  });
                }}
                required
              >
                <option value="" className="text-slate-900">Choose Course</option>
                {(Array.isArray(courses) ? courses : []).map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Assign Trainer</label>
              <select className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none" value={newBatch.trainerId} onChange={e => setNewBatch({ ...newBatch, trainerId: e.target.value })} required>
                <option value="" className="text-slate-900">Choose Trainer</option>
                {(Array.isArray(trainers) ? trainers : []).map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.username}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Start Date</label>
              <input
                type="date"
                className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 focus:outline-none [color-scheme:dark]"
                value={newBatch.startTime}
                onChange={e => {
                  const startTime = e.target.value;
                  const schedule = buildBatchScheduleFromCourseAndStartDate(selectedCourse, startTime);
                  setNewBatch({
                    ...newBatch,
                    startTime,
                    endTime: schedule.endTime
                  });
                }}
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 opacity-80">Auto End Date</label>
              <input
                type="date"
                className="w-full bg-white/10 border-white/20 rounded-lg px-4 py-2 text-white disabled:text-white/60 disabled:bg-white/5 disabled:cursor-not-allowed focus:bg-white/20 focus:outline-none [color-scheme:dark]"
                value={newBatch.endTime}
                disabled
                required
              />
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 flex items-center">
              <p className="text-sm text-white/85">
                Duration: {selectedCourse?.duration || 'Select a course'}
              </p>
            </div>
            <div className="md:col-span-3 text-right">
              <button type="submit" className="bg-white text-primary px-8 py-2 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95">Schedule Now</button>
            </div>
          </form>
        </div>
      )}

      {activeForm === 'enroll' && (
        <div className="bg-surface-container-low p-8 rounded-2xl mb-8 border-2 border-primary/20">
          <h3 className="text-xl font-bold mb-6 text-slate-900">Enroll Student in Batch</h3>
          <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Target Batch</label>
              <select className="w-full bg-white border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20" value={enroll.batchId} onChange={e => setEnroll({ ...enroll, batchId: e.target.value })} required>
                <option value="">Select Batch</option>
                {(Array.isArray(batches) ? batches : []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold mb-2 text-slate-500">Student</label>
              <select className="w-full bg-white border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20" value={enroll.studentId} onChange={e => setEnroll({ ...enroll, studentId: e.target.value })} required>
                <option value="">Select Student</option>
                {(Array.isArray(students) ? students : []).map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 text-right">
              <button type="submit" className="bg-primary text-white px-8 py-2 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95">Complete Enrollment</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={selectedBatch ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">Active Batches</h4>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 font-body uppercase tracking-wider text-[11px] text-slate-500 font-semibold">Batch Details</th>
                  <th className="px-6 py-4 font-body uppercase tracking-wider text-[11px] text-slate-500 font-semibold">Trainer</th>
                  <th className="px-6 py-4 font-body uppercase tracking-wider text-[11px] text-slate-500 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(batches) ? batches : []).map(b => (
                  <tr key={b.id} onClick={() => setSelectedBatch(b)} className={`hover:bg-surface-container-low transition-colors group cursor-pointer ${selectedBatch?.id === b.id ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{b.name}</span>
                        <span className="text-xs text-slate-500">{b.course?.name}</span>
                        <span className="text-[11px] text-slate-400 mt-1">{formatBatchSchedule(b.startTime, b.endTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {b.trainer?.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{b.trainer?.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-primary font-bold text-xs hover:underline">View Students ({b.students?.length || 0})</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedBatch && (
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900">Students in {selectedBatch.name}</h4>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_12px_32px_rgba(53,37,205,0.04)]">
              <div className="mb-4 rounded-xl bg-surface-container-low p-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Schedule</p>
                <p className="text-sm font-semibold text-slate-700">{formatBatchSchedule(selectedBatch.startTime, selectedBatch.endTime)}</p>
              </div>
              <div className="space-y-4">
                {selectedBatch.students && selectedBatch.students.length > 0 ? (
                  selectedBatch.students.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary font-bold shadow-sm">
                          {s.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.username}</p>
                          <p className="text-[10px] text-slate-500">{s.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-full uppercase">Enrolled</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 italic">No students enrolled in this batch yet.</div>
                )}
              </div>
              <button onClick={() => { setActiveForm('enroll'); setEnroll(prev => ({ ...prev, batchId: selectedBatch.id })) }} className="w-full mt-6 py-3 border-2 border-dashed border-primary/30 text-primary font-bold text-sm rounded-xl hover:bg-primary/5 transition-all">
                + Enroll More Students
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN ADMIN ROUTER ---
const AdminDashboard = () => {
  return (
    <Layout roleTitle="Super Administrator">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/students" element={<ManageStudents />} />
        <Route path="/trainers" element={<ManageTrainers />} />
        <Route path="/courses" element={<ManageCourses />} />
        <Route path="/batches" element={<ManageBatches />} />
      </Routes>

      {/* FAB for Create Action */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary hover:bg-primary-container text-white w-14 h-14 rounded-full shadow-[0px_12px_32px_rgba(53,37,205,0.2)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group">
          <span className="material-symbols-outlined text-3xl">add</span>
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Create Entry</span>
        </button>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
