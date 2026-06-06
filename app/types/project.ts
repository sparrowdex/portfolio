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
}
