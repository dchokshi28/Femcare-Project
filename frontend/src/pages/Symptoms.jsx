/**
 * Symptoms Tracking Page
 * Displays and manages symptom history
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Plus, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { getSymptoms, addSymptom, updateSymptom, deleteSymptom } from '../services/symptomService';

const SYMPTOM_OPTIONS = [
  'Cramps',
  'Headache',
  'Bloating',
  'Mood Changes',
  'Fatigue',
  'Back Pain',
  'Nausea',
  'Acne',
  'Breast Tenderness',
  'Food Cravings',
  'Anxiety',
  'Depression'
];

const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];

const Symptoms = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState(null);
  const [formData, setFormData] = useState({
    symptom_date: new Date().toISOString().split('T')[0],
    symptom_name: 'Cramps',
    severity: 'Moderate',
    notes: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadSymptoms();
    }
  }, [user?.id]);

  const loadSymptoms = async () => {
    try {
      setLoading(true);
      const { data } = await getSymptoms();
      if (data) {
        setSymptoms(data);
      }
    } catch (error) {
      console.error('Error loading symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSymptom) {
        await updateSymptom(editingSymptom.id, formData);
      } else {
        await addSymptom(formData);
      }

      setShowAddModal(false);
      setEditingSymptom(null);
      setFormData({
        symptom_date: new Date().toISOString().split('T')[0],
        symptom_name: 'Cramps',
        severity: 'Moderate',
        notes: ''
      });
      loadSymptoms();
    } catch (error) {
      console.error('Error saving symptom:', error);
      alert('Failed to save symptom. Please try again.');
    }
  };

  const handleEdit = (symptom) => {
    setEditingSymptom(symptom);
    setFormData({
      symptom_date: symptom.symptom_date,
      symptom_name: symptom.symptom_name,
      severity: symptom.severity,
      notes: symptom.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (symptomId) => {
    if (!window.confirm('Are you sure you want to delete this symptom?')) {
      return;
    }

    try {
      await deleteSymptom(symptomId);
      loadSymptoms();
    } catch (error) {
      console.error('Error deleting symptom:', error);
      alert('Failed to delete symptom. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Severe':
        return 'bg-red-100 text-red-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Mild':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A78BFA]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Activity className="text-[#A78BFA]" />
          Symptom Tracking
        </h1>
        <p className="text-gray-600 mt-2">Log and monitor your symptoms</p>
      </div>

      {/* Add Symptom Button */}
      <div className="mb-4">
        <button
          onClick={() => {
            setEditingSymptom(null);
            setFormData({
              symptom_date: new Date().toISOString().split('T')[0],
              symptom_name: 'Cramps',
              severity: 'Moderate',
              notes: ''
            });
            setShowAddModal(true);
          }}
          className="bg-[#A78BFA] hover:bg-[#8b6dfa] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add Symptom
        </button>
      </div>

      {/* Symptoms List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {symptoms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No symptoms logged yet. Start tracking!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Symptom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {symptoms.map((symptom) => (
                  <tr key={symptom.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(symptom.symptom_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {symptom.symptom_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                        {symptom.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {symptom.notes || '--'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(symptom)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(symptom.id)}
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
              {editingSymptom ? 'Edit Symptom' : 'Add Symptom'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.symptom_date}
                  onChange={(e) => setFormData({ ...formData, symptom_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptom *
                </label>
                <select
                  required
                  value={formData.symptom_name}
                  onChange={(e) => setFormData({ ...formData, symptom_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent outline-none"
                >
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <option key={symptom} value={symptom}>
                      {symptom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity *
                </label>
                <select
                  required
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent outline-none"
                >
                  {SEVERITY_OPTIONS.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent outline-none resize-none"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSymptom(null);
                    setFormData({
                      symptom_date: new Date().toISOString().split('T')[0],
                      symptom_name: 'Cramps',
                      severity: 'Moderate',
                      notes: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#A78BFA] hover:bg-[#8b6dfa] text-white rounded-lg transition-colors"
                >
                  {editingSymptom ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Symptoms;
