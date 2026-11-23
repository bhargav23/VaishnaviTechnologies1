/** Optional phone / WhatsApp number field shared by the site's forms. */
export function PhoneField({ value, onChange }) {
  return (
    <label className="compact-field">
      <span>
        Phone / WhatsApp <span className="optional">(optional)</span>
      </span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={20}
        pattern="\+?[0-9][0-9 \-]{8,18}"
        title="10-digit mobile number, or with country code, e.g. +91 98765 43210"
        placeholder="98765 43210"
        value={value}
        onChange={onChange}
      />
    </label>
  )
}

/**
 * Spam trap: hidden from people and screen readers, but bots that fill in
 * every field will fill this one too.
 */
export function HoneypotField({ value, onChange }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Leave this empty
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={onChange}
        />
      </label>
    </div>
  )
}
