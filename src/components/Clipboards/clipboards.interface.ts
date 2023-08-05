export interface Clip {
  id: string;
  content: string;
  created_at: string;
}

export interface ClipboardProps {
  clip: Clip;
}
