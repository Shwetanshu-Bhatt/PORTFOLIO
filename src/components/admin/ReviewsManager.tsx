import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import projectData from '@/data/projects.json';

type Review = {
  id: string; client_name: string; client_email: string; company?: string;
  reviewer_name?: string; public_email?: string; public_phone?: string; image_url?: string;
  project_title: string; rating?: number; review_text?: string; status: string;
};

const statusLabel: Record<string, string> = { invited: 'Link sent', pending: 'Needs approval', published: 'Published', hidden: 'Hidden' };

export default function ReviewsManager() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ clientName: '', clientEmail: '', company: '', projectId: '', projectTitle: '' });

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/reviews');
    if (res.status === 401) return router.push('/admin/login');
    const data = await res.json();
    setReviews(data.reviews || []);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const createInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || 'Could not create invitation');
    setInviteUrl(`${window.location.origin}${data.inviteUrl}`);
    setMessage('Private invitation created. Copy the link and send it only to this client.');
    setForm({ clientName: '', clientEmail: '', company: '', projectId: '', projectTitle: '' });
    void load();
  };

  const changeStatus = async (id: string, status: 'published' | 'hidden') => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!res.ok) return setMessage('Could not update this review.');
    setMessage(status === 'published' ? 'Review published on your portfolio.' : 'Review hidden from your portfolio.');
    void load();
  };

  const deleteReview = async (review: Review) => {
    const name = review.reviewer_name || review.client_name;
    if (!window.confirm(`Permanently delete ${name}'s review invitation and submission? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' });
    if (!res.ok) return setMessage('Could not delete this review.');
    setMessage('Review and its invitation link permanently deleted.');
    void load();
  };

  return <div className="admin-reviews">
    <section className="admin-review-invite">
      <div className="admin-section-heading"><div><span>Create invitation</span><h2>Invite a verified client</h2><p>Create a one-time link tied to a completed project.</p></div></div>
      <form onSubmit={createInvite} className="admin-review-form">
        <label className="admin-field"><span>Client name</span><input className="input-field" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Full name" required /></label>
        <label className="admin-field"><span>Private client email</span><input className="input-field" type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="client@company.com" required /><small>Used for verification and never shown automatically.</small></label>
        <label className="admin-field"><span>Company</span><input className="input-field" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Optional" /></label>
        <label className="admin-field"><span>Completed project</span><select className="input-field" value={form.projectId} onChange={e => { const project = projectData.projects.find(item => item.id === e.target.value); setForm({ ...form, projectId: e.target.value, projectTitle: project?.title || '' }); }} required><option value="">Select a project</option>{projectData.projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
        <button className="admin-primary-button admin-review-generate" type="submit">Generate private review link <span>→</span></button>
      </form>
      {message && <div className="admin-message admin-review-message"><span>✓</span>{message}</div>}
      {inviteUrl && <div className="admin-invite-result"><div><span>One-time link</span><input readOnly value={inviteUrl} /></div><button type="button" onClick={() => navigator.clipboard.writeText(inviteUrl)}>Copy link</button></div>}
    </section>

    <section className="admin-review-list">
      <div className="admin-section-heading"><div><span>Review queue</span><h2>Invitations and submissions</h2><p>{reviews.length} total · {reviews.filter(review => review.status === 'pending').length} waiting for approval</p></div></div>
      {reviews.length === 0 ? <div className="admin-empty-state"><span>☆</span><h3>No invitations yet</h3><p>Create your first private client review link above.</p></div> : reviews.map(review => <article className="admin-review-card" key={review.id}>
        <header><div><span className={`admin-status is-${review.status}`}>{statusLabel[review.status] || review.status}</span><h3>{review.reviewer_name || review.client_name}</h3><p>{review.project_title}{review.company ? ` · ${review.company}` : ''}</p></div>{review.rating && <span className="admin-review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}</span>}</header>
        <div className="admin-review-details"><div><span>Invitation email</span><strong>{review.client_email}</strong></div><div><span>Public contact</span><strong>{[review.public_email, review.public_phone].filter(Boolean).join(' · ') || 'Not submitted yet'}</strong></div></div>
        {review.image_url && <Image className="admin-review-image" src={review.image_url} alt="Client-provided review attachment" width={640} height={360} unoptimized />}
        {review.review_text && <blockquote>“{review.review_text}”</blockquote>}
        <footer>{review.status !== 'published' && review.status !== 'invited' && <button className="admin-primary-button" onClick={() => changeStatus(review.id, 'published')}>Publish review</button>}{['pending', 'published'].includes(review.status) && <button className="admin-secondary-button" onClick={() => changeStatus(review.id, 'hidden')}>Hide</button>}<button className="admin-delete-button" onClick={() => deleteReview(review)}>Delete permanently</button></footer>
      </article>)}
    </section>
  </div>;
}
