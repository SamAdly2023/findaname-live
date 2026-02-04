import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const SearchIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const LoaderIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

export const StarIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

export const TwitterIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"></path></svg>
);

export const FacebookIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18,3.5H15A3.5,3.5 0 0,0 11.5,7V9H9V12H11.5V20.5H15.5V12H18L18.5,9H15.5V7A0.5,0.5 0 0,1 16,6.5H18V3.5Z"></path></svg>
);

export const LinkedInIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2A3.26,3.26 0 0,0 15.24,9.94C14.39,9.94 13.4,10.43 13,11.1V10.13H10V18.5H13V13.09C13,12.31 13.3,11.6 14.15,11.6C15.24,11.6 15.5,12.4 15.5,13.09V18.5H18.5M6.5,18.5H9.5V10.13H6.5V18.5M8,6.39A1.61,1.61 0 0,0 6.39,8A1.61,1.61 0 0,0 8,9.61A1.61,1.61 0 0,0 9.61,8A1.61,1.61 0 0,0 8,6.39Z"></path></svg>
);

export const InstagramIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"></path></svg>
);

export const PinterestIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 9,21.5C9.08,21.14 9.24,20.14 9.36,19.57L9.85,17.48L9.84,17.47C9.83,17.44 9.82,17.4 9.8,17.36C9.74,17.18 9.5,16.3 9.5,15.54C9.5,13.82 10.66,12.55 12.2,12.55C13.56,12.55 14.2,13.43 14.2,14.53C14.2,15.82 13.42,17.3 12.86,18.42C12.44,19.33 13.1,20.24 14.07,20.24C15.93,20.24 17.42,18.23 17.42,15.11C17.42,12.31 15.2,10.22 12.5,10.22C9.4,10.22 7.43,12.63 7.43,15.15C7.43,16.2 7.82,17.11 8.35,17.58C8.42,17.65 8.44,17.75 8.42,17.86L8.23,18.5C8.2,18.61 8.12,18.66 8,18.62C7.05,18.24 6.5,16.81 6.5,15.5C6.5,12.11 8.87,9 12.71,9C16.5,9 19.5,11.59 19.5,15.04C19.5,18.59 17.1,21.5 13.62,21.5C12.75,21.5 11.9,21.2 11.51,20.73L11,22.28C10.9,22.64 10.5,22.95 10.12,22.95C9.97,22.95 9.83,22.93 9.69,22.88C9.37,22.77 9.12,22.47 9.08,22.11C9.05,21.82 9,21.5 9,21.5C9.4,21.73 9.86,21.88 10.36,21.92C11.5,22 12.5,22 13.06,22C16.92,22 20,18.93 20,15C20,10.92 16.42,8 12.5,8A6.5,6.5 0 0,0 6,14.5C6,15.2 6.13,15.78 6.34,16.27L6.03,17.45C5.88,18.06 5.8,18.5 5.8,18.5C5.78,18.71 5.68,18.89 5.5,18.94C5.5,18.94 5.5,18.94 5.5,18.94C4.18,18.42 2.89,17.15 2.37,15.65C1.88,14.23 1.94,12.7 2.45,11.33C4.1,6.5 7.79,3.77 12,2Z"></path></svg>
);

export const BloggerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M13.8,13.2H10.2C9.54,13.2 9,12.66 9,12V10.2C9,9.54 9.54,9 10.2,9H13.8C14.46,9 15,9.54 15,10.2V12C15,12.66 14.46,13.2 13.8,13.2M16.2,16.2H12.6C11.94,16.2 11.4,15.66 11.4,15V14.4H16.2V15C16.2,15.66 15.66,16.2 15,16.2M19.8,4.2H4.2C2.99,4.2 2,5.19 2,6.4V17.6C2,18.81 2.99,19.8 4.2,19.8H19.8C21.01,19.8 22,18.81 22,17.6V6.4C22,5.19 21.01,4.2 19.8,4.2Z" />
    </svg>
);

export const GlobeIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);
