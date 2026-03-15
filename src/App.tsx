import { useState, useCallback } from 'react';
import './index.css';

const WEBHOOK_URL = (import.meta.env.VITE_WEBHOOK_URL as string) ||
  'https://cleo.shrishtiyogaraj.com/webhook/website-that-works-sales-rep-intake';

const TOTAL_STEPS = 4;

interface FormData {
  // Step 1 — Business basics
  business_name: string;
  industry: string;
  primary_service: string;
  location: string;
  founded_year: string;
  // Step 2 — Contact details
  business_email: string;
  business_phone: string;
  google_maps_url: string;
  // Step 3 — Social proof
  star_rating: string;
  review_count: string;
  reviews_text: string;
  // Step 4 — Sales rep
  rep_name: string;
  rep_email: string;
  notes: string;
  priority: 'rush' | 'standard';
}

const EMPTY: FormData = {
  business_name: '',
  industry: '',
  primary_service: '',
  location: '',
  founded_year: '',
  business_email: '',
  business_phone: '',
  google_maps_url: '',
  star_rating: '',
  review_count: '',
  reviews_text: '',
  rep_name: '',
  rep_email: '',
  notes: '',
  priority: 'standard',
};

const INDUSTRIES = [
  'Fitness & Wellness',
  'Restaurant & Food',
  'Home Services',
  'Professional Services',
  'Retail',
  'Beauty & Personal Care',
  'Healthcare',
  'Education',
  'Hospitality',
];

