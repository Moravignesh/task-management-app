import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FolderOpen, CheckSquare, Clock, TrendingUp, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, projectsRes, tasksRes] = await Promise.all([
          api.get('/analytics/tasks'),
          api.get('/projects'),
          api.get('/tasks/assigned'),
        ]);
        setAnalytics(analyticsRes.data);
        setProjects(projectsRes.data.slice(0, 4));
        setAssignedTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = analytics ? [
    { label: 'Total Tasks', value: analytics.total_tasks, icon: CheckSquare, color: 'blue', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Completed', value: analytics.completed_tasks, icon: TrendingUp, color: 'green', bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'In Progress', value: analytics.in_progress_tasks, icon: Clock, color: 'yellow', bg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Projects', value: projects.length, icon: FolderOpen, color: 'purple', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ] : [];

  const statusColors = {
    'Pending': 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="card">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No projects yet</p>
              <Link to="/projects" className="text-blue-600 text-sm hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/tasks`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{project.project_name}</p>
                    <p className="text-xs text-gray-500 truncate">{project.description || 'No description'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assigned to Me</h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {assignedTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
