import map from 'normalize-map'

describe('normalize-map', () => {
  it('should normalize array', () => {
    const arr = [1, 2, 3]
    const res = [
      {
        key: 1,
        val: 1
      },
      {
        key: 2,
        val: 2
      },
      {
        key: 3,
        val: 3
      }
    ]
    expect(map(arr)).to.eql(res)
  })

  it('should normalize object', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3
    }
    const res = [
      {
        key: 'a',
        val: 1
      },
      {
        key: 'b',
        val: 2
      },
      {
        key: 'c',
        val: 3
      }
    ]
    expect(map(obj)).to.eql(res)
  })
})
