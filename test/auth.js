import test from 'ava'

test('Get the first page and return a list of 16 products', async t => {
  try {
    t.true((await getProducts(1)).products.length === 16)
  } catch (e) {
    t.fail()
  }
})
