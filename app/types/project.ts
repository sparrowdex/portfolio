export interface ProjectLink {
  kind: 'live' | 'code' | 'download' | 'api';
  label: string;
  href: string;
}

export interface Project {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  colors: string[];
  colorLabels: string[];
  tech: string[];
  features: string[];
  featuredHighlight?: string;
  specialBadge?: string;
  imageFallback: string;
  logo?: string;
  /** Backing colour for logo tiles (e.g. white-on-transparent logos). Defaults to white. */
  logoBg?: string;
  /** Live site / repo / download links shown in the liner notes. */
  links?: ProjectLink[];
}
