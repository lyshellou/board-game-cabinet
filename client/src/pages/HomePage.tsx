import { Link } from 'react-router-dom';
import { useFeatured } from '../hooks/useGames';
import GameCard from '../components/game/GameCard';
import { ChevronRight } from 'lucide-react';

const categories = [
  { name: '策略', desc: '深度思考与资源规划', count: '...' },
  { name: '聚会', desc: '社交互动与欢乐', count: '...' },
  { name: '合作', desc: '并肩作战的乐趣', count: '...' },
  { name: '抽象', desc: '极简规则，无限深度', count: '...' },
  { name: '角色扮演', desc: '沉浸叙事冒险', count: '...' },
];

export default function HomePage() {
  const { games: featured, loading } = useFeatured();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 min-h-[70vh] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] border border-white/20 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] border border-white/10 rounded-full" />
        </div>

        <div className="max-w-page mx-auto w-full">
          <div className="max-w-2xl">
            <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-8 ml-4">
              Board Game Collection Showcase
            </p>
            <h1 className="font-heading text-7xl sm:text-8xl lg:text-9xl leading-[1.0] text-white mb-10">
              <div className="leading-tight">每张桌子</div>
              <div className="mt-4 text-accent">都是一个世界</div>
            </h1>
            <p className="text-muted text-lg leading-relaxed max-w-lg mb-8">
              精选桌游收藏，记录每一款游戏的独特魅力——从策略深度到聚会欢笑，从两人对弈到众乐时光。
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 bg-accent text-bg font-medium px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors text-sm"
              >
                浏览全部桌游 <ChevronRight size={16} />
              </Link>
              <Link
                to="/gallery"
                className="text-sm text-muted hover:text-white transition-colors"
              >
                按分类探索 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="px-6 py-16">
        <div className="max-w-page mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-2">Editor's Pick</p>
              <h2 className="font-heading text-3xl text-white">精选推荐</h2>
            </div>
            <Link
              to="/gallery?sort=rating"
              className="hidden sm:flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
            >
              查看全部 <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface rounded-lg aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-page mx-auto px-6">
        <hr className="section-divider" />
      </div>

      {/* Categories */}
      <section className="px-6 py-16">
        <div className="max-w-page mx-auto">
          <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-2">按分类探索</p>
          <h2 className="font-heading text-3xl text-white mb-8">找到你的类型</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/gallery?category=${cat.name}`}
                className="group bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-5 hover:border-accent/40 hover:scale-[1.02] transition-all duration-500"
              >
                <h3 className="font-heading text-lg text-white group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
