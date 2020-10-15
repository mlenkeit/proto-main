'use strict'

module.exports = [
  {
    name: 'cwa-server',
    dest: 'dist/cwa-server',
    packageMapping: [
      { from: /^cwa\.internal$/, to: 'my-internal' },
      { from: /^cwa/, to: 'sap' }
    ],
    annotations: [
      'hello cwa-server'
    ]
  },
  {
    name: 'cwa-app-ios',
    dest: 'dist/cwa-app-ios',
    packageMapping: [
      { from: /^cwa/, to: 'sap-ios' }
    ],
    annotations: [
      'hello cwa-app-ios'
    ]
  },
  {
    name: 'cwa-app-android',
    dest: 'dist/cwa-app-android',
    annotations: [
      'hello cwa-app-android'
    ]
  }
]