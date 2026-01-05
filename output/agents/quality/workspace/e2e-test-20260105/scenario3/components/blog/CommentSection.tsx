"use client";

import { useState } from "react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  date: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
}

export function CommentSection({ postId, comments = [] }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !name.trim()) return;

    setIsSubmitting(true);
    
    // In a real app, this would POST to an API
    const comment: Comment = {
      id: Date.now().toString(),
      author: { name },
      content: newComment,
      date: "Just now",
    };

    // Optimistic update
    setLocalComments([comment, ...localComments]);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-6 dark:text-white">
        Comments ({localComments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          required
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      {localComments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6">
          {localComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold flex-shrink-0">
        {comment.author.name[0].toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium dark:text-white">{comment.author.name}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{comment.date}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment.content}
        </p>
        <button className="text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline">
          Reply
        </button>
        
        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

