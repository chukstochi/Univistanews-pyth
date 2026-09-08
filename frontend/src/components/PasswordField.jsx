import { useState } from "react";

/**
 * Drop-in replacement for a <div className="form-field"><label/><input type="password"/></div>
 * block, with a Show/Hide toggle so users can view what they typed.
 *
 * Usage:
 *   <PasswordField
 *     id="password"
 *     label="Password"
 *     value={password}
 *     onChange={(e) => setPassword(e.target.value)}
 *     autoComplete="current-password"
 *     required
 *   />
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  required = false,
  placeholder,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-field">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="password-field-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          {...rest}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={0}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
