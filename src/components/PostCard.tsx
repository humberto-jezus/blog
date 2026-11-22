import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface PostCardProps {
  post: BlogPost;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
  const { t } = useI18n();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
    >
      <Link to={`/post/${post.id}`} className="block overflow-hidden bg-gray-100 aspect-[2/1]">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="flex flex-col flex-grow p-6 sm:p-7">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0067b8] mb-2.5">
          {post.category}
        </span>

        <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-3 group-hover:text-[#0067b8] transition-colors line-clamp-2 leading-snug">
          <Link to={`/post/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="text-base font-medium text-[#4a4a4a] line-clamp-3 mb-6 flex-grow leading-relaxed">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.authorPhotoUrl ? (
              <img
                src={post.authorPhotoUrl}
                alt={post.author}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0067b8] font-bold text-sm shrink-0">
                {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <span className="text-sm font-bold text-[#242424] truncate">{post.author}</span>
          </div>

          <Link
            to={`/post/${post.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0067b8] hover:bg-[#005a9e] text-white px-4 py-2 text-sm font-bold transition-colors shrink-0 shadow-xs"
          >
            <span>{t('postCard.read')}</span>
            <ChevronRight className="h-4 w-4" strokeWidth={2.75} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
