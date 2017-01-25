import merge from 'cheap-merge'

describe('cheap-merge', () => {
  it('should act like clone', () => {
    const obj1 = {
      a: 1
    }
    const obj2 = {
      b: 2
    }
    const objResult = {
      a: 1,
      b: 2
    }
    expect(merge(obj1, obj2)).to.eql(objResult)
  })

  it('should merge first level', () => {
    const obj1 = {
      a: { b: 1 }
    }
    const obj2 = {
      a: { c: 1 }
    }
    const objResult = {
      a: { b: 1, c: 1 }
    }
    expect(merge(obj1, obj2)).to.eql(objResult)
  })

  it('should NOT merge second level', () => {
    const obj1 = {
      a: {
        b: { c: 1 }
      }
    }
    const obj2 = {
      a: {
        b: { d: 1 }
      }
    }
    const objResult = {
      a: {
        b: { d: 1 }
      }
    }
    expect(merge(obj1, obj2)).to.eql(objResult)
  })
})
