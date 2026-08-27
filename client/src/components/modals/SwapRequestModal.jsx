import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { createRequest } from '../../services/requestService';
import { getSkills } from '../../services/skillService';
import { Repeat2, Send, X, AlertCircle } from 'lucide-react';

const SwapRequestModal = ({ isOpen, onClose, receiver, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const [allSkills, setAllSkills] = useState([]);
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [requestedSkillId, setRequestedSkillId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOfferedSkillId('');
      setRequestedSkillId('');
      setMessage('');
      
      // Fetch platform skills to resolve skill names if needed
      const fetchSkills = async () => {
        try {
          const res = await getSkills({ limit: 150 });
          if (res.success) setAllSkills(res.data || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSkills();
    }
  }, [isOpen]);

  if (!isOpen || !receiver) return null;

  // Resolve skill objects from IDs or populated objects
  const resolveSkillList = (skillsSource) => {
    if (!skillsSource || skillsSource.length === 0) return [];
    return skillsSource.map(s => {
      if (typeof s === 'object' && s !== null && s.name) {
        return { _id: String(s._id), name: s.name, category: s.category };
      }
      const strId = String(typeof s === 'object' ? s?._id : s);
      const matched = allSkills.find(sk => String(sk._id) === strId);
      return matched ? { _id: strId, name: matched.name, category: matched.category } : { _id: strId, name: 'Skill' };
    });
  };

  const userCanTeach = resolveSkillList(currentUser?.skillsKnown);
  const myOfferedOptions = userCanTeach.length > 0 ? userCanTeach : allSkills;

  const receiverTeaches = resolveSkillList(receiver?.skillsKnown);
  const requestedOptions = receiverTeaches.length > 0 ? receiverTeaches : allSkills;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredSkillId || !requestedSkillId) {
      toast.error('Please select both the skill you offer and the skill you want to learn');
      return;
    }
    if (offeredSkillId === requestedSkillId) {
      toast.warning('Tip: You selected the same skill to teach and learn.');
    }
    
    setLoading(true);
    try {
      const payload = {
        receiver: receiver._id,
        receiverId: receiver._id,
        offeredSkill: offeredSkillId,
        offeredSkillId: offeredSkillId,
        requestedSkill: requestedSkillId,
        requestedSkillId: requestedSkillId,
        message: message.trim()
      };

      const res = await createRequest(payload);
      if (res.success) {
        toast.success(`Swap request sent to ${receiver.name}!`);
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to send request');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="inline-block bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full z-10 animate-scaleIn border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Repeat2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Propose a Skill Swap</h3>
                  <p className="text-xs text-gray-500">Exchanging with <span className="font-semibold text-gray-800">{receiver.name}</span></p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Offered Skill */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Skill I Can Teach
                </label>
                <select
                  value={offeredSkillId}
                  onChange={(e) => setOfferedSkillId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select a skill you offer --</option>
                  {myOfferedOptions.map(s => (
                    <option key={s._id} value={s._id}>{s.name} {s.category ? `(${s.category})` : ''}</option>
                  ))}
                </select>
                {userCanTeach.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> You haven't added skills to your profile yet, but you can select any skill above.
                  </p>
                )}
              </div>
              
              {/* Requested Skill */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Skill I Want to Learn from {receiver.name}
                </label>
                <select
                  value={requestedSkillId}
                  onChange={(e) => setRequestedSkillId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select a skill to learn --</option>
                  {requestedOptions.map(s => (
                    <option key={s._id} value={s._id}>{s.name} {s.category ? `(${s.category})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Introduce yourself, your availability, and what you'd like to achieve together..."
                ></textarea>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send size={15} />
                  {loading ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal;
