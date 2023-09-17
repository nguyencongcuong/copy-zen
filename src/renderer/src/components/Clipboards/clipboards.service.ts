import _ from 'lodash'

class ClipboardsService {
  public create(content: string) {
    return {
      id: _.uniqueId(),
      content: content.trim(),
      created_at: new Date().toISOString()
    }
  }
}

export default new ClipboardsService()
