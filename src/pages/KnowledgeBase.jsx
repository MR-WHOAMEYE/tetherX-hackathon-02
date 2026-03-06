import { useState, useMemo } from 'react';
import {
    Search, BookOpen, Tag, Calendar, ChevronDown, ChevronUp,
    Plus, Edit3, Trash2, Filter, Database, FileText
} from 'lucide-react';
import { knowledgeBase as initialKB } from '../data/mockData';

const categoryColors = {
    Endocrinology: '#f59e0b',
    Cardiology: '#ef4444',
    Pulmonology: '#06b6d4',
    Psychiatry: '#8b5cf6',
    Nephrology: '#3b82f6',
    Emergency: '#dc2626',
    Administration: '#10b981',
    Pharmacy: '#ec4899',
};

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState(initialKB);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', category: 'Endocrinology', content: '', tags: '' });

    const categories = useMemo(() => {
        return [...new Set(articles.map(a => a.category))];
    }, [articles]);

    const filteredArticles = useMemo(() => {
        return articles.filter(a => {
            const matchesSearch = searchTerm === '' ||
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [articles, searchTerm, categoryFilter]);

    const handleAddArticle = () => {
        if (!newArticle.title.trim() || !newArticle.content.trim()) return;
        const id = `KB-CUSTOM-${Date.now()}`;
        setArticles(prev => [...prev, {
            id,
            category: newArticle.category,
            title: newArticle.title,
            content: newArticle.content,
            lastUpdated: new Date().toISOString().slice(0, 10),
            tags: newArticle.tags.split(',').map(t => t.trim()).filter(Boolean),
        }]);
        setNewArticle({ title: '', category: 'Endocrinology', content: '', tags: '' });
        setShowAddForm(false);
    };

    const handleDeleteArticle = (id) => {
        setArticles(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Knowledge Base</h1>
                    <p className="page-subtitle">
                        Clinical protocols, guidelines, and reference documents used by the AI engine
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus size={16} /> Add Article
                </button>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                <div className="card-flat" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{articles.length}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Total Articles</div>
                </div>
                <div className="card-flat" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{categories.length}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Categories</div>
                </div>
                <div className="card-flat" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{articles.reduce((sum, a) => sum + a.tags.length, 0)}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Total Tags</div>
                </div>
                <div className="card-flat" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>94.7%</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Retrieval Accuracy</div>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="card animate-fade-in" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99,102,241,0.3)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                        <Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />
                        Add New Knowledge Article
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Title</label>
                            <input
                                className="input"
                                placeholder="Article title..."
                                value={newArticle.title}
                                onChange={e => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Category</label>
                            <select
                                className="input"
                                value={newArticle.category}
                                onChange={e => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Content</label>
                        <textarea
                            className="input"
                            placeholder="Clinical content, protocols, guidelines..."
                            rows={4}
                            value={newArticle.content}
                            onChange={e => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Tags (comma-separated)</label>
                        <input
                            className="input"
                            placeholder="e.g. diabetes, insulin, treatment"
                            value={newArticle.tags}
                            onChange={e => setNewArticle(prev => ({ ...prev, tags: e.target.value }))}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddArticle} disabled={!newArticle.title.trim()}>
                            <Plus size={16} /> Save Article
                        </button>
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 1rem',
                }}>
                    <Search size={16} color="var(--color-text-tertiary)" />
                    <input
                        id="kb-search"
                        type="text"
                        placeholder="Search articles, tags, content..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--color-text-primary)',
                            fontSize: '0.8125rem',
                            width: '100%',
                            fontFamily: 'var(--font-sans)',
                        }}
                    />
                </div>
                <select
                    className="input"
                    style={{ width: '200px' }}
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {categories.map(cat => {
                    const count = articles.filter(a => a.category === cat).length;
                    const color = categoryColors[cat] || '#6366f1';
                    return (
                        <button
                            key={cat}
                            className="btn btn-sm"
                            onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                            style={{
                                background: categoryFilter === cat ? `${color}20` : 'var(--color-bg-tertiary)',
                                border: `1px solid ${categoryFilter === cat ? `${color}40` : 'var(--color-border)'}`,
                                color: categoryFilter === cat ? color : 'var(--color-text-secondary)',
                                fontSize: '0.75rem',
                            }}
                        >
                            <span style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: color,
                                display: 'inline-block',
                            }} />
                            {cat} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Articles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredArticles.map(article => {
                    const color = categoryColors[article.category] || '#6366f1';
                    const isExpanded = expandedId === article.id;

                    return (
                        <div
                            key={article.id}
                            className="card-flat"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                borderLeft: `3px solid ${color}`,
                            }}
                        >
                            <div
                                style={{
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setExpandedId(isExpanded ? null : article.id)}
                            >
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 'var(--radius-sm)',
                                    background: `${color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <FileText size={18} color={color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{article.title}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                        <span style={{ fontSize: '0.6875rem', color: color, fontWeight: 500 }}>{article.category}</span>
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>·</span>
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{article.id}</span>
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>·</span>
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Updated {article.lastUpdated}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                    {article.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{tag}</span>
                                    ))}
                                </div>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {isExpanded && (
                                <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem' }}>
                                    <div style={{
                                        padding: '1rem',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-secondary)',
                                        lineHeight: 1.7,
                                        marginBottom: '0.75rem',
                                    }}>
                                        {article.content}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                            {article.tags.map(tag => (
                                                <span key={tag} style={{
                                                    padding: '0.125rem 0.5rem',
                                                    background: `${color}10`,
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.6875rem',
                                                    color: color,
                                                }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }}
                                            style={{ color: 'var(--color-danger)' }}
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredArticles.length === 0 && (
                    <div className="empty-state" style={{ padding: '3rem' }}>
                        <BookOpen size={48} />
                        <p style={{ marginTop: '1rem', fontSize: '0.9375rem' }}>No articles found</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Try a different search or category filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}
