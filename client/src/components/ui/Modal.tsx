import { JSX, Show, onCleanup, onMount } from 'solid-js';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
};

export function Modal(props: ModalProps) {
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      props.onClose();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <Show when={props.isOpen}>
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose();
        }}
      >
        <div class="bg-card text-card-foreground border border-border shadow-xl rounded-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
          <button 
            onClick={props.onClose}
            class="absolute top-5 right-5 text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <h3 class="text-xl font-bold tracking-tight mb-6 pr-6">{props.title}</h3>
          
          <div class="w-full flex flex-col">
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
}
