'use strict'
const os = require('os')
const RepoGitDiff = require('../../../../src/utils/repoGitDiff')
const child_process = require('child_process')
const { EventEmitter, Readable } = require('stream')
jest.mock('child_process', () => ({ spawn: jest.fn() }))
jest.mock('fs-extra')

const FORCEIGNORE_MOCK_PATH = '__mocks__/.forceignore'
const FORCEINCLUDE_MOCK_PATH = '__mocks__/.forceinclude'

describe(`test if repoGitDiff`, () => {
  test('can parse git correctly', async () => {
    const output = []
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignore: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('can parse git permissively', async () => {
    const output = []
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      {
        output: '',
        repo: '',
        ignore: FORCEIGNORE_MOCK_PATH,
        ignoreWhitespace: true,
      },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('can resolve deletion', async () => {
    const output = [
      'D      force-app/main/default/objects/Account/fields/awesome.field-meta.xml',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignore: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toMatchObject(output)
  })

  test('can resolve file copy when new file is added', async () => {
    const output = [
      'A      force-app/main/default/objects/Account/fields/awesome.field-meta.xml',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '' },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('can resolve file copy when file is modified', async () => {
    const output = [
      'M      force-app/main/default/objects/Account/fields/awesome.field-meta.xml',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '' },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('can filter ignored files', async () => {
    const output = ['M      force-app/main/default/lwc/jsconfig.json']
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignore: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    //should be empty
    const expected = []
    expect(work).toStrictEqual(expected)
  })

  test('can filter ignored destructive files', async () => {
    const output = ['D      force-app/main/default/lwc/jsconfig.json']
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignoreDestructive: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    //should be empty
    const expected = []
    expect(work).toStrictEqual(expected)
  })

  test('can filter ignored and ignored destructive files', async () => {
    const output = [
      'M      force-app/main/default/lwc/jsconfig.json',
      'D      force-app/main/default/lwc/jsconfig.json',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      {
        output: '',
        repo: '',
        ignore: FORCEIGNORE_MOCK_PATH,
        ignoreDestructive: FORCEIGNORE_MOCK_PATH,
      },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    //should be empty
    const expected = []
    expect(work).toStrictEqual(expected)
  })

  test('can filter deletion if only ignored is specified files', async () => {
    const output = ['D      force-app/main/default/lwc/jsconfig.json']
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignore: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    //should be empty
    const expected = []
    expect(work).toStrictEqual(expected)
  })

  test('cannot filter non deletion if only ignored destructive is specified files', async () => {
    const output = ['A      force-app/main/default/lwc/jsconfig.json']
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignoreDestructive: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('can filter sub folders', async () => {
    const output = ['M      force-app/main/default/pages/Account.page']
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '', ignore: FORCEIGNORE_MOCK_PATH },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    //should be empty
    const expected = []
    expect(work).toStrictEqual(expected)
  })

  test('can filter moved files', async () => {
    const output = [
      'D      force-app/main/default/classes/Account.cls',
      'A      force-app/account/domain/classes/Account.cls',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '' },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    const expected = [output[1]]
    expect(work).toStrictEqual(expected)
  })

  test('can filter case changed files', async () => {
    const output = [
      'D      force-app/main/default/objects/Account/fields/TEST__c.field-meta.xml',
      'A      force-app/main/default/objects/Account/fields/Test__c.field-meta.xml',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '' },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    const expected = [output[1]]
    expect(work).toStrictEqual(expected)
  })

  test('cannot filter renamed files', async () => {
    const output = [
      'D      force-app/main/default/classes/Account.cls',
      'A      force-app/main/default/classes/RenamedAccount.cls',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '' },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('cannot filter same name file with different metadata', async () => {
    const output = [
      'D      force-app/main/default/objects/Account/fields/CustomField__c.field-meta.xml',
      'A      force-app/main/default/objects/Opportunity/fields/CustomField__c.field-meta.xml',
    ]
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      { output: '', repo: '' },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getFilteredDiff()
    expect(work).toStrictEqual(output)
  })

  test('can explicitly include files', async () => {
    const output = ['force-app/main/default/lwc/jsconfig.json']

    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      {
        output: '',
        repo: '',
        include: FORCEINCLUDE_MOCK_PATH,
      },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getIncludedFiles()
    //should be empty
    const expected = ['A      force-app/main/default/lwc/jsconfig.json']
    expect(work).toStrictEqual(expected)
  })

  test('can explicitly include destructive files', async () => {
    const output = ['force-app/main/default/lwc/jsconfig.json']

    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      {
        output: '',
        repo: '',
        includeDestructive: FORCEINCLUDE_MOCK_PATH,
      },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getIncludedFiles()
    //should be empty
    const expected = ['D      force-app/main/default/lwc/jsconfig.json']
    expect(work).toStrictEqual(expected)
  })

  test('can explicitly include multiple files', async () => {
    const output = [
      'force-app/main/default/lwc/jsconfig.json',
      'force-app/main/default/staticresources/jsconfig.json',
    ]

    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      {
        output: '',
        repo: '',
        include: FORCEINCLUDE_MOCK_PATH,
      },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getIncludedFiles()
    //should be empty
    const expected = [
      'A      force-app/main/default/lwc/jsconfig.json',
      'A      force-app/main/default/staticresources/jsconfig.json',
    ]
    expect(work).toStrictEqual(expected)
  })

  test('can explicitly include destructive multiple files', async () => {
    const output = [
      'force-app/main/default/lwc/jsconfig.json',
      'force-app/main/default/staticresources/jsconfig.json',
    ]

    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(output.join(os.EOL))
          this.push(null)
          mock.emit('close')
        },
      })
      return mock
    })
    const repoGitDiff = new RepoGitDiff(
      {
        output: '',
        repo: '',
        includeDestructive: FORCEINCLUDE_MOCK_PATH,
      },
      // eslint-disable-next-line no-undef
      globalMetadata
    )
    const work = await repoGitDiff.getIncludedFiles()
    //should be empty
    const expected = [
      'D      force-app/main/default/lwc/jsconfig.json',
      'D      force-app/main/default/staticresources/jsconfig.json',
    ]
    expect(work).toStrictEqual(expected)
  })

  test('can reject in case of error', async () => {
    const expected = new Error('Test Error')
    child_process.spawn.mockImplementation(() => {
      const mock = new EventEmitter()
      mock.stdout = new Readable({
        read() {
          this.push(null)
          mock.emit('error')
        },
      })
      return mock
    })
    try {
      const repoGitDiff = new RepoGitDiff({ output: '', repo: '' }, null)
      repoGitDiff.getFilteredDiff()
    } catch (e) {
      expect(e).toBe(expected)
    }
  })
})
