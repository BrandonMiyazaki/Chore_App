import { useState, useEffect } from 'react';
import { lessonsApi, completedLessonsApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Avatar from '../components/Avatar';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const DEFAULT_ICONS = ['📚', '🧪', '🎨', '🎵', '🌎', '🧩', '✍️', '🏰', '📝', '🌿', '🔢', '🎭'];
const TOPICS = ['Reading', 'Math', 'Science', 'Art', 'Music', 'Geography', 'Writing', 'History', 'Language'];

export default function ParentDashboard() {
  const { isParent } = useAuth();
  const [tab, setTab] = useState('lessons'); // 'lessons' | 'approvals' | 'members'
  const [lessons, setLessons] = useState([]);
  const [pending, setPending] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lesson form state
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: 'Reading',
    points: 10,
    icon: '📚',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lessonsRes, pendingRes, membersRes] = await Promise.all([
        lessonsApi.list(),
        completedLessonsApi.list({ status: 'pending' }),
        usersApi.list(),
      ]);
      setLessons(lessonsRes.data);
      setPending(pendingRes.data);
      setMembers(membersRes.data);
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', topic: 'Reading', points: 10, icon: '📚' });
    setEditingLesson(null);
    setShowForm(false);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await lessonsApi.update(editingLesson.id, formData);
      } else {
        await lessonsApi.create(formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError('Failed to save lesson.');
    }
  };

  const handleEditLesson = (lesson) => {
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      topic: lesson.topic,
      points: lesson.points,
      icon: lesson.icon || '📚',
    });
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Deactivate this lesson?')) return;
    try {
      await lessonsApi.delete(id);
      fetchData();
    } catch {
      setError('Failed to delete lesson.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await completedLessonsApi.approve(id);
      fetchData();
    } catch {
      setError('Failed to approve.');
    }
  };

  const handleReject = async (id) => {
    try {
      await completedLessonsApi.reject(id);
      fetchData();
    } catch {
      setError('Failed to reject.');
    }
  };

  if (!isParent) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-gray-500 text-lg">Parents only area.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Parent Dashboard ⚙️</h1>
      <p className="text-gray-400 text-center mb-6">Manage lessons and approvals</p>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-6">
        {[
          { key: 'lessons', label: '📚 Lessons', count: lessons.length },
          { key: 'approvals', label: '⏳ Approvals', count: pending.length },
          { key: 'members', label: '👨‍👩‍👧‍👦 Members', count: members.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all relative
              ${tab === key
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold
                ${tab === key ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Lessons Tab ── */}
      {tab === 'lessons' && (
        <div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary flex items-center gap-2 mx-auto mb-6"
          >
            <FiPlus /> New Lesson
          </button>

          {/* Lesson Form Modal */}
          {showForm && (
            <div className="card mb-6 border-2 border-primary-200 animate-slide-up">
              <h3 className="font-bold text-lg mb-4">
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </h3>
              <form onSubmit={handleSaveLesson} className="space-y-3">
                <input
                  type="text"
                  placeholder="Lesson title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="input-field"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Points"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="1"
                    max="100"
                    required
                  />
                </div>

                {/* Icon Picker */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Icon:</p>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all
                          ${formData.icon === icon
                            ? 'bg-primary-100 ring-2 ring-primary-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-success flex-1">
                    {editingLesson ? 'Save Changes' : 'Create Lesson'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lesson List */}
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="card flex items-center gap-4 animate-fade-in">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-kid-purple flex items-center justify-center text-2xl flex-shrink-0">
                  {lesson.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{lesson.title}</h3>
                  <p className="text-xs text-gray-400">{lesson.topic} · {lesson.points} pts</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approvals Tab ── */}
      {tab === 'approvals' && (
        <div>
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-gray-400 text-lg">No pending approvals!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((cl) => (
                <div key={cl.id} className="card flex items-center gap-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {cl.lesson?.icon || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{cl.lesson?.title}</h3>
                    <p className="text-xs text-gray-400">
                      by {cl.user?.name || 'Unknown'} ·{' '}
                      {cl.completedAt
                        ? new Date(cl.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(cl.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all"
                      title="Approve"
                    >
                      <FiCheck size={20} />
                    </button>
                    <button
                      onClick={() => handleReject(cl.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                      title="Reject"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Members Tab ── */}
      {tab === 'members' && (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="card flex items-center gap-4 animate-fade-in">
              <Avatar avatarUrl={member.avatarUrl} name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{member.name}</h3>
                <p className="text-xs text-gray-400 capitalize">{member.role}</p>
              </div>
              <span className="text-sm font-bold text-yellow-600">
                {member.totalPoints || 0} ⭐
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
