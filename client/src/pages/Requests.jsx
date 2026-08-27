import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRequests, updateRequest } from '../services/requestService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SessionModal from '../components/modals/SessionModal';
import SkillBadge from '../components/common/SkillBadge';
import StarRating from '../components/common/StarRating';
import {
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Calendar,
  Eye,
  MessageSquare,
  ArrowRight,
  User,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, timeAgo } from '../utils/formatDate';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'incoming' or 'outgoing'
  const [activeTab, setActiveTab] = useState('incoming');
  // Status filter: 'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedRequestForSession, setSelectedRequestForSession] = useState(null);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);

  const fetchRequestsData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        type: activeTab,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const res = await getRequests(params);
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching requests', err);
      toast.error('Unable to load swap requests');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    fetchRequestsData();
  }, [fetchRequestsData]);

  const handleAccept = async (requestId) => {
    try {
      const res = await updateRequest(requestId, { status: 'accepted' });
      if (res.success) {
        toast.success('Request accepted successfully! You can now schedule a learning session.');
        fetchRequestsData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await updateRequest(requestId, { status: 'rejected' });
      if (res.success) {
        toast.info('Request rejected');
        fetchRequestsData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const res = await updateRequest(requestId, { status: 'cancelled' });
      if (res.success) {
        toast.info('Request cancelled');
        fetchRequestsData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const openScheduleSession = (req) => {
    setSelectedRequestForSession(req);
    setSessionModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            <Ban className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Send className="w-8 h-8 text-indigo-600" /> Skill Swap Requests
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          Manage all your incoming proposals and outgoing swap requests with other community members.
        </p>
      </div>

      {/* Main Tabs and Status Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Incoming / Outgoing Tabs */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('incoming');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'incoming'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-4 h-4" /> Incoming Requests
          </button>
          <button
            onClick={() => {
              setActiveTab('outgoing');
              setStatusFilter('all');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'outgoing'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4" /> Outgoing Requests
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const isIncoming = req.receiver?._id === user._id;
            const peer = isIncoming ? req.sender : req.receiver;

            return (
              <div
                key={req._id}
                className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: User & Skills Information */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base uppercase shrink-0">
                    {peer?.name?.charAt(0) || 'U'}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{peer?.name || 'User'}</h3>
                      <span className="text-xs text-gray-400">• {timeAgo(req.createdAt)}</span>
                      {getStatusBadge(req.status)}
                    </div>

                    {/* Offered / Requested Skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-500 font-medium block text-[11px] mb-1">
                          {isIncoming ? 'They will teach:' : 'You will teach:'}
                        </span>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <SkillBadge skill={req.offeredSkill} size="sm" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-500 font-medium block text-[11px] mb-1">
                          {isIncoming ? 'They want to learn:' : 'You want to learn:'}
                        </span>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <SkillBadge skill={req.requestedSkill} size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Message Preview */}
                    {req.message && (
                      <p className="text-xs text-gray-600 italic bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-50/70">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-end justify-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-5">
                  {/* Pending Incoming Actions */}
                  {req.status === 'pending' && isIncoming && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="flex-1 md:flex-initial px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  {/* Pending Outgoing Actions */}
                  {req.status === 'pending' && !isIncoming && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel Request
                    </button>
                  )}

                  {/* Accepted Request Action -> Schedule Session */}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => openScheduleSession(req)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Session
                    </button>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedRequestDetail(req)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-indigo-600 font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={activeTab === 'incoming' ? Inbox : Send}
          title={`No ${statusFilter !== 'all' ? statusFilter : ''} ${activeTab} requests`}
          description={
            activeTab === 'incoming'
              ? 'You have not received any requests matching your criteria.'
              : 'You have not sent any requests matching your criteria. Explore peers to find matches!'
          }
          actionText={activeTab === 'outgoing' ? 'Explore Skill Matches' : undefined}
          actionLink={activeTab === 'outgoing' ? '/explore' : undefined}
        />
      )}

      {/* Request Detail Modal */}
      {selectedRequestDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Request Details</h3>
              <button
                onClick={() => setSelectedRequestDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Status:</span>
                <div>{getStatusBadge(selectedRequestDetail.status)}</div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Sender:</span>
                <span className="font-bold text-gray-900">{selectedRequestDetail.sender?.name}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Receiver:</span>
                <span className="font-bold text-gray-900">{selectedRequestDetail.receiver?.name}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Offered Skill:</span>
                <span className="font-bold text-indigo-700">{selectedRequestDetail.offeredSkill?.name}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Requested Skill:</span>
                <span className="font-bold text-indigo-700">{selectedRequestDetail.requestedSkill?.name}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Created:</span>
                <span className="text-gray-700">{formatDate(selectedRequestDetail.createdAt)}</span>
              </div>

              {selectedRequestDetail.message && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-medium block mb-1">Message:</span>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 italic text-gray-700">
                    "{selectedRequestDetail.message}"
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedRequestDetail(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {selectedRequestForSession && (
        <SessionModal
          isOpen={sessionModalOpen}
          onClose={() => {
            setSessionModalOpen(false);
            setSelectedRequestForSession(null);
          }}
          request={selectedRequestForSession}
          onSuccess={() => {
            fetchRequestsData();
          }}
        />
      )}
    </div>
  );
};

export default Requests;
