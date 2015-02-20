
class ResourceNotFoundError extends Error
{
  constructor(message) {
    this.name    = 'ResourceNotFoundError'
    this.message = message
    Error.captureStackTrace(this, ResourceNotFoundError)
  }
}

export default ResourceNotFoundError
