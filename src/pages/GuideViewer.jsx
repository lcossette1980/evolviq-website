import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import guidesAPI from '../services/guidesAPI';

const GuideViewer = () => {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [registry, setRegistry] = useState([]);

  useEffect(() => {
    (async () => {
      const reg = await guidesAPI.getRegistry();
      setRegistry(reg);
    })();
  }, []);

  const guide = useMemo(() => {
    return registry.find(g => g.guide_id === guideId || g.client_key === guideId);
  }, [registry, guideId]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-bone pt-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold mb-2">Loading guide…</h1>
            <button
              className="mt-4 px-4 py-2 bg-chestnut text-white rounded"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone pt-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-charcoal">{guide.title}</h1>
          <button
            className="px-4 py-2 bg-chestnut text-white rounded"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-charcoal/70 mb-4">Sections</p>
          <div className="space-y-3">
            {(guide.sections || []).map((s) => (
              <div key={s.id} className="p-4 border rounded-lg">
                <div className="font-medium text-charcoal">{s.title}</div>
                {s.anchors && s.anchors.length > 0 && (
                  <div className="mt-2 text-sm text-charcoal/70">
                    Anchors: {s.anchors.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideViewer;

