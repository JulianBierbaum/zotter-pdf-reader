import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.6 14.2c.2-1 .2-2.3 0-3.2-.5-2-2.1-3.8-4.3-4.3-1.1-.3-2.3-.3-3.3 0-.5.2-1.1.4-1.5.7L9 10.5V6.8c0-1.1-.9-2-2-2H4.5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-3l1.9 2.1c.5.5 1.1.9 1.8 1.1 2.5.8 5-1 5.8-3.5.2-.6.3-1.3.3-1.9Z" />
      <path d="M16 8.5c0-1.4 1.1-2.5 2.5-2.5S21 7.1 21 8.5c0 .4 0 .8-.1 1.2" />
    </svg>
  );
}
