import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createSession, updateSession } from '../../services/sessionService';

const SessionModal = ({ isOpen, onClose, request, initialData, onSuccess }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [skillId, setSkillId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const d = new Date(initialData.scheduledAt);
        setDate(d.toISOString().split('T')[0]);
        setTime(d.toTimeString().slice(0, 5));
        setDuration((initialData.duration || initialData.durationMinutes || 60).toString());
        setMeetingLink(initialData.meetingLink || '');
        setNotes(initialData.notes || '');
        setSkillId(initialData.skill._id);
      } else if (request) {
        setDate('');
        setTime('');
        setDuration('60');
        setMeetingLink('');
        setNotes('');
        setSkillId(request.requestedSkill._id);
      }
    }
  }, [isOpen, request, initialData]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error('Date and time are required');
      return;
    }
    
    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const payload = {
        skill: isEdit ? initialData.skill._id : skillId,
        scheduledAt,
        duration: parseInt(duration),
        meetingLink: meetingLink.trim(),
        notes: notes.trim()
      };

      if (!isEdit && request) {
        payload.request = request._id;
      }

      let res;
      if (isEdit) {
        res = await updateSession(initialData._id, payload);
      } else {
        res = await createSession(payload);
      }

      if (res.success) {
        toast.success(`Session ${isEdit ? 'updated' : 'scheduled'} successfully`);
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full z-10 animate-fadeIn">
          <div className="bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {isEdit ? 'Edit Session' : 'Schedule Session'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEdit && request && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Focus Skill</label>
                  <select
                    value={skillId}
                    onChange={(e) => setSkillId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value={request.requestedSkill._id}>{request.requestedSkill.name}</option>
                    <option value={request.offeredSkill._id}>{request.offeredSkill.name}</option>
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (e.g. Zoom, Meet)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Agenda</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md p-2"
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
