import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type Invite = { client_name: string; client_email: string; company?: string; project_title: string; status: string };

export default function ReviewPage() {
  const router = useRouter();
  const token = router.query.token as string | undefined;
  const [invite, setInvite] = useState<Invite | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [publicPhone, setPublicPhone] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [imageData, setImageData] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (token) fetch(`/api/reviews/${token}`).then(async res => ({ ok: res.ok, data: await res.json() })).then(({ ok, data }) => { if (!ok) return setMessage(data.error); setInvite(data.invite); setReviewerName(data.invite.client_name); setPublicEmail(data.invite.client_email); }); }, [token]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    const res = await fetch(`/api/reviews/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, reviewText, reviewerName, publicEmail, publicPhone, contactConsent, imageData }) });
    const data = await res.json();
    setMessage(res.ok ? 'Thank you — your review was submitted for publication.' : data.error);
    if (res.ok) setInvite(null);
    setSubmitting(false);
  };

  const selectImage = (file?: File) => {
    if (!file) return setImageData('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setMessage('Choose a JPG, PNG, or WebP image smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setImageData(String(reader.result)); setMessage(''); };
    reader.readAsDataURL(file);
  };

  return <><Head><title>Review completed work — Shwetanshu Bhatt</title><meta name="robots" content="noindex,nofollow" /></Head><main className="review-page"><div className="review-form-shell"><header className="review-form-header"><span className="review-private-label"><i /> Private, one-time invitation</span><span>Shwetanshu Bhatt · Client review</span></header>{invite?.status === 'invited' ? <><div className="review-form-intro"><span>Client feedback</span><h1>How did the work <em>go?</em></h1><p>You&apos;re reviewing <strong>{invite.project_title}</strong>. Your feedback is published only after moderation.</p></div><form onSubmit={submit} className="client-review-form"><fieldset><legend>Your rating</legend><p>Select an honest overall rating.</p><div className="star-picker" role="radiogroup" aria-label="Overall rating">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" role="radio" aria-checked={rating === value} className={value <= rating ? 'is-selected' : ''} onClick={() => setRating(value)} aria-label={`${value} star${value > 1 ? 's' : ''}`}>★</button>)}</div><strong className="rating-label">{rating} out of 5</strong></fieldset><label><span>Your review</span><textarea rows={7} minLength={20} maxLength={2000} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What was delivered? What stood out about working together?" required /><small>{reviewText.length} / 2000 characters · minimum 20</small></label><label className="review-image-field"><span>Optional image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => selectImage(e.target.files?.[0])} /><small>Profile picture, company logo, or another relevant image, that would be shown to visitors. Maximum 2 MB.</small>{imageData && <div className="review-image-preview"><Image src={imageData} alt="Review attachment preview" width={640} height={360} unoptimized /><button type="button" onClick={() => setImageData('')}>Remove image</button></div>}</label><div className="review-contact-fields"><label><span>Public name</span><input value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="Your name" required /></label><label><span>Public email</span><input type="email" value={publicEmail} onChange={e => setPublicEmail(e.target.value)} placeholder="name@company.com" /></label><label><span>Public phone</span><input type="tel" value={publicPhone} onChange={e => setPublicPhone(e.target.value)} placeholder="+91 98765 43210" /></label></div><p className="contact-requirement">Add at least one contact method—email or phone—so visitors can verify the review is from a real client.</p><label className="review-consent"><input type="checkbox" checked={contactConsent} onChange={e => setContactConsent(e.target.checked)} required /><span>I confirm that my name and the contact details entered above may be shown publicly with this review.</span></label><button className="review-submit" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit verified review'}<span>→</span></button></form></> : invite ? <div className="review-state"><span>✓</span><h1>Link already used.</h1><p>This private invitation can only submit one review.</p></div> : null}{message && <p className={`review-message${!invite ? ' is-success' : ''}`}>{message}</p>}<footer className="review-form-footer"><span>Invite protected</span><span>Contact shown with consent</span></footer></div></main></>;
}
