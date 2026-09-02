type IconName =
  | 'sun' | 'moon' | 'palette' | 'arrow' | 'tag'
  | 'spark' | 'layers' | 'pen' | 'search' | 'close' | 'compass';

const paths: Record<IconName, JSX.Element> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.7 0 2-1.3 1.2-2.2-.8-.9-.3-2.3 1-2.3H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z" />
      <circle cx="7.5" cy="11" r="1" /><circle cx="11" cy="7.5" r="1" /><circle cx="15" cy="8.5" r="1" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  tag: (
    <>
      <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  layers: <><path d="M12 3 3 8l9 5 9-5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  pen: <path d="M16 3l5 5L8 21H3v-5L16 3z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2z" /></>,
};

export default function Icon({
  name,
  className = '',
  size = 18,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
