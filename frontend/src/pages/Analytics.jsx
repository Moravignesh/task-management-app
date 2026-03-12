import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const PIE_COLORS = ['#6b7280', '#3b82f6', '#22c55e'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/tasks')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const pieData = [
    { name: 'Pending', value: data?.pending_tasks || 0 },
    { name: 'In Progress', value: data?.in_progress_tasks || 0 },
    { name: 'Completed', value: data?.completed_tasks || 0 },
  ];

  const barData = (data?.tasks_per_project || []).map(p => ({
    name: p.project_name.length > 15 ? p.project_name.substring(0, 15) + '...' : p.project_name,
    tasks: p.task_count,
  }));

  const completionRate = data?.total_tasks > 0
    ? Math.round((data.completed_tasks / data.total_tasks) * 100)
    : 0;

  const statCards = [
    { label: 'Total Tasks', value: data?.total_tasks || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: data?.completed_tasks || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'In Progress', value: data?.in_progress_tasks || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Pending', value: data?.pending_tasks || 0, icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your task progress and project insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card text-center">
            <div className={`inline-flex p-3 rounded-xl ${bg} mb-3`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Completion Rate</h2>
          <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{data?.completed_tasks} of {data?.total_tasks} tasks completed</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tasks Per Project</h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">No project data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Status Distribution</h2>
          {data?.total_tasks === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">No task data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
