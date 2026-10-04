import { Turnstile } from '@marsidev/react-turnstile';

// Site keys are public by design; the env var lets local/dev use a different one.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFCMNSFcIEw0ivSc';

/**
 * Cloudflare Turnstile check. Stays invisible unless Cloudflare needs the
 * visitor to click. Tokens are single-use, so call ref.current.reset()
 * after each submit.
 */
export function BotCheck({ ref, action, onToken }) {
  return (
    <div className="bot-check">
      <Turnstile
        ref={ref}
        siteKey={SITE_KEY}
        options={{ action, appearance: 'interaction-only', theme: 'dark' }}
        onSuccess={onToken}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
      />
    </div>
  );
}
