import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Downloads text as a markdown file.
 */
export function downloadMarkdown(filename, text) {
  const element = document.createElement('a');
  const file = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Highlights citation codes like [REL-001] or [QA-001] in text.
 */
export function parseCitations(text) {
  if (!text) return [];
  const regex = /\[(REL-\d+|QA-\d+|QA-SUMMARY)\]/g;
  const citations = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    citations.push(match[1]);
  }
  return [...new Set(citations)];
}
