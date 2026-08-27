import { useState, useEffect } from 'react';
import { getSessions } from '../../services/sessionService';
import { usePagination } from '../../hooks/usePagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatDate';
import { toast } from 'react-toastify';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, limit, totalPages, setPage, setTotalPages } = usePagination(1, 10);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (status) params.status = status;
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
    fetchSessions();
  }, [page, limit, status]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Sessions (Admin View)</h1>
        <select value={status} onChange={e => {setStatus(e.target.value); setPage(1);}} className="border border-gray-300 rounded-md p-2">
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="large" className="py-20" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map(session => (
                <tr key={session._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.mentor?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.learner?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.skill?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(session.scheduledAt)} ({session.duration || session.durationMinutes || 60}m)</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
