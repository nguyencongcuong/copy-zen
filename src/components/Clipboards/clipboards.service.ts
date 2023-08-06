class ClipboardsService {
  public create(content: string) {
    return {
      id: Math.random(),
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
  }
}

export default new ClipboardsService();
