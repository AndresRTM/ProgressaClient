const icons = {
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  star: <path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9Z" />,
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  ruler: (
    <>
      <path d="m3 8 5-5 13 13-5 5Z M7 7l2 2m1-5 2 2m-1 5 2 2m1-5 2 2m-1 5 2 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  edit: (
    <>
      <path d="m14 5 5 5M4 20l1-6L16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L10 19Z" />
    </>
  ),
  camera: (
    <>
      <path d="m8 6 1.5-3h5L16 6h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m3 17 5-5 4 4 3-3 6 6" />
    </>
  ),
  'rotate-ccw': (
    <>
      <path d="M3 10a9 9 0 1 1 2.4 8.2M3 4v6h6" />
    </>
  ),
  moon: <path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  'minus-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </>
  ),
  'plus-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8m-4-4v8" />
    </>
  ),
  grip: (
    <>
      <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" strokeWidth="3" />
    </>
  ),
  yoga: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M12 8v6m-4-4 4-1 4 1m-8 0-2 4H3m13-4 2 4h3" />
      <path d="m9 14-4.8 4a1.7 1.7 0 0 0 1.1 3h13.4a1.7 1.7 0 0 0 1.1-3L15 14m-7 7 7-5m1 5-7-5" />
    </>
  ),
  walking: (
    <>
      <circle cx="13" cy="4" r="1.8" />
      <path d="m7 12 3-4 3 1 3 4 3 1m-6-5-2 6-4 6m4-6 4 2 1 5" />
    </>
  ),
  padel: (
    <>
      <path d="M16.8 14.6c3.5-3.5 4.1-7.3 1.5-9.9s-6.4-2-9.9 1.5c-2.9 2.9-3.5 6.4-1.2 8.7s6.7 2.6 9.6-.3Z" />
      <path d="m8 16-4.5 4.5-2-2L6 14m4-6h.01m4-2h.01m3 3h.01m-6 3h.01m4 1h.01" />
    </>
  ),
  tennis: (
    <>
      <ellipse cx="14.5" cy="8.5" rx="6" ry="7.5" transform="rotate(42 14.5 8.5)" />
      <path d="m10 14-6 7-2-2 6-7m3-8 7 7M9 7l6 6m-5-1 6-7m-3 9 6-7" />
    </>
  ),
  hiking: (
    <>
      <circle cx="12" cy="3.5" r="1.6" />
      <path d="m10 7 3 1-2 6-3 7m3-7 3 3 1 4m-2-13 3 4 3-1m1-3-2 14M7.5 7H6l-2 6h3l2-5" />
    </>
  ),
  climbing: (
    <>
      <circle cx="12" cy="7" r="1.7" />
      <path d="m8 3-2 5 4 3 4-1 3-5m-7 6-1 5-5 2m5-2 6 1 2 5M19 2h2m-1 7h2M2 14h2" />
    </>
  ),
  football: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 8 4 3-1.5 4.5h-5L8 11Zm0 0V3m4 8 4.5-2.5m-6 7L17 20m-7.5-4.5L7 20m1-9L3.5 8.5" />
    </>
  ),
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
      <circle cx="15" cy="4" r="1.8" />
      <path d="m5 9 4 2 4-4 3 4 4 1m-7-5-3 7 5 3-1 5m-4-8-3 5H3" />
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
      <path d="m5 16 5-8 4 8H5m5-8h6l3 8M8 8h4m4-4h2l1 4" />
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
