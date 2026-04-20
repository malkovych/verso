import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Trash2, Edit3, X } from 'lucide-react';

interface Doc {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const mockDocs: Doc[] = [
  { id: '1', title: 'Product Features Overview', content: 'Our product offers...', createdAt: '2026-04-15' },
  { id: '2', title: 'Pricing Objection Responses', content: 'When a customer says...', createdAt: '2026-04-10' },
  { id: '3', title: 'Competitor Comparison', content: 'Compared to competitors...', createdAt: '2026-04-05' },
];

export default function KnowledgeBasePage() {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<Doc[]>(mockDocs);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

  const addDoc = () => {
    if (!newTitle.trim()) return;
    const doc: Doc = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDocs([doc, ...docs]);
    setNewTitle('');
    setNewContent('');
    setShowModal(false);
  };

  const deleteDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('knowledgeBase.title')}</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {t('knowledgeBase.addDocument')}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('knowledgeBase.search')}
          className="input-field pl-12"
        />
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('knowledgeBase.noDocuments')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="card flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{doc.content}</p>
                <p className="text-xs text-gray-400 mt-2">{doc.createdAt}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => deleteDoc(doc.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add document modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('knowledgeBase.addDocument')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="input-field mb-3"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content..."
              className="input-field h-40 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm py-2 px-4">
                {t('common.cancel')}
              </button>
              <button onClick={addDoc} className="btn-primary text-sm py-2 px-4">
                {t('knowledgeBase.upload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
