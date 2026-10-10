/**
 * Period History Page
 * Displays user's period history and cycle statistics
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, TrendingUp, Calendar, Droplet, Clock, Edit2, Trash2, Plus, Sparkles } from 'lucide-react';
import { getPeriods, addPeriod, updatePeriod, deletePeriod } from '../services/periodService';
import { getCycleStats, predictNextPeriod, parseLocalDate } from '../services/cycleService';

const PeriodHistory = () => {
  const { user } = useAuth();
  const [periods, setPeriods] = useState([]);
  const [cycleStats, setCycleStats] = useState(null);
  const [predictedCycle, setPredictedCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    flow: 'Medium',
    notes: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [periodsResponse, statsResponse] = await Promise.all([
        getPeriods(),
        getCycleStats()
      ]);

      if (periodsResponse.data) {
        setPeriods(periodsResponse.data);
      }

      if (statsResponse.data) {
        setCycleStats(statsResponse.data);
      }

      // Fetch Next Period Prediction
      const lastPeriodCandidate = periodsResponse.data?.[0]?.start_date || user?.last_period_date;
      if (lastPeriodCandidate) {
        const predRes = await predictNextPeriod({
          last_period_date: lastPeriodCandidate,
          cycle_length: statsResponse.data?.avgCycleLength || Number(user?.cycle_length || 28),
          period_duration: statsResponse.data?.avgPeriodLength || 5,
          flow: periodsResponse.data?.[0]?.flow || 'Medium'
        });
        if (predRes.data) {
          setPredictedCycle(predRes.data);
        }
      }
    } catch (error) {
      console.error('Error loading period data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPeriod) {
        await updatePeriod(editingPeriod.id, formData);
      } else {
        await addPeriod(formData);
      }

      setShowAddModal(false);
      setEditingPeriod(null);
      setFormData({ start_date: '', end_date: '', flow: 'Medium', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error saving period:', error);
      alert('Failed to save period. Please try again.');
    }
  };

  const handleEdit = (period) => {
    setEditingPeriod(period);
    setFormData({
      start_date: period.start_date,
      end_date: period.end_date || '',
      flow: period.flow || 'Medium',
      notes: period.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (periodId) => {
    if (!window.confirm('Are you sure you want to delete this period record?')) {
      return;
    }

    try {
      await deletePeriod(periodId);
      loadData();
    } catch (error) {
      console.error('Error deleting period:', error);
      alert('Failed to delete period. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateDuration = (start, end) => {
    if (!end) return '--';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F472B6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="text-[#F472B6]" />
          Period History
        </h1>
        <p className="text-gray-600 mt-2">Track and view your menstrual cycle history</p>
      </div>

      {/* Statistics Cards */}
      {cycleStats && cycleStats.totalCycles > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Cycle</span>
              <TrendingUp className="h-4 w-4 text-[#F472B6]" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {cycleStats.avgCycleLength || '--'} days
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Period</span>
              <Droplet className="h-4 w-4 text-[#F472B6]" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {cycleStats.avgPeriodLength || '--'} days
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#F472B6]/40 shadow-sm bg-gradient-to-br from-white to-[#FCE7F3]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#E95A7A] flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-[#E95A7A]" /> Next Period
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E95A7A] bg-[#FCE7F3] px-2 py-0.5 rounded-full">
                {predictedCycle?.modelUsed === 'xgboost_pipeline' ? 'AI Model' : 'Estimated'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {predictedCycle?.nextPeriodDate
                ? parseLocalDate(predictedCycle.nextPeriodDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '--'}
            </div>
            {predictedCycle?.daysUntil !== undefined && predictedCycle?.daysUntil !== null && (
              <span className="text-xs text-gray-500 font-medium">
                {predictedCycle.daysUntil > 0 ? `In ${predictedCycle.daysUntil} days` : predictedCycle.daysUntil === 0 ? 'Today' : `${Math.abs(predictedCycle.daysUntil)}d past`}
              </span>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Shortest</span>
              <Clock className="h-4 w-4 text-[#F472B6]" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {cycleStats.shortest || '--'} days
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Longest</span>
              <Clock className="h-4 w-4 text-[#F472B6]" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {cycleStats.longest || '--'} days
            </div>
          </div>
        </div>
      )}

      {/* Add Period Button */}
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingPeriod(null);
            setFormData({ start_date: '', end_date: '', flow: 'Medium', notes: '' });
            setShowAddModal(true);
          }}
          className="bg-[#F472B6] hover:bg-[#db62a2] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add Period
        </button>
      </div>

      {/* Period List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {periods.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarDays className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No periods logged yet. Start tracking your cycle!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Flow</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {periods.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {formatDate(period.start_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(period.end_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {calculateDuration(period.start_date, period.end_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        period.flow === 'Heavy' || period.flow === 'Very Heavy'
                          ? 'bg-red-100 text-red-800'
                          : period.flow === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {period.flow || '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {period.notes || '--'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(period)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(period.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingPeriod ? 'Edit Period' : 'Add Period'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F472B6] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F472B6] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flow Intensity
                </label>
                <select
                  value={formData.flow}
                  onChange={(e) => setFormData({ ...formData, flow: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F472B6] focus:border-transparent outline-none"
                >
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                  <option value="Spotting">Spotting</option>
                  <option value="Very Heavy">Very Heavy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F472B6] focus:border-transparent outline-none resize-none"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPeriod(null);
                    setFormData({ start_date: '', end_date: '', flow: 'Medium', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F472B6] hover:bg-[#db62a2] text-white rounded-lg transition-colors"
                >
                  {editingPeriod ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodHistory;
