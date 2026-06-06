import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';

export const ArmatrixModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-32 pb-32">
      <ScrollReveal>
        <div className="min-h-[60vh] flex flex-col justify-center gap-8 border-t border-white/10 pt-10">
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">{selectedProject.title}</h3>
          <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
            [ Placeholder for Armatrix case study. Unique layout coming soon! ]
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};
