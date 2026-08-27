import { useState, useEffect } from 'react';
import { getRequests } from '../../services/requestService';
import { usePagination } from '../../hooks/usePagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'react-toastify';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, limit, totalPages, setPage, setTotalPages } = usePagination(1, 10);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (status) params.status = status;
        const res = await getRequests(params);
        if (res.success) {
          setRequests(res.data);
          setTotalPages(res.pagination.totalPages);
        }
      } catch (err) {
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [page, limit, status]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Requests (Admin View)</h1>
        <select value={status} onChange={e => {setStatus(e.target.value); setPage(1);}} className="border border-gray-300 rounded-md p-2">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offered Skill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Skill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(req => (
                <tr key={req._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.sender?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.receiver?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.offeredSkill?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.requestedSkill?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(req.createdAt)}</td>
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

export default AdminRequests;