export default function App() {
  const [step, setStep] = useState(1); // 1..TOTAL_STEPS = form, TOTAL_STEPS+1 = done
  const [data, setData] = useState<FormData>(EMPTY);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const advance = useCallback(() => {
    setDirection('forward');
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  }, []);

  const back = useCallback(() => {
    setDirection('back');
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  }, []);

  const set = (key: keyof FormData, value: string) =>
    setData(prev => ({ ...prev, [key]: value }));

  const submit = async () => {
    setDirection('forward');
    setSubmitStatus('loading');
    setAnimKey(k => k + 1);
    setStep(TOTAL_STEPS + 1);

    const payload = {
      businessName: data.business_name,
      industry: data.industry,
      primaryService: data.primary_service,
      location: data.location,
      foundedYear: data.founded_year,
      contactEmail: data.business_email,
      contactPhone: data.business_phone,
      googleMapsUrl: data.google_maps_url,
      starRating: data.star_rating,
      reviewCount: data.review_count,
      googleReviews: data.reviews_text,
      salesRepName: data.rep_name,
      salesRepEmail: data.rep_email,
      notes: data.notes,
      priority: data.priority,
      source: 'client-intake-form',
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('bad response');
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  };

  const retry = () => {
    setSubmitStatus('idle');
    submit();
  };

  const progress = Math.max(4, ((step - 1) / TOTAL_STEPS) * 100);
  const showChrome = step <= TOTAL_STEPS;

  return (
    <div className="form-shell">
      <div className="form-topbar">
        <a href="https://thatworksco.com" className="form-logo" target="_blank" rel="noopener noreferrer">
          That Works<span>.</span>
        </a>
        {showChrome && (
          <span className="form-step-label">
            Step <strong>{step}</strong> of {TOTAL_STEPS}
          </span>
        )}
      </div>

      {showChrome && (
        <div className="form-progress">
          <div className="form-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="form-body">
        <div
          className={`form-screen form-slide-${direction}`}
          key={animKey}
        >
          {step === 1 && (
            <Step1 data={data} set={set} onContinue={advance} />
          )}
          {step === 2 && (
            <Step2 data={data} set={set} onBack={back} onContinue={advance} />
          )}
          {step === 3 && (
            <Step3 data={data} set={set} onBack={back} onContinue={advance} />
          )}
          {step === 4 && (
            <Step4 data={data} set={set} onBack={back} onSubmit={submit} />
          )}
          {step === TOTAL_STEPS + 1 && (
            <FinalScreen status={submitStatus} onRetry={retry} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 1 — Business basics
───────────────────────────────────────────── */
function Step1({
  data, set, onContinue,
}: { data: FormData; set: (k: keyof FormData, v: string) => void; onContinue: () => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(data.founded_year, 10);
  const yearError = touched.founded_year && data.founded_year !== '' &&
    (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear)
    ? `Enter a year between 1900 and ${currentYear}`
    : null;

  const canContinue =
    data.business_name.trim() &&
    data.industry &&
    data.primary_service.trim() &&
    data.location.trim() &&
    !yearError;

  return (
    <div>
      <div className="form-step-eyebrow">New client</div>
      <h2 className="form-step-title">Business basics</h2>
      <p className="form-step-sub">Start with the essentials — name, what they do, and where they are.</p>

      <div className="form-fields">
        <div className="form-field">
          <label className="form-label">Business name</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Peak Performance Studio"
            value={data.business_name}
            onChange={e => set('business_name', e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label">Industry</label>
          <div className="form-select-wrap">
            <select
              className="form-select"
              value={data.industry}
              onChange={e => set('industry', e.target.value)}
            >
              <option value="" disabled>Select an industry…</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <p className="form-field-hint">
            Can't find the right industry? Email <a href="mailto:shrishti@thatworksco.com" className="form-field-hint-link">shrishti@thatworksco.com</a> to get one added.
          </p>
        </div>

        <div className="form-field">
          <label className="form-label">Primary service</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Personal training, Plumbing, Italian restaurant"
            value={data.primary_service}
            onChange={e => set('primary_service', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Bangalore, India"
              value={data.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Founded year
              <span className="form-label-optional">optional</span>
            </label>
            <input
              className={`form-input${yearError ? ' form-input--error' : ''}`}
              type="number"
              placeholder="e.g. 2019"
              min="1900"
              max={currentYear}
              value={data.founded_year}
              onChange={e => set('founded_year', e.target.value)}
              onBlur={() => touch('founded_year')}
            />
            {yearError && <span className="form-field-error">{yearError}</span>}
          </div>
        </div>
      </div>

      <button className="form-continue" onClick={onContinue} disabled={!canContinue}>
        Continue →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 2 — Contact details
───────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /maps\.google\.|google\.[a-z]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl/i;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

function Step2({
  data, set, onBack, onContinue,
}: { data: FormData; set: (k: keyof FormData, v: string) => void; onBack: () => void; onContinue: () => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const emailError = touched.business_email && data.business_email && !EMAIL_RE.test(data.business_email)
    ? 'Enter a valid email address'
    : null;

  const phoneError = touched.business_phone && data.business_phone && !PHONE_RE.test(data.business_phone)
    ? 'Enter a valid phone number'
    : null;

  const mapsError = touched.google_maps_url && data.google_maps_url && !URL_RE.test(data.google_maps_url)
    ? 'Paste a Google Maps link — it should contain maps.google or similar'
    : null;

  const canContinue = data.google_maps_url.trim() && !emailError && !phoneError && !mapsError;

  return (
    <div>
      <button className="form-back" onClick={onBack}>← Back</button>
      <div className="form-step-eyebrow">Step 2</div>
      <h2 className="form-step-title">Contact details</h2>
      <p className="form-step-sub">Their contact info and Maps listing — email and phone are optional, Maps link is required.</p>

      <div className="form-fields">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Business email
              <span className="form-label-optional">optional</span>
            </label>
            <input
              className={`form-input${emailError ? ' form-input--error' : ''}`}
              type="email"
              placeholder="hello@theirbusiness.com"
              value={data.business_email}
              onChange={e => set('business_email', e.target.value)}
              onBlur={() => touch('business_email')}
              autoFocus
            />
            {emailError && <span className="form-field-error">{emailError}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">
              Business phone
              <span className="form-label-optional">optional</span>
            </label>
            <input
              className={`form-input${phoneError ? ' form-input--error' : ''}`}
              type="tel"
              placeholder="+91 98000 00000"
              value={data.business_phone}
              onChange={e => set('business_phone', e.target.value)}
              onBlur={() => touch('business_phone')}
            />
            {phoneError && <span className="form-field-error">{phoneError}</span>}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Google Maps URL</label>
          <input
            className={`form-input${mapsError ? ' form-input--error' : ''}`}
            type="text"
            placeholder="Paste their Maps listing URL"
            value={data.google_maps_url}
            onChange={e => set('google_maps_url', e.target.value)}
            onBlur={() => touch('google_maps_url')}
          />
          {mapsError && <span className="form-field-error">{mapsError}</span>}
        </div>
      </div>

      <button className="form-continue" onClick={onContinue} disabled={!canContinue}>
        Continue →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 3 — Social proof
───────────────────────────────────────────── */
function Step3({
  data, set, onBack, onContinue,
}: { data: FormData; set: (k: keyof FormData, v: string) => void; onBack: () => void; onContinue: () => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const ratingNum = parseFloat(data.star_rating);
  const ratingError = touched.star_rating && data.star_rating !== '' &&
    (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5)
    ? 'Rating must be between 1 and 5'
    : null;

  const countNum = parseInt(data.review_count, 10);
  const countError = touched.review_count && data.review_count !== '' &&
    (isNaN(countNum) || countNum < 0)
    ? 'Enter a positive number'
    : null;

  const canContinue = !ratingError && !countError;

  return (
    <div>
      <button className="form-back" onClick={onBack}>← Back</button>
      <div className="form-step-eyebrow">Step 3</div>
      <h2 className="form-step-title">Social proof</h2>
      <p className="form-step-sub">Whatever's on their Google listing — rating, review count, and the reviews themselves.</p>

      <div className="form-fields">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Star rating
              <span className="form-label-optional">optional</span>
            </label>
            <input
              className={`form-input${ratingError ? ' form-input--error' : ''}`}
              type="number"
              placeholder="e.g. 4.6"
              min="1"
              max="5"
              step="0.1"
              value={data.star_rating}
              onChange={e => set('star_rating', e.target.value)}
              onBlur={() => touch('star_rating')}
              autoFocus
            />
            {ratingError && <span className="form-field-error">{ratingError}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">
              Number of reviews
              <span className="form-label-optional">optional</span>
            </label>
            <input
              className={`form-input${countError ? ' form-input--error' : ''}`}
              type="number"
              placeholder="e.g. 180"
              min="0"
              value={data.review_count}
              onChange={e => set('review_count', e.target.value)}
              onBlur={() => touch('review_count')}
            />
            {countError && <span className="form-field-error">{countError}</span>}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">
            Paste Google reviews
            <span className="form-label-optional">optional</span>
          </label>
          <p className="form-field-hint" style={{ marginBottom: 4 }}>
            These reviews inform the tone, language, and feel of the website — pick ones that best reflect how the business should come across.
          </p>
          <textarea
            className="form-textarea form-textarea--tall"
            placeholder="Copy and paste a handful of their best reviews here"
            value={data.reviews_text}
            onChange={e => set('reviews_text', e.target.value)}
          />
        </div>
      </div>

      <button className="form-continue" onClick={onContinue} disabled={!canContinue}>
        Continue →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 4 — Sales rep notes
───────────────────────────────────────────── */
function Step4({
  data, set, onBack, onSubmit,
}: { data: FormData; set: (k: keyof FormData, v: string) => void; onBack: () => void; onSubmit: () => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const repEmailError = touched.rep_email && data.rep_email && !EMAIL_RE.test(data.rep_email)
    ? 'Enter a valid email address'
    : null;

  const canSubmit = data.rep_name.trim() && data.rep_email.trim() && data.notes.trim() && !repEmailError;

  return (
    <div>
      <button className="form-back" onClick={onBack}>← Back</button>
      <div className="form-step-eyebrow">Last step</div>
      <h2 className="form-step-title">Your observations</h2>
      <p className="form-step-sub">Spend a minute on their Google listing and tell us everything you see. The more context you give, the better the site we can build.</p>

      <div className="form-fields">
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Your name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Arjun"
              value={data.rep_name}
              onChange={e => set('rep_name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label">Your email</label>
            <input
              className={`form-input${repEmailError ? ' form-input--error' : ''}`}
              type="email"
              placeholder="you@thatworksco.com"
              value={data.rep_email}
              onChange={e => set('rep_email', e.target.value)}
              onBlur={() => touch('rep_email')}
            />
            {repEmailError && <span className="form-field-error">{repEmailError}</span>}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea form-textarea--tall"
            placeholder={`Dig into their Google listing and tell us everything useful — this is the most important field on the form.\n\nWhat kind of customers are leaving reviews? What do people love most? Is there a recurring theme in the praise or complaints? What does the business seem to be proudest of? What's the vibe — premium, friendly, no-nonsense, community-focused?\n\nLook at their photos if there are any. Look at how they describe themselves. What stands out?\n\nIf you did speak to them, add anything from that too — but even without a call, there's a lot here. The more you give, the better the site.`}
            value={data.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">How urgent is this?</label>
          <div className="priority-toggle">
            <button
              type="button"
              className={`priority-card${data.priority === 'rush' ? ' priority-card--selected' : ''}`}
              onClick={() => set('priority', 'rush')}
            >
              <span className="priority-card-title">Rush</span>
              <span className="priority-card-sub">Ready in 1 hour</span>
            </button>
            <button
              type="button"
              className={`priority-card${data.priority === 'standard' ? ' priority-card--selected' : ''}`}
              onClick={() => set('priority', 'standard')}
            >
              <span className="priority-card-title">Standard</span>
              <span className="priority-card-sub">Ready in 4–5 hours</span>
            </button>
          </div>
        </div>
      </div>

      <button className="form-continue" onClick={onSubmit} disabled={!canSubmit}>
        Send this brief to Cleo →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FINAL SCREEN
───────────────────────────────────────────── */
function FinalScreen({ status, onRetry }: { status: string; onRetry: () => void }) {
  if (status === 'loading') {
    return (
      <div className="form-loading">
        <div className="form-spinner" />
        <span>Submitting…</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="form-final">
        <div className="form-final-icon form-final-icon--error">!</div>
        <h2>Something went wrong.</h2>
        <p>We couldn't send the submission. Check your connection and try again.</p>
        <button className="form-retry-btn" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  return (
    <div className="form-final">
      <div className="form-final-icon">✓</div>
      <h2>We're on it.</h2>
      <p>We're building their site. You'll get an email when it's live.</p>
    </div>
  );
}
