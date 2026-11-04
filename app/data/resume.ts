/**
 * The résumé, as data. Recruiter mode and the /resume page render it, and
 * `npm run resume:pdf` prints /resume to public/assets/Sreeja-Resume.pdf,
 * so editing this file is all it takes to update every version.
 */

export const RESUME = {
  name: 'Sreeja Das',
  location: 'New Delhi, India',
  links: {
    email: 'mailto:sreejadas0405@gmail.com',
    linkedin: 'https://www.linkedin.com/in/sreeja-das/',
    github: 'https://github.com/sparrowdex',
  },
  education: [
    {
      school: 'SRM Institute of Science & Technology',
      dates: 'Aug 2023 – May 2027',
      degree: 'Bachelor of Technology in Computer Science (Core)',
      cgpa: '9.05',
      place: 'Delhi-NCR, India',
    },
  ],
  skills: [
    { group: 'Frontend & Animation', items: 'Next.js, React.js, Three.js, React Three Fiber, Framer Motion, GSAP, HTML/CSS, Tailwind CSS' },
    { group: 'Backend & Cloud', items: 'Node.js, Express, PostgreSQL (Neon), Prisma ORM, Firebase' },
    { group: 'Languages', items: 'JavaScript (ES6+), TypeScript, Python, SQL' },
    { group: 'Design & Tools', items: 'UI/UX Prototyping, Git/GitHub, Postman, Capacitor, Vite' },
  ],
  experience: [
    {
      org: 'The Diecast Store',
      link: 'https://www.thediecaststore.in/',
      dates: 'Jan 2026 – Present',
      role: 'Co-Founder & CTO (July 2026 – Present) · Lead Developer, Freelance (Jan – June 2026)',
      place: 'Remote, India',
      points: [
        'Joined as **Co-Founder & CTO** in July 2026 after building the platform as its freelance lead developer; own the product, technology roadmap and infrastructure.',
        'Architected a fully functional, serverless full-stack e-commerce platform tailored for diecast hobbyists using Next.js, TypeScript, and Prisma.',
        'Engineered a premium, responsive UI featuring Bento Grid layouts and fluid animations, successfully integrating production endpoints for payment and shipping gateways (Razorpay/Shiprocket).',
        'Shipped it as an installable PWA with push notifications; grown to **~70 users**, with a peak of **325 visitors in a single day**.',
        "Wear many hats beyond engineering: support key client deals alongside our sales co-founder, and lead the brand's creative direction.",
      ],
    },
    {
      org: 'Inner Voice',
      orgNote: '(Mental Health AI Startup)',
      dates: 'July 2025 – Present',
      role: 'Founder & Lead Developer',
      place: 'Remote, India',
      points: [
        'Architected a full-stack wellness platform utilizing Next.js and Firebase, designing an anonymous interaction model to ensure secure emotional support and accessible UX.',
        'Engineered a custom "Trusted Friends" network with complex boundary-setting logic. This feature enables supporters to visually manage their emotional availability and mitigate burnout without explicit refusal.',
        'Guided the product roadmap with a strong emphasis on UX research, interaction design, and planning migrations to proprietary LLMs.',
      ],
    },
    {
      org: 'National Informatics Centre (NIC)',
      dates: 'June 2025 – July 2025',
      role: 'Web Development Intern',
      place: 'New Delhi, India',
      points: [
        'Executed an 8-week internship within the e-Office Project Division, directly contributing to the digitalization of government workflows.',
        'Evaluated the product suite architecture to identify UI optimizations for secure, large-scale document management systems.',
      ],
    },
  ],
  projects: [
    {
      name: 'Photobooth Web App',
      link: 'https://pinkphotobooth.vercel.app/',
      date: '2026',
      stack: 'React 18, Vite, p5.js, GSAP, Capacitor',
      points: [
        'Architected a responsive, web-based retro photobooth, enabling users to stack multiple CSS filters, generate automated GIFs, and design custom photo strips.',
        'Implemented complex asynchronous camera timing and recursive animation logic using GSAP and html2canvas, ensuring seamless UI responsiveness.',
        'Leveraged Capacitor to wrap the web codebase into a native Android application, delivering a high-performance cross-platform experience.',
      ],
    },
    {
      name: 'Christmas Spirit',
      link: 'https://ghostsofchristmas.vercel.app/',
      date: 'Dec 2025',
      stack: 'JavaScript, Web Audio API, DeviceMotionEvent',
      points: [
        'Engineered an interactive web app featuring real-time microphone-triggered snowfall effects and cross-platform motion detection.',
        'Secured a **Top 10 Finish** out of 107 individuals in the 4-hour Girls Leading Tech Hackathon through this creative technical implementation.',
      ],
    },
  ],
  achievements: [
    {
      title: 'IBM Data Science Professional Certificate:',
      link: 'https://drive.google.com/file/d/1wzDpzXGAJMjgWjzBcgvFCGyCLW1gEkNR/view?usp=drive_link',
      text: '– Completed March 2026.',
    },
    {
      title: 'NPTEL Certification in Natural Language Processing:',
      link: 'https://drive.google.com/file/d/13FutgNdGxbvyVdRntQDdR3pbW8Bc-b4U/view?usp=sharing',
      text: '– Specialized in text processing and semantic analysis.',
    },
    {
      title: 'Technical Volunteer (BAJSS):',
      text: 'Mentored 20+ adolescent girls in coding (Scratch, VSCode) and digital literacy.',
    },
  ],
};
