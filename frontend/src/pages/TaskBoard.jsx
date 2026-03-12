import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, ChevronLeft, User } from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const STATUS_COLORS = {
  'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
};

function TaskModal({ task, projectId, users, onClose, onSave }) {
  const [form, setForm] = useState({
    project_id: projectId,
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Pending',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    assigned_to: task?.assigned_to || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
      due_date: form.due_date || null,
    };
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Task description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Assign To</label>
            <select
              className="input-field"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-snug">{task.title}</h4>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}
      {task.due_date && (
        <p className="text-xs text-gray-400 mb-2">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}
      {task.assignee && (
        <div className="flex items-center gap-1 mb-3">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-blue-600" />
          </div>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className={`text-xs px-2 py-1 rounded-full border font-medium w-full ${STATUS_COLORS[task.status]}`}
      >
        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

export default function TaskBoard() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchData = async () => {
    try {
      const [tasksRes, projectRes, usersRes] = await Promise.all([
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}`),
        api.get('/notifications/users'),
      ]);
      setTasks(tasksRes.data);
      setProject(projectRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const tasksByStatus = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/projects" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-1">
            <ChevronLeft className="w-4 h-4" /> Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project?.project_name}</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STATUS_OPTIONS.map(status => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${STATUS_COLORS[status]}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">{tasksByStatus[status].length}</span>
            </div>
            <div className="space-y-3 min-h-[200px] bg-gray-50 rounded-xl p-3">
              {tasksByStatus[status].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => setModal(t)}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {tasksByStatus[status].length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          projectId={parseInt(projectId)}
          users={users}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchData(); }}
        />
      )}
    </div>
  );
}
