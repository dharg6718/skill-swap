import { useState, useEffect } from 'react';
import { getSessions, updateSession } from '../services/sessionService';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SessionModal from '../components/modals/SessionModal';
import ReviewModal from '../components/modals/ReviewModal';
import { Calendar, Video, Clock, CheckCircle, MoreVertical, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDateTime } from '../utils/formatDate';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { page, limit, totalPages, setPage, setTotalPages } = usePagination(1, 10);

  // Modals state
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [sessionToReview, setSessionToReview] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filter !== 'all') params.status = filter;
      const res = await getSessions(params);
      if (res.success) {
        setSessions(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, limit, filter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await updateSession(id, { status });
      if (res.success) {
        toast.success(`Session marked as ${status}`);
        fetchSessions();
        if (sessionToCancel) setSessionToCancel(null);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600 mb-2">Your learning calendar</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Learning Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">Keep every exchange organized, from first lesson to follow-up.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="input-field w-full sm:w-auto min-w-[170px] py-2.5"
        >
          <option value="all">All Sessions</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="large" className="py-20" />
      ) : sessions.length > 0 ? (
        <div className="grid gap-4">
          {sessions.map(session => {
            const isMentor = session.mentor._id === user._id;
            const partner = isMentor ? session.learner : session.mentor;
            const role = isMentor ? 'Teaching' : 'Learning';
            const isPast = new Date(session.scheduledAt) < new Date();

            return (
              <div key={session._id} className="card p-5 sm:p-6 flex flex-col md:flex-row gap-6 hover:border-indigo-200 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{session.skill?.name || 'Unknown Skill'}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {role}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2 mt-4">
                    <p className="flex items-center gap-2"><Clock size={16} className="text-teal-600" /> 
                      {formatDateTime(session.scheduledAt)} ({session.durationMinutes} mins)
                    </p>
                    <p className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      With {partner.name}
                    </p>
                    {session.meetingLink && (
                      <p className="flex items-center gap-2">
                        <Video size={16} className="text-teal-600" /> 
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Join Meeting</a>
                      </p>
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-100">
                      <strong>Notes:</strong> {session.notes}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end md:justify-start gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                  {session.status === 'scheduled' && (
                    <>
                      {session.meetingLink && <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full py-2"><Video size={15} /> Join</a>}
                      <button onClick={() => { setSessionToEdit(session); setIsEditModalOpen(true); }} className="btn-secondary w-full py-2">
                        Edit
                      </button>
                      <button onClick={() => handleStatusUpdate(session._id, 'completed')} className="btn-success w-full py-2">
                        Mark Done
                      </button>
                      <button onClick={() => setSessionToCancel(session)} className="w-full px-4 py-2 bg-white border border-rose-200 text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-50 transition-colors">
                        Cancel
                      </button>
                    </>
                  )}
                  {session.status === 'completed' && (
                    <button onClick={() => setSessionToReview(session)} className="btn-primary w-full py-2">
                      <CheckCircle size={16} /> Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No sessions found"
          description="You don't have any sessions matching the selected filter."
        />
      )}

      {sessionToEdit && (
        <SessionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={sessionToEdit}
          onSuccess={fetchSessions}
        />
      )}

      {sessionToReview && (
        <ReviewModal
          isOpen={!!sessionToReview}
          onClose={() => setSessionToReview(null)}
          session={sessionToReview}
          onSuccess={fetchSessions}
        />
      )}

      <ConfirmDialog
        isOpen={!!sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onConfirm={() => handleStatusUpdate(sessionToCancel._id, 'cancelled')}
        title="Cancel Session"
        message="Are you sure you want to cancel this session? This action cannot be undone."
        confirmText="Cancel Session"
      />
    </div>
  );
};

export default Sessions;
