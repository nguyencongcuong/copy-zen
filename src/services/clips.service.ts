
export interface Clip {
  id: string;
  content: string;
  created_at: string;
}

class ClipsService {
  public create(content: string) {
    return {
      id: Math.random(),
      content: content,
      created_at: new Date().toISOString()
    }
  }
}

const clipsService = new ClipsService();
export { clipsService };