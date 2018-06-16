import Server from '../src/app'

describe('Server', () => {
  let server
  describe('App', () => {
    beforeEach(() => {
      server = new Server()
    })

    it('should have service items keys', () => {
      expect(server.rootKey).toBe('000000001vGeH72LxVtxKg')
    })
  })
})
