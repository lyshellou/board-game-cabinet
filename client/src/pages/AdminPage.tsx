import { useState, useEffect, FormEvent, useRef } from 'react';
import { BoardGame, BoardGameInput } from '../types';
import {
  getToken,
  clearToken,
  adminLogin,
  adminFetchGames,
  adminCreateGame,
  adminUpdateGame,
  adminDeleteGame,
  adminUploadImage,
} from '../lib/api';
import { Plus, Edit, Trash2, LogOut, Upload, X, Save, Image } from 'lucide-react';

const emptyForm: BoardGameInput = {
  name: '',
  name_en: '',
  image: '',
  description: '',
  player_count_min: 2,
  player_count_max: 4,
  duration_per_player: 30,
  difficulty: 2.5,
  rating: 7.0,
  review: '',
  category: '',
  published_year: new Date().getFullYear(),
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(getToken());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<BoardGame | null>(null);
  const [form, setForm] = useState<BoardGameInput>({ ...emptyForm });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminLogin(password);
      setToken(res.token);
      setPassword('');
    } catch {
      setLoginError('密码错误');
    }
  };

  // Load games
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminFetchGames()
      .then(setGames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Open modal for create/edit
  const openCreate = () => {
    setEditingGame(null);
    setForm({ ...emptyForm, published_year: new Date().getFullYear() });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (game: BoardGame) => {
    setEditingGame(game);
    setForm({
      name: game.name,
      name_en: game.name_en,
      image: game.image,
      description: game.description,
      player_count_min: game.player_count_min,
      player_count_max: game.player_count_max,
      duration_per_player: game.duration_per_player,
      difficulty: game.difficulty,
      rating: game.rating,
      review: game.review,
      category: game.category,
      published_year: game.published_year,
    });
    setError('');
    setModalOpen(true);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch {
      setError('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // Save
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('请输入游戏名称');
      return;
    }
    setSaving(true);
    setError('');

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    try {
      if (editingGame) {
        const updated = await adminUpdateGame(editingGame.id, formData);
        setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await adminCreateGame(formData);
        setGames((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (game: BoardGame) => {
    if (!confirm(`确定要删除「${game.name}」吗？此操作不可撤销。`)) return;
    try {
      await adminDeleteGame(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
    } catch {
      setError('删除失败');
    }
  };

  // Logout
  const handleLogout = () => {
    clearToken();
    setToken(null);
    setGames([]);
  };

  // ===== LOGIN VIEW =====
  if (!token) {
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-3xl text-white text-center mb-8">管理后台</h1>
          <form onSubmit={handleLogin} className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg p-6 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider block mb-2">管理员密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-white placeholder-muted outline-none focus:border-accent/50 transition-colors"
                placeholder="输入密码"
                autoFocus
              />
            </div>
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-accent text-bg font-medium py-3 rounded-lg hover:bg-accent/90 transition-colors text-sm"
            >
              登录
            </button>
          </form>
          <p className="text-muted/50 text-xs text-center mt-4">返回到 <a href="/" className="text-accent hover:underline">首页</a></p>
        </div>
      </div>
    );
  }

  // ===== ADMIN VIEW =====
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-page mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-accent tracking-[0.2em] uppercase mb-1">Admin</p>
            <h1 className="font-heading text-3xl text-white">桌游管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-accent text-bg font-medium px-4 py-2.5 rounded-lg hover:bg-accent/90 transition-colors text-sm"
            >
              <Plus size={16} /> 新增桌游
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-muted hover:text-white text-sm transition-colors"
            >
              <LogOut size={16} /> 退出
            </button>
          </div>
        </div>

        {/* Games table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-surface/50 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">名称</th>
                  <th className="text-left py-3 px-4 hidden sm:table-cell">分类</th>
                  <th className="text-center py-3 px-4 hidden md:table-cell">人数</th>
                  <th className="text-center py-3 px-4 hidden md:table-cell">难度</th>
                  <th className="text-center py-3 px-4 hidden md:table-cell">评分</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-white">{game.name}</span>
                      {game.name_en && <span className="text-muted text-xs ml-2">{game.name_en}</span>}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {game.category && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                          {game.category}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-muted hidden md:table-cell">
                      {game.player_count_min === game.player_count_max
                        ? game.player_count_min
                        : `${game.player_count_min}-${game.player_count_max}`}
                    </td>
                    <td className="py-3 px-4 text-center text-muted font-mono hidden md:table-cell">
                      {game.difficulty}
                    </td>
                    <td className="py-3 px-4 text-center text-accent font-mono hidden md:table-cell">
                      {game.rating.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(game)}
                          className="p-2 text-muted hover:text-white transition-colors"
                          title="编辑"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(game)}
                          className="p-2 text-muted hover:text-red-400 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {games.length === 0 && (
              <div className="text-center py-12 text-muted text-sm">
                暂无桌游数据，点击「新增桌游」开始添加
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative bg-surface border border-border rounded-lg w-full max-w-2xl p-6 mb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl text-white">
                {editingGame ? '编辑桌游' : '新增桌游'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">中文名称 *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">英文名称</label>
                  <input
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">最少人数</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.player_count_min}
                    onChange={(e) => setForm({ ...form, player_count_min: Number(e.target.value) })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">最多人数</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.player_count_max}
                    onChange={(e) => setForm({ ...form, player_count_max: Number(e.target.value) })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">人均时长（分钟）</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration_per_player}
                    onChange={(e) => setForm({ ...form, duration_per_player: Number(e.target.value) })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">难度 (0-5)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.5}
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">评分 (0-10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">出版年份</label>
                  <input
                    type="number"
                    min={1900}
                    max={2030}
                    value={form.published_year}
                    onChange={(e) => setForm({ ...form, published_year: Number(e.target.value) })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">分类</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="如：策略、聚会、合作"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50"
                />
              </div>

              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">玩法介绍</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50 resize-y"
                />
              </div>

              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">个人评价</label>
                <textarea
                  rows={3}
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent/50 resize-y"
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">图片</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-muted hover:text-white hover:border-accent/50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>上传中...</>
                    ) : (
                      <>
                        <Upload size={14} /> 上传图片
                      </>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {form.image && (
                    <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2 border border-border">
                      <Image size={14} className="text-accent" />
                      <span className="text-xs text-muted truncate max-w-[200px]">{form.image}</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: '' })}
                        className="text-muted hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm text-muted hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-accent text-bg font-medium px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors text-sm disabled:opacity-50"
                >
                  <Save size={14} /> {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
