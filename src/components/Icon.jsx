const icons = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h5v-7h4v7h5V9" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4m8-4v4M4 10h16" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  activity: (
    <>
      <path d="M5 20v-5m4 5v-8m4 8v-4m4 4V9" />
      <path d="m3 11 5-5 5 4 8-8m-5 0h5v5" />
    </>
  ),
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  swim: (
    <>
      <path d="M2 6c3-5 7 5 10 0s7-5 10 0" />
      <path d="M2 12c3-5 7 5 10 0s7-5 10 0" />
      <path d="M2 18c3-5 7 5 10 0s7-5 10 0" />
    </>
  ),
  run: (
    <>
      <circle cx="15" cy="4" r="2" />
      <path d="m12 8-4 4-4-1m8-3 3 4 5 1m-8-5-2 7 5 3 1 4m-6-7-3 5H3" />
    </>
  ),
  strength: (
    <>
      <path d="M8 12h8M5 8H3v8h2m14-8h2v8h-2" />
      <rect x="5" y="5" width="3" height="14" rx="1" />
      <rect x="16" y="5" width="3" height="14" rx="1" />
    </>
  ),
  cycling: (
    <>
      <circle cx="5" cy="16" r="4" />
      <circle cx="19" cy="16" r="4" />
      <path d="m5 16 5-9 4 9H5m5-9h6l3 9M8 7h4m4-4h2l1 4" />
    </>
  ),
}

export default function Icon({ name, size = 24, className = '', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {icons[name]}
    </svg>
  )
}
