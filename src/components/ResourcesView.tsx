import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { CURATED_RESOURCES } from '../data/seedData';
import { ResourceItem } from '../types/study';

type CategoryFilter = 'All' | ResourceItem['category'];

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Math',
  'Science',
  'Languages',
  'CS & Tech',
  'Exam Prep',
  'Productivity',
];

export const ResourcesView: React.FC = () => {
  const [category, setCategory] = useState<CategoryFilter>('All');

  const items =
    category === 'All'
      ? CURATED_RESOURCES
      : CURATED_RESOURCES.filter((r) => r.category === category);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#6A55DC] mb-1">Curated Library</p>
        <h1 className="text-3xl font-extrabold text-[#211E36]">Learning Resources</h1>
        <p className="text-sm text-[#6E6B80] mt-1">
          Trusted, free study tools and reference platforms across school and exam subjects.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E6E4F0] rounded-xl w-fit max-w-full">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              category === cat
                ? 'bg-[#6A55DC] text-white'
                : 'text-[#6E6B80] hover:text-[#211E36] hover:bg-[#F4F3F8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((res) => (
          <div
            key={res.id}
            className="bg-white border border-[#EAE8F2] rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <p className="text-xs text-[#77758A]">
                {res.category} · {res.source}
              </p>
              <h2 className="text-base font-bold text-[#211E36] mt-1">{res.title}</h2>
              <p className="text-sm text-[#5E5A75] mt-2 leading-relaxed">{res.desc}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F0EEF5]">
              <span className="text-xs text-[#77758A] truncate">
                {res.tags.join(' · ')}
              </span>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6A55DC] hover:underline whitespace-nowrap shrink-0"
              >
                Open
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
