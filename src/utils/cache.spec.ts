import cache, { clearCache } from "./cache";

describe('Cache', () => {
  beforeEach(clearCache)

  it('should return call results', async () => {
    const mock = jest.fn().mockReturnValue({result: 1})

    const value = await cache('testKey', mock)
    expect(value).toEqual({result: 1})
  })

  it('should call fetcher only once', async () => {
    const mock = jest.fn().mockReturnValue({result: 1})

    await cache('testKey', mock)
    await cache('testKey', mock)
    await cache('testKey', mock)

    expect(mock).toBeCalledTimes(1)
  })

  it('should call fetcher if key is different', async () => {
    const mock = jest.fn().mockReturnValue({result: 1})

    await cache('testKey', mock)
    await cache('testKey', mock)
    await cache('testKey1', mock)

    expect(mock).toBeCalledTimes(2)
  })

  it('should clear cache', async () => {
    const mock = jest.fn().mockReturnValue({result: 1})

    await cache('testKey', mock)
    clearCache()
    await cache('testKey', mock)

    expect(mock).toBeCalledTimes(2)
  })
})