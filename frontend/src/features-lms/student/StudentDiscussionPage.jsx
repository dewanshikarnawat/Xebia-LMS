import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, ThumbsUp, Send, User, ChevronDown, ChevronUp, Reply, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function StudentDiscussionPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeReplyPostId, setActiveReplyPostId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});

  const fetchDiscussions = useCallback(async () => {
    try {
      const res = await api.get('/student/discussions');
      setDiscussions(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load discussion board.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/student/discussions', { message: newPost });
      setNewPost('');
      toast.success('Question posted to forum!');
      fetchDiscussions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to post message.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (id) => {
    try {
      await api.post(`/student/discussions/${id}/like`);
      setDiscussions(prev =>
        prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to like post.');
    }
  };

  const handleAddReply = async (postId) => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/student/discussions/${postId}/reply`, { message: replyText });
      setReplyText('');
      setActiveReplyPostId(null);
      toast.success('Reply submitted!');
      fetchDiscussions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit reply.');
    }
  };

  const toggleReplies = (id) => {
    setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const parseReplies = (json) => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  const filteredDiscussions = discussions.filter(p =>
    p.message.toLowerCase().includes(search.toLowerCase()) ||
    p.userName.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">
      {/* Ask Question Box */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm mb-6"
      >
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          Ask the Community
        </h3>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Ask a question or share learning materials with teachers and other students..."
            className="w-full h-24 rounded-2xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] p-4 text-sm text-slate-800 dark:text-white outline-none focus:border-[#7C3AED] resize-none"
            maxLength={2000}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newPost.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post Question
            </button>
          </div>
        </form>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4 shadow-sm mb-6">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search discussions or keywords..."
          className="w-full bg-transparent text-sm text-slate-800 dark:text-white outline-none"
        />
      </div>

      {/* Discussions Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <div className="text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <MessageSquare className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Posts Found</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            Be the first to start a conversation! Ask a question or share thoughts using the form above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((post) => {
            const repliesList = parseReplies(post.repliesJson);
            const isExpanded = !!expandedReplies[post.id];
            const isReplying = activeReplyPostId === post.id;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5 shadow-sm space-y-4"
              >
                {/* Header info */}
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300 font-black text-sm">
                      {getInitials(post.userName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{post.userName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${post.userRole === 'TEACHER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {post.userRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-700 dark:text-[#CBD5E1] whitespace-pre-line leading-relaxed pl-1">
                  {post.message}
                </p>

                {/* Actions Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  <button
                    type="button"
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes} Likes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyPostId(isReplying ? null : post.id);
                      if (!isReplying) setReplyText('');
                    }}
                    className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>

                  {repliesList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleReplies(post.id)}
                      className="ml-auto flex items-center gap-1 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span>{repliesList.length} Replies</span>
                    </button>
                  )}
                </div>

                {/* Reply Editor Form */}
                <AnimatePresence>
                  {isReplying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-1 space-y-3"
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a response..."
                        className="w-full h-16 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] p-3 text-xs text-slate-800 dark:text-white outline-none focus:border-[#7C3AED] resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveReplyPostId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddReply(post.id)}
                          disabled={!replyText.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Submit Reply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nested Replies list */}
                {repliesList.length > 0 && isExpanded && (
                  <div className="pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-3.5 mt-3">
                    {repliesList.map((rep) => (
                      <div key={rep.id} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-white">{rep.user}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-extrabold uppercase ${rep.role === 'TEACHER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {rep.role}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(rep.time).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 pl-0.5 leading-relaxed">
                          {rep.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
